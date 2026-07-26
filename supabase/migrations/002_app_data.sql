-- =====================================================================
-- Vivora: данные приложения (профиль + дневник + вес + вода)
-- ---------------------------------------------------------------------
-- Запускать ПОСЛЕ миграции 001 (которая создала profiles).
-- Supabase Studio → SQL Editor → New query → вставить весь файл → Run.
-- =====================================================================

-- =====================================================================
-- 1. РАСШИРЕНИЕ profiles: антропометрия + настройки онбординга
-- ---------------------------------------------------------------------
-- Эти поля — результат прохождения онбординга. Нужны, чтобы считать
-- норму КБЖУ под пользователя. Вес сюда НЕ кладём (он динамический,
-- живёт в weight_log), только статичные параметры.
-- =====================================================================

alter table public.profiles
  add column if not exists sex             text      check (sex in ('male','female')),
  add column if not exists age             integer   check (age between 10 and 120),
  add column if not exists height          numeric   check (height between 100 and 250),  -- см
  add column if not exists activity        text,     -- ключ из ACTIVITY_LEVELS (sedentary, light_strength, ...)
  add column if not exists goal            text      check (goal in ('maintain','lose','gain')),
  add column if not exists condition       text      default 'healthy',  -- healthy/diabetes_t2/obesity/ckd/cvd
  add column if not exists life_stage      text      default 'default',
  add column if not exists formula         text      default 'who' check (formula in ('who','mifflin')),
  add column if not exists target_weight   numeric,  -- кг, куда идём
  add column if not exists dietary_prefs   text[]    default '{}',  -- ['vegetarian','keto',...]
  add column if not exists allergies       text[]    default '{}',  -- ['gluten','dairy',...]
  add column if not exists units           text      default 'metric' check (units in ('metric','imperial')),
  add column if not exists onboarding_completed boolean default false;

-- =====================================================================
-- 2. diary_entries: что и когда съел пользователь (ЯДРО приложения)
-- ---------------------------------------------------------------------
-- Макросы снимаем В МОМЕНТ ЗАПИСИ (денормализованно), а не тянем из
-- справочника при показе. Иначе правка базы продуктов переписала бы
-- историю: "что я ел вчера" осталось бы правдивым.
-- food_id опционален — для своих/кастомных продуктов его нет.
-- =====================================================================

create table if not exists public.diary_entries (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  entry_date     date not null,                       -- день (без времени)
  meal_type      text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  food_id        text,                                -- ссылка на продукт в CSV (id записи), nullable
  food_name      text not null,                       -- снимок названия
  emoji          text default '🍽️',
  calories       numeric not null default 0,          -- макросы ПОРЦИИ (не на 100г)
  protein        numeric not null default 0,
  carbs          numeric not null default 0,
  fat            numeric not null default 0,
  fiber          numeric default 0,
  quantity       numeric not null default 100,        -- сколько грамм
  quantity_unit  text default 'г',
  logged_at      timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

-- Удобные индексы: выборка "что я ел сегодня" и "за период".
create index if not exists idx_diary_user_date
  on public.diary_entries(user_id, entry_date desc);
create index if not exists idx_diary_user_meal
  on public.diary_entries(user_id, entry_date, meal_type);

alter table public.diary_entries enable row level security;

-- Каждый видит и правит ТОЛЬКО свои записи дневника.
drop policy if exists "diary_select_own" on public.diary_entries;
create policy "diary_select_own"
  on public.diary_entries for select
  using (auth.uid() = user_id);

drop policy if exists "diary_insert_own" on public.diary_entries;
create policy "diary_insert_own"
  on public.diary_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "diary_update_own" on public.diary_entries;
create policy "diary_update_own"
  on public.diary_entries for update
  using (auth.uid() = user_id);

drop policy if exists "diary_delete_own" on public.diary_entries;
create policy "diary_delete_own"
  on public.diary_entries for delete
  using (auth.uid() = user_id);

-- =====================================================================
-- 3. weight_log: динамика веса для графиков прогресса
-- ---------------------------------------------------------------------
-- Текущий вес = последняя запись. Не кешируем на profiles —
-- проще всегда брать MAX(recorded_at) отсюда.
-- =====================================================================

create table if not exists public.weight_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  weight       numeric not null check (weight between 30 and 400),  -- кг
  recorded_at  date not null default current_date,
  created_at   timestamptz not null default now(),
  unique (user_id, recorded_at)  -- одна запись веса на день
);

create index if not exists idx_weight_user_date
  on public.weight_log(user_id, recorded_at desc);

alter table public.weight_log enable row level security;

drop policy if exists "weight_select_own" on public.weight_log;
create policy "weight_select_own"
  on public.weight_log for select
  using (auth.uid() = user_id);

drop policy if exists "weight_insert_own" on public.weight_log;
create policy "weight_insert_own"
  on public.weight_log for insert
  with check (auth.uid() = user_id);

drop policy if exists "weight_delete_own" on public.weight_log;
create policy "weight_delete_own"
  on public.weight_log for delete
  using (auth.uid() = user_id);
-- update намеренно нет: вместо правки лучше удалить+вставить (одна запись/день).

-- =====================================================================
-- 4. water_log: стаканы воды по дням
-- ---------------------------------------------------------------------
-- Одна строка на user+date, инкремент по клику "+ стакан".
-- =====================================================================

create table if not exists public.water_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  entry_date   date not null,
  glasses      integer not null default 0 check (glasses >= 0 and glasses <= 50),
  updated_at   timestamptz not null default now(),
  unique (user_id, entry_date)
);

alter table public.water_log enable row level security;

drop policy if exists "water_select_own" on public.water_log;
create policy "water_select_own"
  on public.water_log for select
  using (auth.uid() = user_id);

drop policy if exists "water_insert_own" on public.water_log;
create policy "water_insert_own"
  on public.water_log for insert
  with check (auth.uid() = user_id);

drop policy if exists "water_update_own" on public.water_log;
create policy "water_update_own"
  on public.water_log for update
  using (auth.uid() = user_id);

-- =====================================================================
-- Проверка (после Run должны появиться таблицы и колонки):
--   \d public.profiles
--   select column_name from information_schema.columns
--     where table_name='profiles' order by ordinal_position;
-- =====================================================================
