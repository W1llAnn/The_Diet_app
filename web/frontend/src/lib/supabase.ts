import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Supabase-клиент для всего приложения.
 *
 * Ключи читаются из Vite-окружения (.env, префикс VITE_ обязателен).
 * Анонимный ключ (anon) публичен по дизайну — безопасность держится
 * на Row Level Security в Supabase, а не на секретности ключа.
 *
 * Тип Database (опционально) даёт автодополнение таблиц/колонок в редакторе.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    '[supabase] Не заданы VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Скопируй .env.example в .env и подставь значения из Supabase.'
  );
}

export const supabase = createClient<Database>(url ?? '', anonKey ?? '', {
  auth: {
    // Хранить сессию в localStorage, чтобы не логиниться при каждом заходе.
    persistSession: true,
    // Авто-рефреш просроченного токена.
    autoRefreshToken: true,
    // Не детектить сессию из URL — у нас вход через форму, не через OAuth-редирект.
    detectSessionInUrl: false,
  },
});

/**
 * Проверяет, является ли текущий пользователь администратором.
 *
 * Права хранятся в таблице profiles (колонка is_admin), а НЕ зашиты в код —
 * так администратором управляют исключительно через БД, и admin-email
 * нигде в бандле не светится.
 *
 * Возвращает false для анонима и для любого пользователя без is_admin=true.
 */
export async function fetchIsAdmin(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[supabase] Ошибка чтения profiles.is_admin:', error.message);
    return false;
  }
  return data?.is_admin === true;
}
