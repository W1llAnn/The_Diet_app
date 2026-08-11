"""HTTP API на FastAPI — мост между UI (web/) и доменной логикой (diet/).

Соответствие роадмапу:
    D1 — выбор фреймворка (FastAPI: асинк, автодокументация OpenAPI, типизация).
    D2 — базовые эндпоинты (products, diary, day-summary).
    D3 — эндпоинты расчётов (calculate, checks).
    D4 — аутентификация: регистрация/логин (bcrypt + JWT), эндпоинты дневника
         требуют Bearer-токен, текущий пользователь берётся из токена.
    D5 — Pydantic-схемы с enum-валидацией (diet/schemas.py), версионирование /v1.

Эндпоинты делятся на две группы:
    публичные  — /health, /v1/products*, /v1/calculate, /v1/auth/*;
    защищённые — /v1/diary, /v1/day-summary, /v1/checks (Bearer-токен).

Соединение с БД открывается на каждый запрос через `with db.connect() as conn:`
в теле эндпоинта. Это корректно для SQLite (нет shared connection между потоками)
и достаточно для MVP; в продакшене на PostgreSQL можно будет перейти на пул.

Запуск локально:
    uvicorn diet.api:app --reload
    # документация: http://127.0.0.1:8000/docs
"""

from __future__ import annotations

import math
from contextlib import asynccontextmanager, contextmanager
from datetime import date
from typing import Iterator

import pandas as pd
from fastapi import Depends, FastAPI, HTTPException, Query

from . import db
from .auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from .calculator import calculate
from .checks import check_day, check_gl_day
from .profile import UserProfile
from .schemas import (
    CalculateIn,
    CalculateOut,
    CheckOut,
    ChecksOut,
    DaySummaryOut,
    DiaryEntryIn,
    DiaryEntryOut,
    LoginIn,
    RegisterIn,
    TokenOut,
    UserOut,
)


# ───────────────────────── приложение ──────────────────────────────────────


@asynccontextmanager
async def _lifespan(app: FastAPI):
    """На старте гарантируем схему (идемпотентный init_db + миграции).

    Локально при первом запуске создаёт data/diet.db; при наличии схемы —
    no-op + добор колонок (email, password_hash). В тестах DEFAULT_DB_PATH
    monkeypatch'ится на временную БД.
    """
    db.init_db()
    yield


app = FastAPI(
    title="The Diet App API",
    description=(
        "Расчёт КБЖУ, гликемической нагрузки и проверок питания. "
        "Мост между доменной логикой (diet/) и UI Vivora (web/). "
        "Эндпоинты дневника требуют JWT (см. /v1/auth/*)."
    ),
    version="0.2.0",
    lifespan=_lifespan,
)


@app.get("/health")
def health() -> dict:
    """Проба живости для мониторинга/деплоя."""
    return {"status": "ok"}


# ───────────────────────── соединение с БД ─────────────────────────────────


@contextmanager
def conn_ctx() -> Iterator[db._Conn]:
    """Открывает соединение с БД на один запрос и коммитит в конце.

    Тонкая обёртка над db.transaction(): транзакция + явный успех, чтобы
    писать эндпоинты в одну строку `with conn_ctx() as conn: ...`.
    """
    with db.transaction() as conn:
        yield conn


# ───────────────────────── хелперы сериализации ────────────────────────────


def _clean(v):
    """Приводит значение из БД/DataFrame к JSON-совместимому виду.

    Pandas/SQLite возвращают NaN/NaT и numpy-скаляры (int64/float64) для
    пустых нутриентов — JSON их не переносит и Pydantic не сериализует
    numpy-типы, поэтому приводим к python-типам и заменяем NaN на None.
    Timestamps превращаем в ISO-строку.
    """
    if v is None:
        return None
    if hasattr(v, "item"):
        try:
            v = v.item()
        except (ValueError, AttributeError):
            pass
    if isinstance(v, float) and math.isnan(v):
        return None
    if isinstance(v, pd.Timestamp):
        return v.isoformat()
    return v


def _row_to_dict(row: pd.Series) -> dict:
    return {k: _clean(v) for k, v in row.items()}


