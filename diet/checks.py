"""Умные проверки микроэлементов против лимитов болезней.

Опирается на численные дневные лимиты из conditions.py (ключ 'limits').
Два режима:
    - check_portion: одна порция продукта — «эта порция = 130% дневного лимита сахара»
    - check_day: накопленное за день — «натрий 2600 мг, превышен лимит 2300 мг»
"""

from __future__ import annotations

from dataclasses import dataclass

from .conditions import get_condition
from .food_db import FoodItem

# Калорийность 1 г насыщенных жиров — для пересчёта доли энергии в граммы.
FAT_KCAL_PER_G = 9.0


@dataclass
class CheckResult:
    """Одно предупреждение проверки."""

    level: str       # 'info' / 'warn' / 'danger'
    nutrient: str    # ключ микроэлемента (sugars_g, sodium_mg, ...)
    value: float     # фактическое значение
    limit: float     # порог
    message: str     # человекочитаемое сообщение

    def __repr__(self) -> str:
        icon = {"info": "•", "warn": "⚠", "danger": "⛔"}[self.level]
        return f"{icon} {self.message}"


def _label(nutrient: str) -> str:
    """Человекочитаемое название микроэлемента с единицами."""
    return {
        "sugars_g": "сахар (г)",
        "sodium_mg": "натрий (мг)",
        "potassium_mg": "калий (мг)",
        "phosphorus_mg": "фосфор (мг)",
        "sat_fat_g": "насыщ. жиры (г)",
    }.get(nutrient, nutrient)


def resolve_limits(condition: str, target_kcal: float | None = None) -> dict:
    """Возвращает лимиты в абсолютных единицах (г/мг).

    sat_fat_pct пересчитывается в граммы через target_kcal: г = kcal×pct/9.
    Если target_kcal не задан — sat_fat_pct пропускается (нельзя пересчитать).
    """
    cfg = get_condition(condition)
    raw = cfg.get("limits", {})
    out = {}
    for k, v in raw.items():
        if k == "sat_fat_pct":
            if target_kcal:
                out["sat_fat_g"] = round(target_kcal * v / FAT_KCAL_PER_G, 1)
        else:
            out[k] = v
    return out


def _level_for_ratio(ratio: float) -> str:
    """Уровень серьёзности по доле от лимита."""
    if ratio >= 1.0:
        return "danger"
    if ratio >= 0.5:
        return "warn"
    return "info"


def check_portion(food_item: FoodItem, grams: float, condition: str,
                  target_kcal: float | None = None) -> list[CheckResult]:
    """Проверяет ОДНУ порцию продукта против дневных лимитов болезни.

    Считает, сколько процентов дневного лимита занимает эта порция.
    Предупреждения — только если доля >= 25% (чтобы не спамить мелочью).
    """
    limits = resolve_limits(condition, target_kcal)
    if not limits:
        return []

    portion = food_item.portion(grams)
    results = []
    for nutrient, limit in limits.items():
        amount = portion.get(nutrient)
        if amount is None or limit is None:
            continue
        ratio = amount / limit if limit else 0
        if ratio < 0.25:
            continue  # порция занимает <25% лимита — не предупреждаем
        level = _level_for_ratio(ratio)
        pct = ratio * 100
        results.append(CheckResult(
            level=level,
            nutrient=nutrient,
            value=round(amount, 1),
            limit=limit,
            message=(
                f"{food_item.name} ({grams} г): {_label(nutrient)} = {amount:.1f} "
                f"— это {pct:.0f}% дневного лимита ({limit:g}) при {get_condition(condition)['label'].lower()}"
            ),
        ))
    return results


def check_day(day_totals: dict, condition: str,
              target_kcal: float | None = None) -> list[CheckResult]:
    """Проверяет накопленные за день микроэлементы против лимитов.

    day_totals — словарь {nutrient: amount} (итог дневника).
    Возвращает предупреждения о превышении (только danger/warn при выходе за лимит).
    """
    limits = resolve_limits(condition, target_kcal)
    if not limits:
        return []

    results = []
    for nutrient, limit in limits.items():
        amount = day_totals.get(nutrient)
        if amount is None or limit is None:
            continue
        ratio = amount / limit if limit else 0
        if ratio <= 1.0:
            continue  # в пределах лимита — всё ок
        over = amount - limit
        results.append(CheckResult(
            level="danger",
            nutrient=nutrient,
            value=round(amount, 1),
            limit=limit,
            message=(
                f"{_label(nutrient)} за день = {amount:.0f} — превышен лимит "
                f"{limit:g} на {over:.0f}"
            ),
        ))
    return results
