-- =====================================================================
-- Vivora: расширение схемы под ключи онбординга
-- ---------------------------------------------------------------------
-- Запускать ПОСЛЕ миграций 001 и 002.
-- Supabase Studio → SQL Editor → New query → вставить весь файл → Run.
--
-- Контекст: в онбординге (Onboarding.tsx) ключи activity/conditions/sex
-- шире, чем в Python-калькуляторе. Расширяем схему под UI, чтобы онбординг
-- сохранялся полностью. Маппинг "UI-ключ → ключ калькулятора" хранится в
-- коде (src/lib/conditions.ts), а в БД лежат как есть.
-- =====================================================================

-- 1. sex: снимаем ограничение male/female, добавляем 'other'.
--    Формулы КБЖУ такого пола не знают — в калькуляторе 'other' будет
--    трактоваться как female по умолчанию (мягкое допущение).
alter table public.profiles
  drop constraint if exists profiles_sex_check;
alter table public.profiles
  add constraint profiles_sex_check check (sex in ('male','female','other'));

-- 2. condition: в БД было healthy/diabetes_t2/obesity/ckd/cvd.
--    В онбординге есть дополнительно: hypertension, kidney (=ckd),
--    digestive, pcos, cholesterol. Сохраняем ключи онбординга как есть,
--    check не ставим (калькулятор замаппит их через справочник).
--    Колонка condition уже без check — оставляем как есть.

-- 3. activity: в онбординге sedentary/light/moderate/very/extra.
--    Калькулятор ждёт 14 уровней (light_strength/moderate_cardio/...).
--    Эти ключи UI замаппятся на ближайший универсальный (light→light и т.д.).
--    Колонка activity уже без check — оставляем как есть.

-- 4. habits: в онбординге есть выбор привычек (water/breakfast/veggies/...),
--    но в БД для них нет таблицы. Добавим profiles.habits, чтобы сохранить.
alter table public.profiles
  add column if not exists habits text[] default '{}';

-- 5. goals: в онбординге множественный выбор целей (lose/gain/maintain/
--    build/energy/health/manage/sleep). Сохраняем массивом.
alter table public.profiles
  add column if not exists goals text[] default '{}';

-- Проверка:
-- select sex, goals, habits, condition, activity from public.profiles;

-- =====================================================================
-- 6. RPC increment_water: атомарный +1 стакан на день.
-- ---------------------------------------------------------------------
-- Без гонки read-then-write: SQL делает INSERT ... ON CONFLICT с
-- инкрементом за одну операцию.
-- =====================================================================

create or replace function public.increment_water(p_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Необходима авторизация';
  end if;
  insert into public.water_log (user_id, entry_date, glasses)
  values (v_uid, p_date, 1)
  on conflict (user_id, entry_date)
  do update set
    glasses = water_log.glasses + 1,
    updated_at = now();
end;
$$;