def _user_to_out(user: dict) -> UserOut:
    """Профиль из БД → UserOut (без password_hash)."""
    return UserOut(
        id=int(user["id"]),
        name=user.get("name") or "",
        email=user.get("email"),
        sex=user["sex"],
        age=user["age"],
        weight=user["weight"],
        height=user["height"],
        activity=user["activity"],
        goal=user["goal"],
        condition_key=user["condition_key"],
        life_stage=user["life_stage"],
        formula=user["formula"],
        target_kcal=user["target_kcal"],
        protein_g=user["protein_g"],
        fat_g=user["fat_g"],
        carbs_g=user["carbs_g"],
        fiber_g=user["fiber_g"],
    )


def _token_for(user_id: int, user: dict) -> TokenOut:
    """Собирает TokenOut: access-токен + профиль."""
    return TokenOut(
        access_token=create_access_token(user_id),
        token_type="bearer",
        user=_user_to_out(user),
    )


def _profile_from(payload) -> UserProfile:
    """Общая часть: собирает UserProfile из Pydantic-схемы (CalculateIn/RegisterIn)."""
    return UserProfile(
        sex=payload.sex.value, age=payload.age, weight=payload.weight,
        height=payload.height, activity=payload.activity.value,
        goal=payload.goal.value,
    )


def _calc_norm(profile: UserProfile, payload):
    """Считает норму через calculate(), доставая enum-значения из payload."""
    return calculate(
        profile, formula=payload.formula.value,
        condition=payload.condition.value, life_stage=payload.life_stage.value,
    )


# ───────────────────────── D2: продукты (публичные) ────────────────────────


