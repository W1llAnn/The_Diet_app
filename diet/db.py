"""Единый слой доступа к базе данных (SQLite локально / PostgreSQL в проде).

Один API, под капотом выбирается движок:
    - нет DIET_DB_URL → SQLite, файл data/diet.db (без сервера, для разработки);
    - есть DIET_DB_URL (postgres://...) → PostgreSQL (psycopg, ленивый импорт).

SQL-диалекты совместимы на ~95%; отличия вынесены в методы connection-обёртки:
    - автоинкремент PK:      INTEGER AUTOINCREMENT (sqlite) ↔ SERIAL (pg)
    - upsert продукта:       INSERT OR REPLACE     (sqlite) ↔ ON CONFLICT (pg)
    - текущее время в DDL:   strftime(...)         (sqlite) ↔ now() (pg)
    - ILIKE:                 LIKE (case-insensitive в sqlite) ↔ ILIKE в pg

ГН не хранится — считается на лету в day_totals() через diet.gi.glycemic_load.
"""

from __future__ import annotations

import os
import re
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_SQL = Path(__file__).resolve().parent / "schema.sql"
DEFAULT_DB_PATH = ROOT / "data" / "diet.db"

# Колонки нутриентов на 100 г (совпадает с food_db.NUTRIENT_COLS).
NUTRIENT_COLS = [
    "kcal", "protein_g", "fat_g", "carbs_g", "fiber_g", "sugars_g",
    "sat_fat_g", "sodium_mg", "potassium_mg", "phosphorus_mg",
    "calcium_mg", "iron_mg", "vitc_mg",
]


def _db_url() -> str | None:
    """URL подключения из окружения (None = локальный SQLite)."""
    return os.environ.get("DIET_DB_URL") or None


def _is_postgres() -> bool:
    url = _db_url()
    return bool(url and url.startswith(("postgres", "postgresql")))


class _Conn:
    """Тонкая обёртка над sqlite3 / psycopg-соединением.

    Даёт единый интерфейс для диалектно-зависимых операций, чтобы остальной
    код работал одинаково с обоими движками.
    """

    def __init__(self, raw):
        self._raw = raw

    # контекстный менеджер — чтобы connect() работал через `with`.
    def __enter__(self) -> _Conn:
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        # При отсутствии ошибки — коммитим; иначе откатываемся.
        if exc_type is None:
            try:
                self._raw.commit()
            except Exception:
                pass
        elif hasattr(self._raw, "rollback"):
            try:
                self._raw.rollback()
            except Exception:
                pass
        self.close()

    # базовые операции — прокси к DBAPI-интерфейсу (есть и в sqlite3, и в psycopg)
    def execute(self, sql: str, params: tuple | None = None):
        cur = self._raw.cursor()
        cur.execute(sql, params or ())
        return cur

    def executemany(self, sql: str, params_seq):
        cur = self._raw.cursor()
        cur.executemany(sql, params_seq)
        return cur

    def commit(self):
        self._raw.commit()

    def close(self):
        self._raw.close()

    # диалектно-зависимые хелперы ──────────────────────────────────────────
    def upsert_product_sql(self) -> str:
        """SQL для вставки/обновления продукта по id."""
        if _is_postgres():
            conf = ", ".join(f"{c}=EXCLUDED.{c}" for c in _PRODUCT_COLS)
            return (
                f"INSERT INTO products ({', '.join(_PRODUCT_COLS)}) "
                f"VALUES ({', '.join(['%s'] * len(_PRODUCT_COLS))}) "
                f"ON CONFLICT (id) DO UPDATE SET {conf}"
            )
        ph = ", ".join(["?"] * len(_PRODUCT_COLS))
        return (
            f"INSERT OR REPLACE INTO products ({', '.join(_PRODUCT_COLS)}) "
            f"VALUES ({ph})"
        )

    def search_products_sql(self) -> str:
        """SQL поиска по подстроке названия (case-insensitive).

        Ищем по колонке name_lower (name в нижнем регистре, заполняется в
        Python при миграции). SQL lower() в SQLite не работает с кириллицей,
        поэтому храним предопущенную колонку и фильтруем как LIKE — это
        диалектно-нейтрально (в PostgreSQL ILIKE тоже можно, но LIKE по
        name_lower работает одинаково).

        Достаёт широкую выборку кандидатов; финальная сортировка по рангу
        «начало слова vs просто подстрока» делается в Python (см.
        search_products). Берём с запасом (×20 от limit), потом режем.
        """
        ph = "%s" if _is_postgres() else "?"
        return (
            f"SELECT * FROM products WHERE name_lower LIKE {ph} LIMIT %s"
            if _is_postgres()
            else f"SELECT * FROM products WHERE name_lower LIKE {ph} LIMIT ?"
        )

    def last_insert_id(self) -> int:
        """id последней вставленной строки (для AUTOINCREMENT/SERIAL)."""
        if _is_postgres():
            cur = self.execute("SELECT lastval()")
            return int(cur.fetchone()[0])
        return int(self._raw.execute("SELECT last_insert_rowid()").fetchone()[0])


