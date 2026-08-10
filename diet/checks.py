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
        "gl": "гликемическая нагрузка",
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


# ───────────────────────── Проверки гликемической нагрузки (ГН) ─────────────────────────
#
# ГН — отдельная метрика качества углеводов при диабете. В отличие от
# микроэлементов из limits, у ГН две нормы разного масштаба:
#   meal — за один приём пищи (warn при превышении, danger при 1.5×);
#   day  — суммарно за день.
# Поэтому они хранятся в conditions.py как gl_targets, а не внутри limits,
# и проверяются отдельными функциями ниже.


def gl_targets_for(condition: str) -> dict:
    """Возвращает нормы ГН {'meal': ..., 'day': ...} для группы здоровья.

    Пустой словарь, если для группы норм нет (healthy/obesity/ckd/cvd).
    """
    cfg = get_condition(condition)
    return cfg.get("gl_targets", {}) or {}


def check_gl_portion(gi: float, carbs_g: float, grams: float,
                     product_name: str, condition: str) -> list[CheckResult]:
    """Проверяет ГН одной порции продукта против нормы за приём пищи.

    gi/carbs_g/grams — характеристики продукта и порции (carbs_g на 100 г).
    Предупреждения:
        warn   — ГН порции ≥ meal (одна порция уже выбивает норму приёма);
        danger — ГН порции ≥ 1.5×meal (сильный скачок сахара).
    Если для группы нет gl_targets — возвращает [].
    """
    from .gi import glycemic_load, gl_label

    targets = gl_targets_for(condition)
    meal_limit = targets.get("meal")
    if not meal_limit:
        return []

    gl = glycemic_load(gi, carbs_g, grams)
    if gl < meal_limit:
        # ниже нормы — информативное «info», не спамим warn'ом.
        # Но только если ГН ненулевая (мясо с ГН=0 нечего обсуждать).
        if gl <= 0:
            return []
        return [CheckResult(
            level="info",
            nutrient="gl",
            value=gl,
            limit=meal_limit,
            message=(
                f"{product_name} ({grams:g} г): ГН = {gl:g} "
                f"({gl_label(gl)[1]}; норма за приём {meal_limit:g})"
            ),
        )]
    level = "danger" if gl >= 1.5 * meal_limit else "warn"
    return [CheckResult(
        level=level,
        nutrient="gl",
        value=gl,
        limit=meal_limit,
        message=(
            f"{product_name} ({grams:g} г): ГН = {gl:g} — {'превышает' if level=='danger' else 'близка к'} "
            f"норму за приём пищи ({meal_limit:g}) при {get_condition(condition)['label'].lower()}"
        ),
    )]


def check_gl_day(day_gl: float, condition: str) -> list[CheckResult]:
    """Проверяет суммарную ГН за день против дневной нормы.

    day_gl — суммарная ГН за день (из db.day_totals()['gl']).
    """
    targets = gl_targets_for(condition)
    day_limit = targets.get("day")
    if not day_limit:
        return []

    if day_gl <= day_limit:
        return []  # в пределах нормы — тихо
    over = day_gl - day_limit
    level = "danger" if day_gl >= day_limit * 1.2 else "warn"
    return [CheckResult(
        level=level,
        nutrient="gl",
        value=round(day_gl, 1),
        limit=day_limit,
        message=(
            f"ГН за день = {day_gl:.0f} — превышена норма {day_limit:g} "
            f"на {over:.0f} при {get_condition(condition)['label'].lower()}"
        ),
    )]


def check_gl_meal(meal_gl: float, condition: str,
                  meal_name: str = "") -> list[CheckResult]:
    """Проверяет ГН одного приёма пищи против нормы за приём.

    meal_gl — суммарная ГН приёма (из db.meal_totals()['gl']).
    meal_name — читаемое название приёма ('завтрак' и т.п.) для сообщения.
    """
    targets = gl_targets_for(condition)
    meal_limit = targets.get("meal")
    if not meal_limit:
        return []

    if meal_gl <= meal_limit:
        return []
    over = meal_gl - meal_limit
    level = "danger" if meal_gl >= meal_limit * 1.5 else "warn"
    where = f" ({meal_name})" if meal_name else ""
    return [CheckResult(
        level=level,
        nutrient="gl",
        value=round(meal_gl, 1),
        limit=meal_limit,
        message=(
            f"ГН за приём пищи{where} = {meal_gl:.0f} — превышена норма {meal_limit:g} "
            f"на {over:.0f} при {get_condition(condition)['label'].lower()}"
        ),
    )]
