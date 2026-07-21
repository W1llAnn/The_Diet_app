#!/usr/bin/env python
"""Фильтрация полного дампа Open Food Facts по России.

Читает data/downloads/openfoodfacts-products.jsonl построчно (streaming — без
загрузки всего 43 ГБ в память) и оставляет продукты, где countries_tags содержит
'en:russia'. Нормализует поля под ту же схему колонок, что у USDA.

Результат: data/processed/off_ru_foods.csv (~35 000 строк).
"""

from __future__ import annotations

import csv
import json
import sys
import time
from pathlib import Path

from tqdm import tqdm

ROOT = Path(__file__).resolve().parent.parent
JSONL = ROOT / "data" / "downloads" / "openfoodfacts-products.jsonl"
OUT = ROOT / "data" / "processed" / "off_ru_foods.csv"
OUT.parent.mkdir(parents=True, exist_ok=True)

# Тег страны в формате OFF
RU_TAG = "en:russia"

# Колонки выходной таблицы — выровнены по схеме USDA для сопоставимости.
COLUMNS = [
    "code",            # штрихкод
    "name",            # product_name
    "brands",
    "categories",      # категории OFF
    "kcal",            # energy-kcal_100g
    "protein_g",       # proteins_100g
    "fat_g",           # fat_100g
    "carbs_g",         # carbohydrates_100g
    "fiber_g",         # fiber_100g
    "sugars_g",        # sugars_100g
    "sat_fat_g",       # saturated-fat_100g
    "sodium_mg",       # salt_100g * 400 (NaCl -> Na)  — см. примечание ниже
    "potassium_mg",    # potassium_100g
    "calcium_mg",      # calcium_100g
    "iron_mg",         # iron_100g
    "vitc_mg",         # vitamin-c_100g
]

# OFF хранит соль (salt_100g) в граммах NaCl. Натрий = соль × (22.99/58.44) ≈ ×0.3934.
SALT_TO_SODIUM = 22.99 / 58.44


def pick(d: dict, key: str, default=None):
    """Достаёт значение; OFF иногда отдаёт строки/числа/None."""
    v = d.get(key, default)
    if v in ("", None, "unknown"):
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return v


def row_from_product(p: dict) -> dict | None:
    """Собирает строку из записи продукта OFF.

    Возвращает None, если продукт не из РФ или в нём нет вообще ничего
    для идентификации (ни штрихкода, ни названия).
    Нутриенты НЕ обязательны — продукт сохраняется даже если их нет,
    чтобы собрать максимально полный список РФ-продуктов.
    """
    # Проверка страны
    countries = p.get("countries_tags") or []
    if RU_TAG not in countries:
        return None

    # Для идентификации достаточно хотя бы штрихкода ИЛИ названия.
    # Если нет ни того, ни другого — запись бесполезна.
    code = p.get("code") or ""
    name = p.get("product_name") or ""
    if not code and not name:
        return None

    # В полном дампе нутриенты лежат во вложенном словаре nutriments,
    # ключи с суффиксом _100g. Берём именно его (не плоские ключи верхнего уровня —
    # те есть только в ответе search-API, а не в дампе).
    nm = p.get("nutriments") or {}

    salt = pick(nm, "salt_100g")
    sodium = round(salt * SALT_TO_SODIUM * 1000, 1) if isinstance(salt, (int, float)) else None

    return {
        "code": code,
        "name": name,
        "brands": p.get("brands") or "",
        "categories": p.get("categories") or "",
        "kcal": pick(nm, "energy-kcal_100g"),
        "protein_g": pick(nm, "proteins_100g"),
        "fat_g": pick(nm, "fat_100g"),
        "carbs_g": pick(nm, "carbohydrates_100g"),
        "fiber_g": pick(nm, "fiber_100g"),
        "sugars_g": pick(nm, "sugars_100g"),
        "sat_fat_g": pick(nm, "saturated-fat_100g"),
        "sodium_mg": sodium,
        "potassium_mg": pick(nm, "potassium_100g"),
        "calcium_mg": pick(nm, "calcium_100g"),
        "iron_mg": pick(nm, "iron_100g"),
        "vitc_mg": pick(nm, "vitamin-c_100g"),
    }


def main() -> int:
    if not JSONL.exists():
        print(f"ERROR: дамп не найден {JSONL}. Запустите 02_download_off.py.",
              file=sys.stderr)
        return 1

    # Считаем строки для прогресс-бара (один быстрый проход)
    print("[off-ru] оцениваю размер дампа ...")
    t0 = time.time()
    with open(JSONL, "rb") as f:
        total = sum(1 for _ in f)
    print(f"[off-ru] {total:,} строк в дампе (оценка за {time.time()-t0:.0f}s)")

    print(f"[off-ru] фильтрую по '{RU_TAG}' ...")
    n_total = n_ru_all = n_written = n_no_id = 0
    n_with_any_nutri = n_with_full_kbju = 0
    KBJU_COLS = ("kcal", "protein_g", "fat_g", "carbs_g")
    t1 = time.time()
    with open(JSONL, "r", encoding="utf-8", errors="ignore") as src, \
         open(OUT, "w", encoding="utf-8-sig", newline="") as dst, \
         tqdm(total=total, unit="строк", ncols=80, desc="filter") as bar:
        writer = csv.DictWriter(dst, fieldnames=COLUMNS)
        writer.writeheader()
        for line in src:
            n_total += 1
            bar.update(1)
            try:
                p = json.loads(line)
            except json.JSONDecodeError:
                continue
            # Сначала просто проверим страну (без отсева по name/code)
            countries = p.get("countries_tags") or []
            if RU_TAG not in countries:
                continue
            n_ru_all += 1  # вообще все записи с тегом РФ
            row = row_from_product(p)
            if row is None:
                # РФ-запись, но нет ни штрихкода, ни названия — не записываем
                n_no_id += 1
                continue
            # статистика заполненности
            if any(row.get(c) is not None for c in (
                "kcal","protein_g","fat_g","carbs_g","fiber_g","sugars_g",
                "sat_fat_g","sodium_mg","potassium_mg","calcium_mg","iron_mg","vitc_mg")):
                n_with_any_nutri += 1
            if all(row.get(c) is not None for c in KBJU_COLS):
                n_with_full_kbju += 1
            writer.writerow(row)
            n_written += 1

    print(f"\n[off-ru] ГОТОВО за {time.time()-t1:.0f}s: {OUT}")
    print(f"[off-ru] всего строк в дампе:          {n_total:,}")
    print(f"[off-ru] записей с тегом РФ (всего):   {n_ru_all:,}")
    print(f"[off-ru]   из них без кода и названия: {n_no_id:,} (отброшено)")
    print(f"[off-ru] записано в CSV:               {n_written:,}")
    print(f"[off-ru]   с любым нутриентом:         {n_with_any_nutri:,} "
          f"({n_with_any_nutri/n_written*100:.0f}%)" if n_written else "")
    if n_written:
        print(f"[off-ru]   с полным КБЖУ:             {n_with_full_kbju:,} "
              f"({n_with_full_kbju/n_written*100:.0f}%)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
