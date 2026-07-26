"""Дневник питания: копит съеденное, сравнивает с нормой, предлагает добор.

Дневник не знает про болезнь — только копит и сравнивает с числовой нормой
(NutritionResult из калькулятора). Проверки болезни живут в checks.py,
подбор с учётом лимитов — в suggest().
"""

from __future__ import annotations

from dataclasses import dataclass, field

import pandas as pd

from .food_db import FoodItem, NUTRIENT_COLS, load_foods, search

# Колонки, которые сравниваем с нормой (КБЖУ + клетчатка — то, что считает калькулятор).
COMPARE_COLS = ["kcal", "protein_g", "fat_g", "carbs_g", "fiber_g"]

# Человекочитаемые названия для вывода.
COL_LABELS = {
    "kcal": "Калории (ккал)",
    "protein_g": "Белки (г)",
    "fat_g": "Жиры (г)",
    "carbs_g": "Углеводы (г)",
    "fiber_g": "Клетчатка (г)",
    "sugars_g": "Сахара (г)",
    "sat_fat_g": "Насыщ. жиры (г)",
    "sodium_mg": "Натрий (мг)",
    "potassium_mg": "Калий (мг)",
    "phosphorus_mg": "Фосфор (мг)",
    "calcium_mg": "Кальций (мг)",
    "iron_mg": "Железо (мг)",
    "vitc_mg": "Вит. C (мг)",
}


@dataclass
class Entry:
    """Один приём пищи в дневнике."""

    food: FoodItem
    grams: float
    portion_values: dict  # нутриенты порции


class FoodLog:
    """Дневник питания за день."""

    def __init__(self) -> None:
        self._entries: list[Entry] = []

    def add(self, food: FoodItem, grams: float) -> Entry:
        """Добавить порцию продукта. Возвращает запись."""
        portion = food.portion(grams)
        entry = Entry(food=food, grams=grams, portion_values=portion)
        self._entries.append(entry)
        return entry

    def pop(self) -> Entry | None:
        """Удалить и вернуть последнюю запись (для отмены ошибочного ввода)."""
        return self._entries.pop() if self._entries else None

    def clear(self) -> None:
        self._entries.clear()

    @property
    def totals(self) -> dict:
        """Сумма нутриентов за день по всем колонкам."""
        totals = {c: 0.0 for c in NUTRIENT_COLS}
        for e in self._entries:
            for c in NUTRIENT_COLS:
                v = e.portion_values.get(c)
                if v is not None:
                    totals[c] += v
        return totals

    def to_df(self) -> pd.DataFrame:
        """Таблица съеденного: название, источник, граммы, КБЖУ + клетчатка порции."""
        rows = []
        for e in self._entries:
            rows.append({
                "Продукт": e.food.name,
                "Источник": e.food.source,
                "Граммы": e.grams,
                "ккал": e.portion_values.get("kcal"),
                "Б (г)": e.portion_values.get("protein_g"),
                "Ж (г)": e.portion_values.get("fat_g"),
                "У (г)": e.portion_values.get("carbs_g"),
                "Клетчатка (г)": e.portion_values.get("fiber_g"),
            })
        return pd.DataFrame(rows)

    def compare(self, target_result) -> pd.DataFrame:
        """Сравнение факта с целью (NutritionResult из калькулятора).

        Возвращает таблицу: нутриент / факт / цель / остаток / % выполнения.
        """
        totals = self.totals
        # Цели по КБЖУ + клетчатке берём из NutritionResult
        # (целевые ккал, Б/Ж/У и рекомендуемая клетчатка в граммах).
        targets = {
            "kcal": target_result.target_kcal,
            "protein_g": target_result.protein_g,
            "fat_g": target_result.fat_g,
            "carbs_g": target_result.carbs_g,
            "fiber_g": target_result.fiber_g,
        }
        rows = []
        for c in COMPARE_COLS:
            fact = totals.get(c, 0.0)
            goal = targets.get(c)
            if goal is None or goal == 0:
                pct = None
                remain = None
            else:
                pct = fact / goal * 100
                remain = goal - fact
            rows.append({
                "Нутриент": COL_LABELS.get(c, c),
                "Факт": round(fact),
                "Цель": round(goal) if goal else None,
                "Осталось": round(remain) if remain is not None else None,
                "% вып.": round(pct) if pct is not None else None,
            })
        return pd.DataFrame(rows)


