/**
 * Типы схемы БД Vivora (Supabase/Postgres).
 *
 * Написаны вручную по миграциям supabase/migrations/001 и 002, т.к.
 * среда без Node/Supabase CLI не позволяет сгенерировать их командой
 * `supabase gen types`. Структура совпадает с тем, что генерирует CLI,
 * поэтому createClient<Database> получает автодополнение таблиц/колонок.
 *
 * Когда появится возможность — перегенерировать командой (см. ниже) и
 * заменить этот файл; пока править синхронно с миграциями.
 *
 *   npx supabase gen types typescript --project-id yawwjjfxxkrwwqxxblxf \
 *     > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ---------------------------------------------------------------- profiles
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          is_admin: boolean | null;
          // расширение из миграции 002 + 003:
          sex: 'male' | 'female' | 'other' | null;
          age: number | null;
          height: number | null; // см
          activity: string | null; // ключ из ACTIVITY_LEVELS (UI или калькулятора)
          goal: 'maintain' | 'lose' | 'gain' | null;
          condition: string | null; // healthy/diabetes_t2/obesity/ckd/cvd/...
          life_stage: string | null;
          formula: 'who' | 'mifflin' | null;
          target_weight: number | null; // кг
          dietary_prefs: string[] | null;
          allergies: string[] | null;
          units: 'metric' | 'imperial' | null;
          onboarding_completed: boolean | null;
          goals: string[] | null; // из онбординга: lose/gain/maintain/build/...
          habits: string[] | null; // из онбординга: water/breakfast/veggies/...
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          is_admin?: boolean | null;
          sex?: 'male' | 'female' | null;
          age?: number | null;
          height?: number | null;
          activity?: string | null;
          goal?: 'maintain' | 'lose' | 'gain' | null;
          condition?: string | null;
          life_stage?: string | null;
          formula?: 'who' | 'mifflin' | null;
          target_weight?: number | null;
          dietary_prefs?: string[] | null;
          allergies?: string[] | null;
          units?: 'metric' | 'imperial' | null;
          onboarding_completed?: boolean | null;
          created_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          is_admin?: boolean | null;
          sex?: 'male' | 'female' | null;
          age?: number | null;
          height?: number | null;
          activity?: string | null;
          goal?: 'maintain' | 'lose' | 'gain' | null;
          condition?: string | null;
          life_stage?: string | null;
          formula?: 'who' | 'mifflin' | null;
          target_weight?: number | null;
          dietary_prefs?: string[] | null;
          allergies?: string[] | null;
          units?: 'metric' | 'imperial' | null;
          onboarding_completed?: boolean | null;
        };
      };
      // --------------------------------------------------------- diary_entries
      diary_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string; // 'YYYY-MM-DD'
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_id: string | null;
          food_name: string;
          emoji: string | null;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          fiber: number | null;
          quantity: number;
          quantity_unit: string | null;
          logged_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_id?: string | null;
          food_name: string;
          emoji?: string | null;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          fiber?: number | null;
          quantity?: number;
          quantity_unit?: string | null;
          logged_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['diary_entries']['Insert']>;
      };
      // ------------------------------------------------------------- weight_log
      weight_log: {
        Row: {
          id: string;
          user_id: string;
          weight: number; // кг
          recorded_at: string; // 'YYYY-MM-DD'
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight: number;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          weight?: number;
          recorded_at?: string;
        };
      };
      // -------------------------------------------------------------- water_log
      water_log: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string; // 'YYYY-MM-DD'
          glasses: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date: string;
          glasses?: number;
          updated_at?: string;
        };
        Update: {
          glasses?: number;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
