#!/usr/bin/env python
"""Сборка единого датасета: продукты + категория + гликемический индекс + метки диабета.

Соединяет:
  - usda_foods.csv + off_ru_foods.csv  (наши продукты)
  - gi_by_category.csv                  (базовые ГИ по категориям)
  - food_groups.classify / gi.gi_for_product (классификация и корректировка)

Результат: data/processed/unified_foods.csv — одна строка на продукт с колонками:
  source, id, name, food_group, gi, gi_reason,
  diabetes_label, diabetes_reason,
  kcal, protein_g, fat_g, carbs_g, sugars_g, fiber_g, ...

Пока метки строятся только для ДИАБЕТА 2 типа. Другие болезни добавим позже.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from diet.food_groups import classify
from diet.gi import gi_for_product, diabetes_label

PROCESSED = ROOT / "data" / "processed"
USDA_CSV = PROCESSED / "usda_foods.csv"
OFF_CSV = PROCESSED / "off_ru_foods.csv"
OUT = PROCESSED / "unified_foods.csv"

NUTRIENT_COLS = [
    "kcal", "protein_g", "fat_g", "carbs_g", "fiber_g", "sugars_g",
    "sat_fat_g", "sodium_mg", "potassium_mg", "phosphorus_mg",
    "calcium_mg", "iron_mg", "vitc_mg",
]


def load_combined() -> pd.DataFrame:
    """Грузит USDA + OFF, объединяет с колонкой source."""
    parts = []
    if USDA_CSV.exists():
        usda = pd.read_csv(USDA_CSV).rename(columns={"fdc_id": "id"})
        usda["source"] = "usda"
        usda["brands"] = ""
        parts.append(usda[["source", "id", "name", "brands", "category"] + NUTRIENT_COLS])
    if OFF_CSV.exists():
        off = pd.read_csv(OFF_CSV).rename(columns={"code": "id"})
        off["source"] = "off"
        off["category"] = ""
        # OFF не имеет phosphorus_mg (не парсили при фильтрации) — добавляем пустую
        for c in NUTRIENT_COLS:
            if c not in off.columns:
                off[c] = pd.NA
        parts.append(off[["source", "id", "name", "brands", "category"] + NUTRIENT_COLS])
    if not parts:
        raise FileNotFoundError("Нет usda_foods.csv / off_ru_foods.csv")
    df = pd.concat(parts, ignore_index=True)
    df["id"] = df["id"].astype(str)

    # Санитарный фильтр мусорных значений (как в food_db.load_foods)
    MAX_VAL = {"kcal": 3000, "protein_g": 100, "fat_g": 100, "carbs_g": 100,
               "fiber_g": 100, "sugars_g": 100, "sat_fat_g": 100,
               "sodium_mg": 100000, "potassium_mg": 10000, "phosphorus_mg": 10000,
               "calcium_mg": 10000, "iron_mg": 1000, "vitc_mg": 10000}
    for c, mx in MAX_VAL.items():
        bad = df[c].notna() & (df[c] > mx)
        df.loc[bad, c] = pd.NA
    name_ok = df["name"].fillna("").str.contains(r"[A-Za-zА-Яа-яЁё]{2,}", regex=True, na=False)
    df = df[name_ok].reset_index(drop=True)
    return df


def main() -> int:
    print("[unified] объединяю USDA + OFF ...")
    df = load_combined()
    print(f"[unified] продуктов: {len(df)} ({df['source'].value_counts().to_dict()})")

    print("[unified] классифицирую категории и считаю ГИ + метки ...")
    gi_vals, cats, gi_reasons = [], [], []
    labels, label_reasons = [], []
    for _, r in df.iterrows():
        gi, cat, gi_r = gi_for_product(
            r["name"], r.get("carbs_g"), r.get("sugars_g"),
            r.get("fiber_g"), r.get("fat_g"), r.get("protein_g"),
        )
        label, label_r = diabetes_label(gi, r.get("sugars_g"), category=cat,
                                        name=r["name"])
        gi_vals.append(gi)
        cats.append(cat)
        gi_reasons.append(gi_r)
        labels.append(label)
        label_reasons.append(label_r)

    df["food_group"] = cats
    df["gi"] = gi_vals
    df["gi_reason"] = gi_reasons
    df["diabetes_label"] = labels
    df["diabetes_reason"] = label_reasons

    OUT.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT, index=False, encoding="utf-8-sig")
    print(f"\n[unified] ГОТОВО: {OUT}")
    print(f"[unified] строк: {len(df)}, колонок: {len(df.columns)}")

    # Сводка
    print(f"\n[unified] распределение по категориям (топ-10):")
    print(df["food_group"].value_counts().head(10).to_string())
    print(f"\n[unified] распределение меток диабета:")
    order = ["recommended", "allowed", "caution", "forbidden"]
    vc = df["diabetes_label"].value_counts()
    for lab in order:
        n = int(vc.get(lab, 0))
        print(f"  {lab:<13} {n:>6,}  ({n/len(df)*100:.0f}%)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