def suggest(nutrient: str, target_grams: float, condition: str,
            exclude_ids: list[str] | None = None, top: int = 5,
            target_kcal: float | None = None) -> pd.DataFrame:
    """Подбор продуктов, чтобы добрать норму по нутриенту.

    Фильтрует базу: продукт богат нужным нутриентом И не превышает лимиты
    микроэлементов текущей болезни (на стандартную порцию 100 г).
    Возвращает топ-N с рекомендацией по граммовке.

    nutrient: ключ из NUTRIENT_COLS ('protein_g', 'carbs_g', ...).
    target_grams: сколько ещё нужно добрать (например, остаток белка).

    Исключает «нерыночные» источники: чистый сахар/мёд при подборе углеводов,
    чистые масла при подборе жиров, спортивные концентраты/изоляты белка —
    формально они богаты нутриентом, но как повседневная еда бесполезны
    (особенно для диабетика: чистый сахар = скачок глюкозы).
    """
    from .checks import resolve_limits

    if target_grams <= 0:
        return pd.DataFrame(columns=["Продукт", "Источник", f"{nutrient}/100г",
                                     "Рекоменд. граммы", "покроет (г)"])

    # Стоп-слова в названии, зависящие от подбираемого нутриента.
    # Исключаем концентрированные/нерыночные источники.
    STOPWORDS = {
        "carbs_g": ["сахар", "sugar", "сироп", "syrup", "мёд", "honey",
                    "паток", "molasses", "глюкоз", "фруктоз", "dextrose",
                    # сладости — плохой источник углеводов (скачок глюкозы)
                    "конфет", "cand", "драже", "монпансье", "мармелад",
                    "пастил", "карамел", "karam", "печенье", "бисквит",
                    "шоколад", "chocolate", "халва", "ксиол", "tic tac",
                    "ксилит", "сорбит", "изомальт", "стеви", "повидл", "джем",
                    "варен", "солод", "licoric"],
        "fat_g": ["масло", "oil", "жир", "fat", "маргарин", "margarine",
                  "сало", "lard", "шортенинг", "shortening", "смалец",
                  "спред", "spread", "слобода", "алёнуш", "аленуш",
                  "ароматное", "zlato", "олія", "олия", "зелень"],
        "protein_g": ["изолят", "isolate", "концентрат", "concentrate",
                      "протеин", "protein", "коллаген", "collagen",
                      "аминокислот", "amino", "whey", "казеин", "casein",
                      "dried", "сушён", "сушен", "сухой", "сухая",  # концентраты
                      "желатин", "gelatin", "белок яичный", "isopropyl",
                      "bar", "батончик", "печенье", "pancake", "блин",
                      "pureprotein", "vegan"],
    }
    stop = STOPWORDS.get(nutrient, [])

    # Реалистичный потолок содержания нутриента в «обычной» еде (г/100 г).
    # Выше — концентраты/БАДы/мусор; в подбор не предлагаем.
    REALISTIC_MAX = {
        "protein_g": 35, "carbs_g": 85, "fat_g": 75,
        "fiber_g": 50, "sugars_g": 65,
    }


    foods = load_foods()
    limits = resolve_limits(condition, target_kcal)

    # Берём продукты с заполненным нужным нутриентом и реалистичным содержанием
    # (отсекаем концентраты/БАДы/мусор с аномальными значениями).
    mx = REALISTIC_MAX.get(nutrient)
    df = foods[foods[nutrient].notna() & (foods[nutrient] > 0)].copy()
    if mx:
        df = df[df[nutrient] <= mx]
    if exclude_ids:
        df = df[~df["id"].isin(exclude_ids)]

    # Исключаем «нерыночные» источники по стоп-словам в названии.
    if stop:
        name_lower = df["name"].str.lower()
        hit = name_lower.apply(lambda n: any(w in n for w in stop) if isinstance(n, str) else False)
        df = df[~hit]

    # Отсеиваем продукты, превышающие лимиты болезни (на 100 г).
    # Это грубый фильтр — не даём предлагать кефир с калием при ХБП.
    if limits:
        for lim_nut, lim_val in limits.items():
            if lim_nut == nutrient:
                continue
            if lim_nut in df.columns:
                df = df[~((df[lim_nut].notna()) & (df[lim_nut] > lim_val))]

    df = df.sort_values(nutrient, ascending=False).head(top * 4)

    rows = []
    for _, r in df.iterrows():
        per_100 = r[nutrient]
        grams_needed = target_grams / per_100 * 100
        rows.append({
            "Продукт": r["name"],
            "Источник": r["source"],
            f"{nutrient}/100г": round(per_100, 1),
            "Рекоменд. граммы": round(grams_needed),
            "покроет (г)": round(per_100 * grams_needed / 100, 1),
        })
        if len(rows) >= top:
            break
    return pd.DataFrame(rows)