# Колонки products в порядке вставки (id первым).
# name_lower идёт сразу после name — хранит name в нижнем регистре для поиска
# (SQL lower() в SQLite не работает с кириллицей, поэтому опускаем в Python).
_PRODUCT_COLS = [
    "id", "source", "orig_id", "name", "name_lower", "brands", "category",
    "gi", "gi_reason", "diabetes_label", "diabetes_reason",
] + NUTRIENT_COLS


def connect(path: Path | str | None = None) -> _Conn:
    """Открыть соединение с БД.

    Без аргумента: SQLite по умолчанию (data/diet.db) либо PostgreSQL по
    DIET_DB_URL. path — для тестов: временный файл SQLite.
    """
    url = _db_url()
    if url and _is_postgres():
        try:
            import psycopg  # noqa: F401  (ленивый импорт — зависимость прод-режима)
        except ImportError as e:
            raise RuntimeError(
                "DIET_DB_URL указывает на PostgreSQL, но psycopg не установлен. "
                "Установите: pip install psycopg[binary]"
            ) from e
        conn = psycopg.connect(url, autocommit=False)
        return _Conn(conn)

    # SQLite
    db_path = str(path) if path is not None else str(DEFAULT_DB_PATH)
    raw = sqlite3.connect(db_path)
    # Включаем внешние ключи (по умолчанию выключены в sqlite).
    raw.execute("PRAGMA foreign_keys = ON")
    return _Conn(raw)


