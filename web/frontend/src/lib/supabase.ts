import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Supabase-ключи проекта Vivora.
 *
 * Эти значения ПУБЛИЧНЫ по дизайну: anon-ключ зашивается в клиентский бандл
 * и виден всем в браузере. Это НЕ секрет — безопасность держится на Row Level
 * Security в Supabase (profiles: читать/писать только свою строку; is_admin
 * защищён триггером), а не на скрытости ключа.
 *
 * Зашиты в код (а не в .env), чтобы быть доступными при сборке на GitHub
 * Actions — там локальный .env не существует, и иначе деплой падал бы с
 * 'supabaseUrl is required'. Для статического хостинга (GitHub Pages)
 * это стандартный подход.
 */
const SUPABASE_URL = 'https://yawwjjfxxkrwwqxxblxf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhd3dqamZ4eGtyd3dxeHhibHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzUyNDMsImV4cCI6MjEwMDY1MTI0M30.aJQfGACVNsZG16IeDmNE66oXpmMkFnobxpUcsb5tnPM';

// Локальный .env (если есть) перекрывает зашитые значения — удобно для
// тестовых проектов без правки кода.
const url = import.meta.env.VITE_SUPABASE_URL ?? SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('[supabase] Не заданы ключи Supabase — проверь src/lib/supabase.ts.');
}

export const supabase = createClient<Database>(url, anonKey, {
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
