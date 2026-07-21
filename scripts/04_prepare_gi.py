#!/usr/bin/env python
"""Построение таблицы «категория продукта → базовый гликемический индекс».

Источник: Sydney University GI Database (1879 продуктов, MIT-лицензия),
получен из https://github.com/glycemic-index/glycemic-index.github.com

Два результата:
  1. data/processed/gi_foods.csv      — полный очищенный датасет (1881 строка)
  2. data/processed/gi_by_category.csv — укрупнённая таблица базовых ГИ по категориям

Укрупнение deliberately более гранулярное в местах, критичных для диабета:
картофель отделён от овощей, белые злаки от цельных, сладкое молочное помечено
для корректировки по составу (см. примечания).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
GI_JSON = ROOT / "data" / "gi" / "gi_sydney.json"
PROCESSED = ROOT / "data" / "processed"
PROCESSED.mkdir(parents=True, exist_ok=True)


def parse_gi(s) -> int | None:
    """'47±8' -> 47, '52' -> 52, '' -> None."""
    if s is None:
        return None
    m = re.match(r"\s*(\d+)", str(s))
    return int(m.group(1)) if m else None


def load_clean() -> pd.DataFrame:
    """Грузит JSON Sydney-датасета и приводит к чистому DataFrame."""
    raw = json.loads(GI_JSON.read_text(encoding="utf-8"))
    cols = ["name", "category", "subcategory", "gi_raw", "gi_norm",
            "carbs_per_serving", "gl", "serving_g"]
    df = pd.DataFrame(raw["data"], columns=cols)
    df["gi"] = df["gi_raw"].apply(parse_gi)
    df["gl"] = pd.to_numeric(df["gl"], errors="coerce")
    df["serving_g"] = pd.to_numeric(df["serving_g"], errors="coerce")
    df["carbs_per_serving"] = pd.to_numeric(df["carbs_per_serving"], errors="coerce")
    return df


def to_food_group(row) -> str:
    """Укрупнённая категория (по-русски) с разделением критичных для диабета сегментов."""
    cat = str(row["category"]).lower()
    name = str(row["name"]).lower()

    # Картофель — отдельно от овощей (ГИ ~74 vs ~52)
    if "potato" in cat:
        return "Картофель"
    if "vegetable" in cat or "root vegetable" in cat:
        return "Овощи некрахмалистые"

    # Молочные: сладкие выделяем по составу названия (ВНИМАНИЕ: Sydney здесь
    # ненадёжен — «сладкие» у них часто с подсластителями. Реальная корректировка
    # молочных по сахару делается в diet/gi.py из состава продукта.)
    if "dairy" in cat:
        if re.search(r"sugar|sweet|flavoured|flavored|fruit|honey|jam|chocolate|berry",
                     name):
            return "Молочные сладкие"
        return "Молочные несладкие"

    # Злаки: белые vs цельные
    if "bread" in cat or "bakery" in cat or "cookie" in cat or "cracker" in cat:
        return "Хлеб и выпечка"
    if "breakfast cereal" in cat:
        return "Сухие завтраки"
    if "cereal grain" in cat:
        if re.search(r"white rice|white bread|white flour|refined|polished", name):
            return "Крупы белые (рафинированные)"
        if re.search(r"whole|brown|wholemeal|wholegrain|barley|oat|buckwheat", name):
            return "Крупы цельные"
        return "Крупы/зерно прочие"
    if "pasta" in cat:
        return "Макароны"

    # Сладкое
    if "snack" in cat or "confection" in cat or "sugars" in cat or "syrup" in cat:
        return "Сладости и снеки"

    # Фрукты / соки / напитки
    if "fruit juice" in cat:
        return "Соки"
    if "fruit" in cat:
        return "Фрукты"
    if "beverage" in cat:
        return "Напитки"

    # Белки/жиры растительные
    if "legume" in cat:
        return "Бобовые"
    if "nut" in cat:
        return "Орехи"

    # Прочее
    if "mixed meal" in cat or "convenience" in cat:
        return "Готовые блюда"
    if "soup" in cat:
        return "Супы"
    return "Региональные блюда"


def build_category_table(df: pd.DataFrame) -> pd.DataFrame:
    """Агрегирует базовый ГИ по укрупнённым категориям."""
    df = df.copy()
    df["food_group"] = df.apply(to_food_group, axis=1)
    agg = (df.groupby("food_group")["gi"]
           .agg(median="median", q25=lambda x: x.quantile(0.25),
                q75=lambda x: x.quantile(0.75), n="count")
           .round(0).reset_index())
    agg = agg.rename(columns={"food_group": "category",
                              "median": "gi_base",
                              "q25": "gi_low", "q75": "gi_high"})
    agg = agg.sort_values("gi_base", ascending=False).reset_index(drop=True)
    agg["source"] = "Sydney GI DB (MIT), n={}".format  # заполним ниже
    agg["source"] = agg["n"].apply(lambda n: f"Sydney GI DB, n={int(n)}")
    return agg


def main() -> int:
    df = load_clean()
    print(f"[gi] загружено {len(df)} продуктов из Sydney-датасета")

    # 1. Сохраняем полный очищенный датасет
    full_out = PROCESSED / "gi_foods.csv"
    df.to_csv(full_out, index=False, encoding="utf-8-sig")
    print(f"[gi] полный датасет: {full_out} ({len(df)} строк)")

    # 2. Таблица «категория → базовый ГИ»
    cat = build_category_table(df)
    cat_out = PROCESSED / "gi_by_category.csv"
    cat.to_csv(cat_out, index=False, encoding="utf-8-sig")
    print(f"[gi] таблица категорий: {cat_out} ({len(cat)} категорий)")
    print()
    print(cat.to_string(index=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
