"""Единый доступ к базе продуктов (USDA + Open Food Facts).

Грузит обе CSV-таблицы, склеивает в один DataFrame, даёт поиск по имени и
расчёт нутриентов порции (значения на 100 г × grams/100).
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "processed"
USDA_CSV = DATA / "usda_foods.csv"
OFF_CSV = DATA / "off_ru_foods.csv"

# Колонки нутриентов, единые для обоих источников (на 100 г продукта).
NUTRIENT_COLS = [
    "kcal", "protein_g", "fat_g", "carbs_g", "fiber_g", "sugars_g",
    "sat_fat_g", "sodium_mg", "potassium_mg", "phosphorus_mg",
    "calcium_mg", "iron_mg", "vitc_mg",
]
KBJU_COLS = ["kcal", "protein_g", "fat_g", "carbs_g"]


def load_foods() -> pd.DataFrame:
    """Грузит обе таблицы, добавляет колонку source, склеивает.

    Возвращает единый DataFrame с колонками:
        source ('usda'/'off'), id (fdc_id или code), name, brands?, category?, нутриенты...
    """
    parts = []

    if USDA_CSV.exists():
        usda = pd.read_csv(USDA_CSV)
        usda = usda.rename(columns={"fdc_id": "id"})
        usda["source"] = "usda"
        usda["brands"] = ""
        for c in NUTRIENT_COLS:
            if c not in usda.columns:
                usda[c] = pd.NA
        parts.append(usda[["source", "id", "name", "brands", "category"] + NUTRIENT_COLS])

    if OFF_CSV.exists():
        off = pd.read_csv(OFF_CSV)
        off = off.rename(columns={"code": "id"})
        off["source"] = "off"
        off["category"] = ""
        for c in NUTRIENT_COLS:
            if c not in off.columns:
                off[c] = pd.NA
        parts.append(off[["source", "id", "name", "brands", "category"] + NUTRIENT_COLS])

    if not parts:
        raise FileNotFoundError(
            f"Не найдены таблицы продуктов в {DATA}. Запустите scripts/01_prepare_usda.py."
        )

    foods = pd.concat(parts, ignore_index=True)
    # id приводим к строке (у OFF это штрихкоды-строки, у USDA числа)
    foods["id"] = foods["id"].astype(str)

    # Санитарная фильтрация: OFF содержит мусорные записи с физически
    # невозможными значениями (белок 50 млн г и т.п.). Отсекаем всё, что
    # больше разумного максимума на 100 г. None не трогаем.
    MAX_VALUES = {
        "kcal": 3000, "protein_g": 100, "fat_g": 100, "carbs_g": 100,
        "fiber_g": 100, "sugars_g": 100, "sat_fat_g": 100,
        "sodium_mg": 100000, "potassium_mg": 10000, "phosphorus_mg": 10000,
        "calcium_mg": 10000, "iron_mg": 1000, "vitc_mg": 10000,
    }
    for col, mx in MAX_VALUES.items():
        if col in foods.columns:
            bad = foods[col].notna() & (foods[col] > mx)
            foods.loc[bad, col] = pd.NA

    # Удаляем откровенно мусорные названия (меньше 2 букв или без букв).
    name_ok = foods["name"].fillna("").str.contains(r"[A-Za-zА-Яа-яЁё]{2,}", regex=True, na=False)
    foods = foods[name_ok].reset_index(drop=True)

    return foods


def search(foods: pd.DataFrame, query: str, limit: int = 20) -> pd.DataFrame:
    """Поиск по имени (case-insensitive).

    Порядок сортировки:
      1) продукты с полным КБЖУ и «типичными» значениями (все макро ≤50 г/100 г)
         — это обычная еда, а не концентраты (сушёный белок 80 г и т.п.);
      2) остальные с полным КБЖУ;
      3) без КБЖУ.
    """
    mask = foods["name"].str.contains(query, case=False, na=False)
    found = foods[mask].copy()
    if found.empty:
        return found

    found["_kbju_ok"] = found[KBJU_COLS].notna().all(axis=1)
    # «типичный»: ни один макронутриент не превосходит 50 г/100 г.
    macro_typical = (found[["protein_g", "fat_g", "carbs_g"]]
                     .fillna(0) <= 50).all(axis=1)
    found["_typical"] = found["_kbju_ok"] & macro_typical
    # Сортировка: типичные → просто с КБЖУ → остальные; внутри по алфавиту.
    found["_rank"] = found["_typical"].astype(int) * 2 + found["_kbju_ok"].astype(int)
    found = found.sort_values(["_rank", "name"], ascending=[False, True])
    return found.drop(columns=["_kbju_ok", "_typical", "_rank"]).head(limit).reset_index(drop=True)


# Порядок меток диабета от лучшей к худшей (для сортировки).
_DIABETES_LABEL_ORDER = {
    "recommended": 0, "allowed": 1, "caution": 2, "forbidden": 3,
}

# Человекочитаемые значки меток для вывода.
LABEL_ICONS = {
    "recommended": "🟢 рекомендовано",
    "allowed":     "✅ разрешено",
    "caution":     "⚠️  осторожно",
    "forbidden":   "⛔ запрещено",
}


def search_for_diabetes(foods: pd.DataFrame, query: str, limit: int = 5) -> pd.DataFrame:
    """Умный поиск для диабетика: топ-N продуктов по запросу, отсортированных
    по полезности (рекомендовано → разрешено → осторожно → запрещено).

    foods — unified-датасет (с колонками food_group, gi, diabetes_label).
    Возвращает DataFrame с ключевыми колонками для вывода.
    """
    mask = foods["name"].str.contains(query, case=False, na=False)
    found = foods[mask].copy()
    if found.empty:
        return found

    found["_ord"] = found["diabetes_label"].map(_DIABETES_LABEL_ORDER).fillna(9)
    # При равной метке — сначала те, где запрос ближе к началу названия
    # (поиск «рис» должен давать «Рис ...», а не «Десерт с рисом ...»).
    ql = query.lower()
    found["_name_start"] = found["name"].fillna("").str.lower().apply(
        lambda n: 0 if n.startswith(ql) else (1 if ql in n.split()[:2] else 2)
    )
    found["_kbju_ok"] = found[["kcal", "protein_g", "fat_g", "carbs_g"]].notna().all(axis=1)
    found = found.sort_values(["_ord", "_name_start", "_kbju_ok", "name"],
                              ascending=[True, True, False, True])
    return found.drop(columns=["_ord", "_name_start", "_kbju_ok"]).head(limit).reset_index(drop=True)

    return found.drop(columns=["_kbju_ok", "_typical", "_rank"]).head(limit).reset_index(drop=True)


@dataclass
class FoodItem:
    """Обёртка над строкой продукта для расчёта порций.

    values — словарь нутриентов на 100 г (могут содержать None).
    """

    name: str
    source: str            # 'usda' / 'off'
    id: str
    brands: str = ""
    category: str = ""
    values: dict = None    # {nutrient_col: value_per_100g, ...}

    def portion(self, grams: float) -> dict:
        """Нутриенты порции указанного веса.

        None-значения остаются None (нет данных — нет данных).
        """
        factor = grams / 100.0
        out = {}
        for k, v in (self.values or {}).items():
            out[k] = None if v is None or pd.isna(v) else round(v * factor, 2)
        return out


def to_fooditem(row: pd.Series) -> FoodItem:
    """Собирает FoodItem из строки DataFrame поиска."""
    values = {c: row.get(c) for c in NUTRIENT_COLS}
    return FoodItem(
        name=row["name"],
        source=row["source"],
        id=str(row["id"]),
        brands=row.get("brands", "") or "",
        category=row.get("category", "") or "",
        values=values,
    )
