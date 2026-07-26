/**
 * Заглушка типа базы. Пока таблиц нет — пустой тип, чтобы createClient<Database>
 * компилировался и сборка шла.
 *
 * Когда заведём таблицы в Supabase, сгенерируем точный тип командой:
 *   npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
 * и заменим этот файл — тогда в редакторе появится автодополнение таблиц/колонок.
 */
export type Database = {
  // intentionally empty for now
};
