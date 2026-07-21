#!/usr/bin/env python
"""Подготовка нормализованной таблицы продуктов USDA Foundation Foods.

Распаковывает ZIP в data/foundation_foods/ (если ещё не распакован) и собирает
широкую таблицу: один продукт — одна строка с ключевыми нутриентами в колонках.

Результат: data/processed/usda_foods.csv
"""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path

import pandas as pd

# Пути (скрипт лежит в scripts/, данные — в ../data/)
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
ZIP_PATH = DATA / "downloads" / "FoodData_Central_foundation_food_csv_2026-04-30.zip"
EXTRACT_DIR = DATA / "foundation_foods"
OUT_PATH = DATA / "processed" / "usda_foods.csv"

# Внутренняя папка внутри ZIP (как в архиве)
ZIP_INNER = "FoodData_Central_foundation_food_csv_2026-04-30"


# Имя колонки -> приоритетный список nutrient_nbr (берём первый доступный).
# В USDA есть дублирующие коды для одних и тех же нутриентов (Energy 208/957/958,
# Sugars 269/269.3, Fiber 291/293 ...), поэтому для каждого — список с фолбэками.
NUTRIENT_MAP = {
    "kcal":          [208, 957, 958],          # Energy
    "protein_g":     [203],                    # Protein
    "fat_g":         [204],                    # Total lipid (fat)
    "carbs_g":       [205],                    # Carbohydrate, by difference
    "fiber_g":       [291, 293],               # Fiber, total dietary
    "sugars_g":      [269, 269.3],             # Sugars, total
    "sat_fat_g":     [606],                    # Saturated fat (ССЗ)
    "sodium_mg":     [307],                    # Sodium (ССЗ)
    "potassium_mg":  [306],                    # Potassium (ХБП/ССЗ)
    "phosphorus_mg": [304],                    # Phosphorus (ХБП)
    "calcium_mg":    [301],
    "iron_mg":       [303],
    "vitc_mg":       [401],
    "thiamin_mg":    [404],
    "riboflavin_mg": [405],
    "b12_ug":        [418],
}

# Обратный индекс: nutrient_nbr -> имя колонки (каждый nbr принадлежит ровно одной колонке)
NBR_TO_COL = {nbr: col for col, nbrs in NUTRIENT_MAP.items() for nbr in nbrs}


def extract_zip() -> Path:
    """Распаковывает ZIP, если ещё не сделано. Возвращает путь к CSV-папке."""
    csv_dir = EXTRACT_DIR / ZIP_INNER
    if (csv_dir / "food.csv").exists():
        print(f"[usda] уже распаковано в {csv_dir}")
        return csv_dir
    print(f"[usda] распаковываю {ZIP_PATH.name} ...")
    with zipfile.ZipFile(ZIP_PATH) as zf:
        zf.extractall(EXTRACT_DIR)
    return csv_dir


def read_csv(csv_dir: Path, name: str) -> pd.DataFrame:
    return pd.read_csv(csv_dir / name, low_memory=False)


def build_table(csv_dir: Path) -> pd.DataFrame:
    print("[usda] читаю таблицы ...")
    food = read_csv(csv_dir, "food.csv")
    cat = read_csv(csv_dir, "food_category.csv")
    fn = read_csv(csv_dir, "food_nutrient.csv")
    nut = read_csv(csv_dir, "nutrient.csv")

    # Только базовые продукты Foundation Foods
    food = food[food["data_type"] == "foundation_food"].copy()
    print(f"[usda] продуктов foundation_food: {len(food)}")

    # Привязываем категорию
    food = food.merge(cat[["id", "description"]].rename(
        columns={"id": "food_category_id", "description": "category"}
    ), on="food_category_id", how="left")

    # Оставляем только нужные нутриенты (по приоритетным nutrient_nbr)
    keep_nbrs = set(NBR_TO_COL.keys())
    keep_nutrient_ids = set(nut[nut["nutrient_nbr"].isin(keep_nbrs)]["id"])
    fn = fn[fn["nutrient_id"].isin(keep_nutrient_ids)].copy()

    # Добавляем nutrient_nbr и имя колонки
    fn = fn.merge(nut[["id", "nutrient_nbr"]], left_on="nutrient_id", right_on="id",
                  suffixes=("", "_nut"))
    fn["col"] = fn["nutrient_nbr"].map(NBR_TO_COL)
    # Приоритет внутри колонки: какой по счёту nbr в списке (0 = высший)
    nbr_rank = {col: {nbr: i for i, nbr in enumerate(nbrs)}
                for col, nbrs in NUTRIENT_MAP.items()}
    fn["rank"] = fn.apply(lambda r: nbr_rank[r["col"]].get(r["nutrient_nbr"], 99), axis=1)

    # Для каждого (fdc_id, col) берём строку с наименьшим rank (наивысший приоритет)
    fn = (fn.sort_values("rank")
            .drop_duplicates(subset=["fdc_id", "col"], keep="first"))

    # Разворачиваем в широкую форму: fdc_id -> по колонке на нутриент
    wide = (fn[["fdc_id", "col", "amount"]]
            .pivot(index="fdc_id", columns="col", values="amount")
            .reset_index())

    # Склеиваем с продуктами
    out = food[["fdc_id", "description", "category"]].merge(wide, on="fdc_id", how="left")
    out = out.rename(columns={"description": "name", "fdc_id": "fdc_id"})

    # Порядок колонок: сначала идентификаторы и название, потом КБЖУ, потом микро
    col_order = ["fdc_id", "name", "category",
                 "kcal", "protein_g", "fat_g", "carbs_g", "fiber_g", "sugars_g",
                 "sat_fat_g", "sodium_mg", "potassium_mg", "phosphorus_mg",
                 "calcium_mg", "iron_mg", "vitc_mg", "thiamin_mg", "riboflavin_mg", "b12_ug"]
    # оставляем только те колонки, что реально есть
    col_order = [c for c in col_order if c in out.columns]
    out = out[col_order]
    return out


def main() -> int:
    if not ZIP_PATH.exists():
        print(f"ERROR: не найден {ZIP_PATH}", file=sys.stderr)
        return 1
    csv_dir = extract_zip()
    df = build_table(csv_dir)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_PATH, index=False, encoding="utf-8-sig")
    print(f"\n[usda] ГОТОВО: {OUT_PATH}")
    print(f"[usda] строк: {len(df)}, колонок: {len(df.columns)}")
    print(f"[usda] колонки: {list(df.columns)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
