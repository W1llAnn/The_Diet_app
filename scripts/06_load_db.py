#!/usr/bin/env python
"""Загрузка unified_foods.csv в базу данных (SQLite по умолчанию / PostgreSQL).

Идемпотентный: при повторном запуске обновляет существующие продукты
(INSERT OR REPLACE для SQLite / ON CONFLICT для PostgreSQL).

Источник: data/processed/unified_foods.csv (~31 тыс. строк) — уже содержит
gi, food_group (→ category), diabetes_label, diabetes_reason.

Запуск:
    ./.venv/Scripts/python.exe scripts/06_load_db.py            # SQLite data/diet.db
    DIET_DB_URL=postgres://... ./.venv/Scripts/python.exe scripts/06_load_db.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from diet import db

PROCESSED = ROOT / "data" / "processed"
UNIFIED_CSV = PROCESSED / "unified_foods.csv"

BATCH = 1000  # размер пакета для executemany


def load_unified() -> pd.DataFrame:
    """Грузит unified_foods.csv и приводит колонки к схеме products.

    unified_foods.csv:  source, id, name, brands, category(USDA), kcal, ...
                        ..., food_group, gi, gi_reason, diabetes_label, diabetes_reason
    В products:         category ← food_group (наша классификация).
    """
    if not UNIFIED_CSV.exists():
        raise FileNotFoundError(
            f"Нет {UNIFIED_CSV}. Сначала запустите scripts/05_build_unified.py."
        )
    df = pd.read_csv(UNIFIED_CSV)
    # food_group — наша укрупнённая категория; category в unified — исходная USDA.
    # Для БД наша классификация полезнее (по ней брался ГИ).
    df["category"] = df.get("food_group", df.get("category", ""))
    return df


def main() -> int:
    print("[db] инициализация схемы ...")
    db.init_db()

    print(f"[db] читаю {UNIFIED_CSV.name} ...")
    df = load_unified()
    print(f"[db] продуктов в файле: {len(df)}")

    # Сводка ДО загрузки
    print(f"[db] источников: {df['source'].value_counts().to_dict()}")

    print("[db] загружаю в таблицу products ...")
    with db.transaction() as conn:
        # Готовим пакеты строк для executemany — это быстрее построчной вставки.
        # Сборку значений делегируем в db.product_row_values, чтобы число колонок
        # всегда совпадало со схемой (см. _PRODUCT_COLS).
        sql = conn.upsert_product_sql()
        rows = []
        for _, r in df.iterrows():
            name = r.get("name")
            if not isinstance(name, str) or len(name.strip()) < 2:
                continue
            rows.append(db.product_row_values(r))
            if len(rows) >= BATCH:
                conn.executemany(sql, rows)
                rows = []
        if rows:
            conn.executemany(sql, rows)
        conn.commit()

    # Сводка ПОСЛЕ загрузки
    with db.connect() as conn:
        cnt = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        print(f"\n[db] ГОТОВО: products = {cnt} строк")

        print("\n[db] распределение по категориям (топ-10):")
        rows = conn.execute(
            "SELECT category, COUNT(*) AS n FROM products "
            "GROUP BY category ORDER BY n DESC LIMIT 10"
        ).fetchall()
        for cat, n in rows:
            print(f"  {cat or '(без категории)':<35} {n:>6,}")

        print("\n[db] распределение меток диабета:")
        order = ["recommended", "allowed", "caution", "forbidden"]
        rows = conn.execute(
            "SELECT diabetes_label, COUNT(*) AS n FROM products "
            "GROUP BY diabetes_label"
        ).fetchall()
        by_label = dict(rows)
        total = sum(by_label.values()) or 1
        for lab in order:
            n = by_label.get(lab, 0)
            print(f"  {lab:<13} {n:>6,}  ({n/total*100:.0f}%)")

        print("\n[db] ГИ: min/median/max")
        gi = conn.execute(
            "SELECT MIN(gi), CAST(AVG(gi) AS INT), MAX(gi) FROM products"
        ).fetchone()
        print(f"  min={gi[0]}  median≈{gi[1]}  max={gi[2]}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
