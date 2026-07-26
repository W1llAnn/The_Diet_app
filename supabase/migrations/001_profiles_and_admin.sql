-- =====================================================================
-- Vivora: таблица профилей + роли администратора
-- ---------------------------------------------------------------------
-- Выполни ОДИН раз в Supabase Studio → SQL Editor → New query.
-- Скопируй весь файл и нажми Run.
-- =====================================================================

-- 1. Таблица профилей: по одной строке на пользователя auth.users.
--    Колонка is_admin определяет полные права (по умолчанию false).
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 2. Автоматически создавать профиль при регистрации нового пользователя.
--    Триггер на insert в auth.users → вставляет строку в profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Назначить администратора по email.
--    Подставь свой email (или оставь как есть — он уже указан).
update public.profiles
set is_admin = true
where email = '9506514719@mail.ru';

-- Если профиль для админа ещё не создан триггером (пользователь заведён
-- ДО выполнения этого скрипта) — вставим его вручную, привязав к auth.users.
insert into public.profiles (id, email, is_admin)
select id, email, true
from auth.users
where email = '9506514719@mail.ru'
  and not exists (select 1 from public.profiles p where p.id = auth.users.id);

-- =====================================================================
-- 4. Row Level Security: кто что может читать/писать в profiles.
-- ---------------------------------------------------------------------
-- Политика: каждый видит и редактирует ТОЛЬКУ свой профиль.
-- Чтение/запись чужих профилей (и в особенности флаг is_admin) — запрещены.
-- Исключений для админа тут НЕТ: админ правит данные через панель Supabase
-- (service_role), а через клиентское приложение только видит свой is_admin.
-- =====================================================================

alter table public.profiles enable row level security;

-- Читать можно только свою строку.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Обновлять можно только свою строку.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ВАЖНО: отдельной политики на is_admin НЕТ — то есть через клиентский
-- UPDATE нельзя поменять чужой или даже свой is_admin (RLS режет по id),
-- но свой is_admin менять можно. Чтобы запретить менять себе is_admin,
-- добавляем ограничение на уровне колонки через триггер:

create or replace function public.protect_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Пользователь не может сам себе поднять/снять is_admin через клиент.
  if new.is_admin is distinct from old.is_admin then
    raise exception 'Изменение is_admin разрешено только через панель Supabase';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_is_admin on public.profiles;
create trigger protect_is_admin
  before update on public.profiles
  for each row execute function public.protect_is_admin();

-- Готово. Проверка:
-- select email, is_admin from public.profiles;