@contextmanager
def transaction(path: Path | str | None = None) -> Iterator[_Conn]:
    """Контекстный менеджер: соединение с авто-коммитом/rollback.

    Использование:
        with transaction() as conn:
            conn.execute(...)
    """
    conn = connect(path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn._raw.rollback() if hasattr(conn._raw, "rollback") else None
        raise
    finally:
        conn.close()


def init_db(path: Path | str | None = None) -> None:
    """Создать таблицы из schema.sql, если их нет (идемпотентно).

    DDL в schema.sql написан для SQLite (AUTOINCREMENT, strftime).
    Для PostgreSQL адаптируем синтаксис на лету.
    """
    ddl = SCHEMA_SQL.read_text(encoding="utf-8")
    if _is_postgres():
        ddl = _adapt_ddl_for_postgres(ddl)

    with transaction(path) as conn:
        # SQLite выполняет несколько команд через cursor.execute только по одной;
        # executescript есть только у sqlite3.Connection, не у cursor.
        raw = conn._raw
        if isinstance(raw, sqlite3.Connection):
            raw.executescript(ddl)
        else:
            # PostgreSQL: выполняем каждый оператор отдельно.
            for stmt in _split_sql(ddl):
                conn.execute(stmt)
        # Миграции: добираем колонки, добавленные в schema.sql после того, как
        # БД уже была создана. CREATE TABLE IF NOT EXISTS не обновляет схему
        # существующих таблиц, поэтому для свежих колонок (email, password_hash
        # — D4 аутентификация) делаем ALTER TABLE ADD COLUMN, терпимо относясь
        # к «колонка уже есть» (идемпотентность).
        _migrate(conn)
        conn.commit()


def _migrate(conn: _Conn) -> None:
    """Добор колонок, добавленных в схему после релиза.

    Каждая колонка добавляется через ALTER TABLE ADD COLUMN; если она уже
    существует — игнорируем ошибку. Работает и для SQLite, и для PostgreSQL.
    Список миграций растёт по мере эволюции схемы.
    """
    migrations = [
        # (table, column, column-def)
        ("users", "email", "TEXT DEFAULT NULL"),
        ("users", "password_hash", "TEXT DEFAULT NULL"),
    ]
    for table, column, coldef in migrations:
        if not _column_exists(conn, table, column):
            try:
                conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {coldef}")
            except Exception:
                # На конкурентном старте двух процессов один добавит колонку,
                # второй упадёт — это нормально, колонка в итоге появится.
                pass


def _column_exists(conn: _Conn, table: str, column: str) -> bool:
    """Есть ли колонка в таблице (диалектно-нейтрально через PRAGMA/information_schema)."""
    if _is_postgres():
        cur = conn.execute(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = %s AND column_name = %s",
            (table, column),
        )
        return cur.fetchone() is not None
    cur = conn.execute(f"PRAGMA table_info({table})")
    # PRAGMA table_info: строки (cid, name, type, notnull, dflt_value, pk).
    return any(row[1] == column for row in cur.fetchall())


def _adapt_ddl_for_postgres(ddl: str) -> str:
    """Адаптирует SQLite-ориентированный DDL под синтаксис PostgreSQL."""
    # AUTOINCREMENT не нужен для SERIAL (тип уже INTEGER PRIMARY KEY →
    # в pg меняем на SERIAL). Делаем замену для строк CREATE TABLE users/diary.
    ddl = re.sub(
        r"INTEGER PRIMARY KEY AUTOINCREMENT",
        "SERIAL PRIMARY KEY",
        ddl,
    )
    # strftime('%Y-%m-%dT%H:%M:%SZ','now') → now()::timestamp
    ddl = re.sub(
        r"strftime\('%Y-%m-%dT%H:%M:%SZ','now'\)",
        "to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')",
        ddl,
    )
    return ddl


def _split_sql(sql: str) -> list[str]:
    """Разбивает SQL-скрипт на операторы (по ';'), игнорируя точки с запятой
    внутри строковых литералов. Простой splitter — достаточно для нашего DDL."""
    out, buf, in_str = [], [], False
    for ch in sql:
        if ch == "'":
            in_str = not in_str
        buf.append(ch)
        if ch == ";" and not in_str:
            stmt = "".join(buf).strip()
            if stmt:
                out.append(stmt)
            buf = []
    tail = "".join(buf).strip()
    if tail:
        out.append(tail)
    return out


# ───────────────────────── products ──────────────────────────────────────

def make_product_id(source: str, orig_id: str | int) -> str:
    """Детерминированный id продукта: '{source}-{orig_id}'."""
    return f"{source}-{orig_id}"


def product_row_values(row: dict | pd.Series) -> tuple:
    """Собирает кортеж значений продукта в порядке _PRODUCT_COLS.

    Общий хелпер для upsert_product (одиночная вставка) и батч-загрузки
    в скриптах (executemany), чтобы они не разошлись по числу колонок.
    """
    name = row.get("name", "") or ""
    values = [make_product_id(row["source"], row["id"]),
              row["source"], str(row.get("id")), name, name.lower(),
              row.get("brands", "") or "", row.get("category", "") or "",
              _to_int(row.get("gi")),
              row.get("gi_reason", "") or "",
              row.get("diabetes_label", "") or "",
              row.get("diabetes_reason", "") or ""]
    values += [_to_float(row.get(c)) for c in NUTRIENT_COLS]
    return tuple(values)


def upsert_product(conn: _Conn, row: dict | pd.Series) -> str:
    """Вставить/обновить продукт из словаря/строки DataFrame.

    Возвращает id продукта. None-значения нутриентов сохраняются как NULL.
    """
    pid = make_product_id(row["source"], row["id"])
    conn.execute(conn.upsert_product_sql(), product_row_values(row))
    return pid


def get_product(conn: _Conn, product_id: str) -> dict | None:
    """Вернуть продукт по id как словарь, или None."""
    ph = "%s" if _is_postgres() else "?"
    cur = conn.execute(f"SELECT * FROM products WHERE id = {ph}", (product_id,))
    cols = [d[0] for d in cur.description]
    row = cur.fetchone()
    return dict(zip(cols, row)) if row else None


def search_products(conn: _Conn, query: str, limit: int = 20) -> pd.DataFrame:
    """Поиск по названию (case-insensitive) с приоритетом «слово с начала».

    Сначала SQL достаёт широкую выборку по подстроке, затем Python
    досортировывает: сначала продукты, где запрос — начало названия, потом
    где запрос — отдельное слово, потом где просто подстрока; внутри каждой
    группы — короче название (= точнее совпадение). Так «рис» даёт «Рис …»,
    а не «ирис/Криспер».

    Дополнительно: продукты с полным КБЖУ и низким ГИ (лучшие для диабета)
    получают небольшой буст, чтобы полезные варианты всплывали вверх.
    """
    ql = query.lower().strip()
    if not ql:
        return pd.DataFrame()
    # Широкая выборка — потом режем в Python до limit.
    fetch_n = max(limit * 20, 100)
    sql = conn.search_products_sql()
    cur = conn.execute(sql, (f"%{ql}%", fetch_n))
    cols = [d[0] for d in cur.description]
    rows = cur.fetchall()
    if not rows:
        return pd.DataFrame(columns=cols)

    df = pd.DataFrame(rows, columns=cols)

    def _rank(name) -> int:
        n = str(name).lower()
        if n.startswith(ql):
            return 0  # запрос в начале названия — лучшее совпадение
        parts = re.split(r"[\s,()-]+", n)
        if any(p.startswith(ql) for p in parts):
            return 1  # запрос — начало одного из слов
        return 2  # просто подстрока

    df["_rank"] = df["name"].apply(_rank)
    # Буст продуктам с заполненным КБЖУ — у OFF много записей с пустыми
    # нутриентами, а для расчёта порций/ГН нужны углеводы и калории.
    # ВАЖНО: заполненность важнее идеального совпадения имени — лучше выдать
    # «рис шлифованный» с углеводами, чем «рис Краснодарский» без них.
    kbju_cols = ["kcal", "protein_g", "fat_g", "carbs_g"]
    df["_has_kbju"] = df[kbju_cols].notna().all(axis=1).astype(int)
    df = df.sort_values(["_has_kbju", "_rank", "name"],
                        ascending=[False, True, True])
    return df.drop(columns=["_rank", "_has_kbju"]).head(limit).reset_index(drop=True)


# ───────────────────────── users ─────────────────────────────────────────

def add_user(conn: _Conn, profile, result, name: str = "",
             email: str | None = None) -> int:
    """Сохранить профиль + рассчитанные нормы (NutritionResult) в users.

    profile — UserProfile; result — NutritionResult из calculate().
    email — опционально, для регистрации с логином (пароль задаётся отдельно
    через set_password, т.к. хеширование — отдельная забота слоя auth).
    Возвращает id нового пользователя.
    """
    cols = [
        "name", "email", "sex", "age", "weight", "height", "activity", "goal",
        "condition_key", "life_stage", "formula",
        "target_kcal", "protein_g", "fat_g", "carbs_g", "fiber_g",
    ]
    vals = [
        name, email, profile.sex, profile.age, profile.weight, profile.height,
        profile.activity, profile.goal, result.condition, result.life_stage,
        result.formula, result.target_kcal, result.protein_g, result.fat_g,
        result.carbs_g, result.fiber_g,
    ]
    ph = ", ".join(["%s"] * len(cols)) if _is_postgres() else ", ".join(["?"] * len(cols))
    colstr = ", ".join(cols)
    returning = " RETURNING id" if _is_postgres() else ""
    cur = conn.execute(
        f"INSERT INTO users ({colstr}) VALUES ({ph}){returning}",
        tuple(vals),
    )
    if _is_postgres():
        return int(cur.fetchone()[0])
    return conn.last_insert_id()


def get_user(conn: _Conn, user_id: int) -> dict | None:
    """Профиль пользователя по id, или None."""
    ph = "%s" if _is_postgres() else "?"
    cur = conn.execute(f"SELECT * FROM users WHERE id = {ph}", (user_id,))
    cols = [d[0] for d in cur.description]
    row = cur.fetchone()
    return dict(zip(cols, row)) if row else None


def get_user_by_email(conn: _Conn, email: str) -> dict | None:
    """Профиль пользователя по email (для логина), или None.

    Сравнение регистронезависимое — типично для email-логинов. Уникальность
    email в SQLite не обеспечена схемой (нет UNIQUE-индекса), поэтому при
    регистрации дополнительно проверяем отсутствие в Python.
    """
    op = "ILIKE" if _is_postgres() else "LIKE"
    ph = "%s" if _is_postgres() else "?"
    cur = conn.execute(
        f"SELECT * FROM users WHERE email {op} {ph} LIMIT 1", (email,)
    )
    cols = [d[0] for d in cur.description]
    row = cur.fetchone()
    return dict(zip(cols, row)) if row else None


def set_password(conn: _Conn, user_id: int, password_hash: str) -> None:
    """Сохранить bcrypt-хеш пароля для пользователя."""
    ph = "%s" if _is_postgres() else "?"
    conn.execute(
        f"UPDATE users SET password_hash = {ph} WHERE id = {ph}",
        (password_hash, user_id),
    )


# ───────────────────────── diary_entries ─────────────────────────────────

def add_entry(conn: _Conn, user_id: int, product_id: str, grams: float,
              meal: str = "snack", day: str | None = None) -> int:
    """Добавить запись дневника (порцию продукта).

    day — 'YYYY-MM-DD'; если None, берётся сегодня (UTC).
    """
    if day is None:
        day = _today_utc()
    cols = ["user_id", "product_id", "grams", "meal", "day"]
    vals = [user_id, product_id, grams, meal, day]
    ph = ", ".join(["%s"] * len(cols)) if _is_postgres() else ", ".join(["?"] * len(cols))
    colstr = ", ".join(cols)
    returning = " RETURNING id" if _is_postgres() else ""
    cur = conn.execute(
        f"INSERT INTO diary_entries ({colstr}) VALUES ({ph}){returning}",
        tuple(vals),
    )
    if _is_postgres():
        return int(cur.fetchone()[0])
    return conn.last_insert_id()


def entries_for_day(conn: _Conn, user_id: int, day: str) -> pd.DataFrame:
    """Все записи пользователя за указанный день с joined нутриентами продукта."""
    if _is_postgres():
        sql = (
            "SELECT e.id, e.user_id, e.product_id, e.grams, e.meal, e.day, "
            "e.created_at, p.name, p.source, p.category, p.gi, p.diabetes_label, "
            + ", ".join(f"p.{c}" for c in NUTRIENT_COLS) +
            " FROM diary_entries e JOIN products p ON p.id = e.product_id "
            "WHERE e.user_id = %s AND e.day = %s ORDER BY e.id"
        )
    else:
        sql = (
            "SELECT e.id, e.user_id, e.product_id, e.grams, e.meal, e.day, "
            "e.created_at, p.name, p.source, p.category, p.gi, p.diabetes_label, "
            + ", ".join(f"p.{c}" for c in NUTRIENT_COLS) +
            " FROM diary_entries e JOIN products p ON p.id = e.product_id "
            "WHERE e.user_id = ? AND e.day = ? ORDER BY e.id"
        )
    cur = conn.execute(sql, (user_id, day))
    cols = [d[0] for d in cur.description]
    # Для postgres/одинаковых имён колонок убираем префикс 'p.'
    cols = [c.split(".")[-1] for c in cols]
    return pd.DataFrame(cur.fetchall(), columns=cols)


def day_totals(conn: _Conn, user_id: int, day: str) -> dict:
    """Итоги дня: сумма КБЖУ + клетчатки + сахаров и ГН.

    ГН считается на лету: для каждой порции gi/100 * carbs_g * grams/100,
    затем суммируется. Продукты без carbs/gi дают ГН≈0.

    Возвращает словарь с ключами NUTRIENT_COLS + 'gl' (гликемическая нагрузка).
    """
    entries = entries_for_day(conn, user_id, day)
    totals = {c: 0.0 for c in NUTRIENT_COLS}
    gl = 0.0
    # Локальный импорт — чтобы gi.py мог импортировать db.py без цикла.
    from .gi import glycemic_load

    for _, r in entries.iterrows():
        factor = (r["grams"] or 0) / 100.0
        for c in NUTRIENT_COLS:
            v = r.get(c)
            if v is not None and not pd.isna(v):
                totals[c] += v * factor
        gi = r.get("gi") or 0
        carbs = r.get("carbs_g")
        if carbs is not None and not pd.isna(carbs):
            gl += glycemic_load(gi, carbs, r["grams"])

    totals["gl"] = round(gl, 1)
    # Округляем нутриенты для аккуратного вывода.
    return {c: round(v, 1) for c, v in totals.items()}


def day_history(conn: _Conn, user_id: int, days: int = 7) -> pd.DataFrame:
    """Итоги за последние N дней (от сегодня назад).

    Возвращает DataFrame: day, kcal, protein_g, fat_g, carbs_g, fiber_g, gl.
    """
    today = _today_utc()
    rows = []
    for i in range(days):
        # Простая арифметика дат строкой — работает для YYYY-MM-DD.
        d = _shift_days(today, -i)
        totals = day_totals(conn, user_id, d)
        rows.append({
            "day": d,
            "kcal": totals.get("kcal", 0),
            "protein_g": totals.get("protein_g", 0),
            "fat_g": totals.get("fat_g", 0),
            "carbs_g": totals.get("carbs_g", 0),
            "fiber_g": totals.get("fiber_g", 0),
            "gl": totals.get("gl", 0),
        })
    return pd.DataFrame(rows).sort_values("day").reset_index(drop=True)


def meal_totals(conn: _Conn, user_id: int, day: str, meal: str) -> dict:
    """Итоги одного приёма пищи (для проверки ГН за приём).

    Возвращает словарь нутриентов + 'gl', как day_totals, но по одному meal.
    """
    entries = entries_for_day(conn, user_id, day)
    entries = entries[entries["meal"] == meal]
    totals = {c: 0.0 for c in NUTRIENT_COLS}
    gl = 0.0
    from .gi import glycemic_load

    for _, r in entries.iterrows():
        factor = (r["grams"] or 0) / 100.0
        for c in NUTRIENT_COLS:
            v = r.get(c)
            if v is not None and not pd.isna(v):
                totals[c] += v * factor
        gi = r.get("gi") or 0
        carbs = r.get("carbs_g")
        if carbs is not None and not pd.isna(carbs):
            gl += glycemic_load(gi, carbs, r["grams"])

    totals["gl"] = round(gl, 1)
    return {c: round(v, 1) for c, v in totals.items()}


# ───────────────────────── хелперы ───────────────────────────────────────

def _to_float(v) -> float | None:
    """Приводит к float, оставляя None для NA/пустых значений."""
    if v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if pd.isna(f):
        return None
    return f


def _to_int(v) -> int:
    """Приводит к int (ГИ и т.п.); None → 0."""
    if v is None:
        return 0
    try:
        return int(round(float(v)))
    except (TypeError, ValueError):
        return 0


def _today_utc() -> str:
    """Текущая дата UTC в 'YYYY-MM-DD'."""
    return pd.Timestamp.now("UTC").strftime("%Y-%m-%d")


def _shift_days(day: str, delta: int) -> str:
    """Сдвиг даты 'YYYY-MM-DD' на delta дней."""
    return (pd.Timestamp(day) + pd.Timedelta(days=delta)).strftime("%Y-%m-%d")
