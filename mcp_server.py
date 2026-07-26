"""MCP-сервер для пакета diet.

Оборачивает расчёт КБЖУ, поиск продуктов и проверки дневника в инструменты MCP,
доступные из любого MCP-клиента (ZCode и др.). Транспорт — stdio.

Запускается ZCode по команде из конфига (см. ~/.zcode/cli/config.json),
абсолютные пути в конфиге позволяют серверу работать из любой директории.

Инструменты:
    - calculate_kbju:   норма калорий, БЖУ и клетчатки под профиль + болезнь.
    - list_options:     допустимые значения activity/goal/condition/life_stage/formula.
    - search_products:  поиск по локальной базе (USDA + Open Food Facts).
    - check_meal_limits: проверки накопленных за день нутриентов против лимитов болезни.
    - suggest_foods:    подбор продуктов, чтобы добрать норму по нутриенту.
"""

from __future__ import annotations

import os
import sys
from dataclasses import asdict

# Сделать `import diet` рабочим из любой рабочей директории:
# сервер может запускаться ZCode не из корня проекта.
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from mcp.server.fastmcp import FastMCP  # noqa: E402

from diet import (  # noqa: E402
    ACTIVITY_LEVELS,
    CONDITIONS,
    GOALS,
    LIFE_STAGES,
    NUTRIENT_COLS,
    VALID_FORMULAS,
    UserProfile,
    calculate,
    check_day,
    load_foods,
    search,
    suggest,
)

server = FastMCP("diet")

# Ленивый кэш базы продуктов: тяжёлая загрузка CSV — только когда нужна
# (search_products / suggest_foods). calculate_kbju и list_options остаются
# мгновенными и не зависят от наличия CSV с продуктами.
_foods_cache = None


def _foods():
    global _foods_cache
    if _foods_cache is None:
        _foods_cache = load_foods()
    return _foods_cache


def _df_to_records(df) -> list[dict]:
    """DataFrame → list[dict] с заменой pandas NaN на None (JSON-совместимо).

    NaN/NA в столбцах нутриентов (нет данных в источнике) иначе ломают
    JSON-сериализацию ответа MCP.
    """
    import math

    out = []
    for row in df.to_dict(orient="records"):
        clean = {}
        for k, v in row.items():
            if isinstance(v, float) and math.isnan(v):
                clean[k] = None
            else:
                clean[k] = v
        out.append(clean)
    return out


def _profile_from_args(sex, age, weight, height, activity, goal):
    """Собирает UserProfile, пробрасывая ошибку валидации наружу."""
    return UserProfile(
        sex=sex, age=age, weight=weight, height=height,
        activity=activity, goal=goal,
    )


# --- Инструменты ---------------------------------------------------------------

@server.tool()
def calculate_kbju(
    sex: str,
    age: int,
    weight: float,
    height: float,
    activity: str,
    goal: str,
    formula: str = "who",
    condition: str = "healthy",
    life_stage: str = "default",
) -> dict:
    """Считает суточную норму калорий, БЖУ и рекомендуемой клетчатки.

    Аргументы:
        sex: "male" / "female"
        age: полных лет (10-120)
        weight: кг (30-400)
        height: см (100-250)
        activity: ключ из list_options()["activity"] (напр. "light_strength")
        goal: "maintain" / "lose" / "gain"
        formula: "who" / "mifflin" (по умолчанию "who")
        condition: нозологическая группа ("healthy"/"diabetes_t2"/"obesity"/"ckd"/"cvd")
        life_stage: стадия жизни ("default"/"athlete_endurance"/"athlete_strength"/
                    "older_adult"/"pregnant"/"lactating")

    Возвращает summary (КБЖУ, клетчатка, BMR/TDEE, метки) + warnings.
    """
    try:
        profile = _profile_from_args(sex, age, weight, height, activity, goal)
        result = calculate(
            profile, formula=formula, condition=condition, life_stage=life_stage
        )
        out = result.summary()
        out["warnings"] = list(result.warnings)
        return out
    except (ValueError, KeyError) as e:
        return {"error": str(e)}


@server.tool()
def list_options() -> dict:
    """Допустимые значения для аргументов calculate_kbju и др.

    Возвращает словари ключ → читаемая метка (или просто список для formula).
    """
    return {
        "activity": {k: v["label"] for k, v in ACTIVITY_LEVELS.items()},
        "goal": {k: v["label"] for k, v in GOALS.items()},
        "condition": {k: v["label"] for k, v in CONDITIONS.items()},
        "life_stage": {k: v["label"] for k, v in LIFE_STAGES.items()},
        "formula": list(VALID_FORMULAS),
    }


@server.tool()
def search_products(query: str, limit: int = 15) -> list[dict]:
    """Поиск по локальной базе продуктов (USDA + Open Food Facts).

    Аргументы:
        query: часть названия (рус/англ), напр. "творог", "chicken", "хлеб"
        limit: сколько вернуть (по умолчанию 15)

    Возвращает список продуктов с КБЖУ и клетчаткой на 100 г.
    """
    try:
        found = search(_foods(), query, limit=limit)
        cols = ["name", "source", "brands", "kcal", "protein_g",
                "fat_g", "carbs_g", "fiber_g"]
        cols = [c for c in cols if c in found.columns]
        return _df_to_records(found[cols])
    except FileNotFoundError as e:
        return [{"error": str(e)}]
    except Exception as e:
        return [{"error": f"{type(e).__name__}: {e}"}]


@server.tool()
def check_meal_limits(
    day_totals: dict,
    condition: str,
    target_kcal: float | None = None,
) -> list[dict]:
    """Проверяет накопленные за день нутриенты против дневных лимитов болезни.

    Аргументы:
        day_totals: словарь {nutrient: amount} за день. Ключи из NUTRIENT_COLS:
                    sugars_g, sodium_mg, potassium_mg, phosphorus_mg, sat_fat_g и т.д.
        condition: нозологическая группа ("diabetes_t2", "ckd", "cvd", ...)
        target_kcal: целевая калорийность (для пересчёта sat_fat_pct в граммы).
                     Можно опустить, если насыщ. жиры не проверяются.

    Возвращает список предупреждений о превышении лимитов (пусто = всё в норме).
    """
    try:
        results = check_day(day_totals, condition, target_kcal=target_kcal)
        return [asdict(r) for r in results]
    except (ValueError, KeyError) as e:
        return [{"error": str(e)}]


@server.tool()
def suggest_foods(
    nutrient: str,
    target_grams: float,
    condition: str,
    top: int = 5,
    target_kcal: float | None = None,
) -> list[dict]:
    """Подбирает продукты, чтобы добрать норму по нутриенту.

    Аргументы:
        nutrient: ключ нутриента, напр. "protein_g", "fiber_g", "carbs_g", "fat_g"
        target_grams: сколько ещё нужно добрать (г)
        condition: текущая болезнь (фильтрует продукты по её лимитам)
        top: сколько вариантов вернуть (по умолчанию 5)
        target_kcal: целевая калорийность (для пересчёта лимитов болезни)

    Возвращает топ-N продуктов с рекомендацией по граммовке.
    """
    if nutrient not in NUTRIENT_COLS:
        return [{"error": f"Неизвестный нутриент {nutrient!r}. "
                          f"Доступно: {list(NUTRIENT_COLS)}"}]
    try:
        df = suggest(
            nutrient, target_grams, condition,
            top=top, target_kcal=target_kcal,
        )
        return _df_to_records(df)
    except Exception as e:
        return [{"error": f"{type(e).__name__}: {e}"}]


if __name__ == "__main__":
    server.run()