@app.get("/v1/products")
def search_products(
    search: str = Query(..., min_length=1, description="подстрока названия"),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    """Поиск продуктов по названию (case-insensitive, с кириллицей).

    Обёртка над db.search_products: приоритет «слово с начала», буст
    продуктам с заполненным КБЖУ. Публичный — без токена (поиск нужен на
    онбординге, до регистрации).
    """
    with conn_ctx() as conn:
        df = db.search_products(conn, search, limit=limit)
    if df.empty:
        return {"items": []}
    df = df.drop(columns=["name_lower"], errors="ignore")
    return {"items": [_row_to_dict(df.iloc[i]) for i in range(len(df))]}


@app.get("/v1/products/{product_id}")
def get_product(product_id: str) -> dict:
    """Карточка продукта по id. 404, если не найден."""
    with conn_ctx() as conn:
        p = db.get_product(conn, product_id)
    if p is None:
        raise HTTPException(status_code=404, detail="Продукт не найден")
    p.pop("name_lower", None)
    return {k: _clean(v) for k, v in p.items()}


# ───────────────────────── D4: аутентификация ──────────────────────────────


@app.post("/v1/auth/register", response_model=TokenOut)
def register(payload: RegisterIn) -> TokenOut:
    """Регистрация: создать профиль + посчитать норму + сохранить хеш пароля.

    Возвращает access-токен (пользователь сразу залогинен) и профиль. Email
    должен быть уникальным — иначе 409.
    """
    email = str(payload.email).lower()
    with conn_ctx() as conn:
        # уникальность email — в Python (в SQLite нет UNIQUE-индекса).
        if db.get_user_by_email(conn, email) is not None:
            raise HTTPException(
                status_code=409, detail="Пользователь с таким email уже есть"
            )
        profile = _profile_from(payload)
        result = _calc_norm(profile, payload)
        uid = db.add_user(conn, profile, result,
                          name=payload.name, email=email)
        db.set_password(conn, uid, hash_password(payload.password))
        user = db.get_user(conn, uid)
    assert user is not None  # только что создали
    return _token_for(uid, user)


@app.post("/v1/auth/login", response_model=TokenOut)
def login(payload: LoginIn) -> TokenOut:
    """Логин по email/паролю. 401 при неверных данных."""
    email = str(payload.email).lower()
    with conn_ctx() as conn:
        user = db.get_user_by_email(conn, email)
    if user is None or not verify_password(payload.password,
                                           user.get("password_hash")):
        # Единое сообщение (не раскрываем, что именно не так — немного
        # усложняет перебор email'ов).
        raise HTTPException(
            status_code=401, detail="Неверный email или пароль"
        )
    return _token_for(int(user["id"]), user)


@app.get("/v1/auth/me", response_model=UserOut)
def me(user: dict = Depends(get_current_user)) -> UserOut:
    """Текущий профиль по токену — удобно для UI при загрузке."""
    return _user_to_out(user)


# ───────────────────────── D2: дневник (защищённый) ────────────────────────


@app.post("/v1/diary", response_model=DiaryEntryOut)
def add_diary_entry(
    payload: DiaryEntryIn,
    user: dict = Depends(get_current_user),
) -> DiaryEntryOut:
    """Добавить порцию продукта в дневник текущего пользователя."""
    user_id = int(user["id"])
    day = payload.day.isoformat() if payload.day else None  # date → YYYY-MM-DD
    try:
        with conn_ctx() as conn:
            eid = db.add_entry(
                conn, user_id, payload.product_id, payload.grams,
                meal=payload.meal.value, day=day,
            )
    except Exception as e:
        msg = str(e).lower()
        if "foreign key" in msg or "constraint" in msg:
            raise HTTPException(
                status_code=404,
                detail="product_id не существует",
            ) from e
        raise HTTPException(status_code=400, detail=str(e)) from e
    return DiaryEntryOut(
        id=int(eid), product_id=payload.product_id, grams=payload.grams,
        meal=payload.meal.value,
        day=day or date.today().isoformat(),
    )


@app.get("/v1/day-summary", response_model=DaySummaryOut)
def day_summary(
    user: dict = Depends(get_current_user),
    day: date = Query(..., description="YYYY-MM-DD"),
) -> DaySummaryOut:
    """Итоги дня текущего пользователя: суммы КБЖУ + ГН, порции, проверки.

    condition берётся из профиля пользователя (диабет/ХБП/...), поэтому
    эндпоинт требует токен — без профиля проверки не имеют смысла.
    """
    user_id = int(user["id"])
    day_str = day.isoformat()
    with conn_ctx() as conn:
        totals = db.day_totals(conn, user_id, day_str)
        entries = db.entries_for_day(conn, user_id, day_str)
        condition = user.get("condition_key") or "healthy"
        target_kcal = user.get("target_kcal")
        results = check_day(totals, condition, target_kcal=target_kcal)
        gl_results = check_gl_day(totals.get("gl", 0), condition)

    return DaySummaryOut(
        day=day_str,
        totals=totals,
        entries=[_row_to_dict(entries.iloc[i]) for i in range(len(entries))],
        checks=[CheckOut(**_check_to_dict(c)) for c in results + gl_results],
    )


# ───────────────────────── D3: расчёты ─────────────────────────────────────


@app.post("/v1/calculate", response_model=CalculateOut)
def calc_norm(payload: CalculateIn) -> CalculateOut:
    """Рассчитать норму КБЖУ для профиля без сохранения.

    Публичный — этот расчёт нужен на онбординге UI (показать норму до того,
    как пользователь решит регистрироваться).
    """
    profile = _profile_from(payload)
    result = _calc_norm(profile, payload)
    out = CalculateOut(warnings=result.warnings,
                       bmr=round(result.bmr), tdee=round(result.tdee))
    # summary() даёт русские названия полей; подмешиваем их в модель.
    # CalculateOut с extra='allow' пропустит их через сериализацию.
    for k, v in result.summary().items():
        setattr(out, k, v)
    return out


@app.get("/v1/checks", response_model=ChecksOut)
def checks(
    user: dict = Depends(get_current_user),
    day: date = Query(..., description="YYYY-MM-DD"),
) -> ChecksOut:
    """Только проверки дня для текущего пользователя: микроэлементы + ГН.

    Достаём totals и condition из БД, прогоняем check_day и check_gl_day.
    Для сырых итогов есть /day-summary.
    """
    user_id = int(user["id"])
    day_str = day.isoformat()
    with conn_ctx() as conn:
        totals = db.day_totals(conn, user_id, day_str)
        condition = user.get("condition_key") or "healthy"
        target_kcal = user.get("target_kcal")
        results = check_day(totals, condition, target_kcal=target_kcal)
        gl_results = check_gl_day(totals.get("gl", 0), condition)

    return ChecksOut(
        day=day_str,
        condition=condition,
        checks=[CheckOut(**_check_to_dict(c)) for c in results + gl_results],
    )


def _check_to_dict(c) -> dict:
    """CheckResult → словарь для JSON."""
    return {
        "level": c.level,
        "nutrient": c.nutrient,
        "value": c.value,
        "limit": c.limit,
        "message": c.message,
    }


# ───────────────────────── запуск ──────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("diet.api:app", host="127.0.0.1", port=8000, reload=True)
