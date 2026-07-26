import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { calculate } from './calculator';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type DiaryEntry = Database['public']['Tables']['diary_entries']['Row'];
type WeightLog = Database['public']['Tables']['weight_log']['Row'];
type WaterLog = Database['public']['Tables']['water_log']['Row'];

// Текущая дата в формате 'YYYY-MM-DD' (локально, без сдвига таймзоны).
function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ============================================================ useUserId
// Даёт uid текущего пользователя, реагируя на появление/исчезновение сессии.
//
// Сессия восстанавливается из localStorage асинхронно: на момент первого
// рендера её может ещё не быть, и supabase.auth.getUser() вернёт null.
// Без подписки хуки данных поймали бы этот момент и остались пустыми навсегда.
// Поэтому: пробуем getSession + подписываемся на onAuthStateChange.
export function useUserId() {
  const [uid, setUid] = useState<string | null | undefined>(undefined); // undefined = ещё не знаем

  useEffect(() => {
    let active = true;
    const apply = (sessionUid: string | null) => {
      if (active) setUid(sessionUid);
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      apply(session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      apply(session?.user?.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return uid; // undefined = загрузка, null = не залогинен, string = id
}

// ============================================================ useProfile
// Читает и обновляет профиль текущего пользователя.
//
// Сессия восстанавливается из localStorage асинхронно, поэтому на момент
// первого рендера её может не быть. Используем три источника uid подряд:
//   1) getSession()        — из localStorage, мгновенно, но может быть пусто;
//   2) getUser()           — стучится на сервер, возвращает актуального юзера
//                            даже если локальная сессия не подхватилась
//                            (надёжный fallback для Firefox/строгих настроек);
//   3) onAuthStateChange   — подписка, ловит вход/выход/восстановление.
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let loaded = false; // не сбрасываем в null при uid=null — только когда точно знаем, что юзера нет

    const fetchProfile = async (uid: string | null) => {
      if (!uid) {
        // Только если точно знаем, что юзера нет — показываем пустой профиль.
        if (loaded && active) setProfile(null);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (error) {
        console.error('[useProfile] select:', error.message);
      }
      loaded = true;
      if (active) { setProfile(data); setLoading(false); }
    };

    const resolveUid = async (): Promise<string | null> => {
      // 1) локальная сессия (мгновенно)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) return session.user.id;
      // 2) fallback: спросить сервер (надёжно, если локально пусто)
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id ?? null;
    };

    resolveUid().then((uid) => { if (active) fetchProfile(uid); });

    // 3) подписка на вход/выход — обновит профиль при изменениях.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      fetchProfile(session?.user?.id ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const update = useCallback(async (patch: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    // upsert вместо update: если строки профиля ещё нет (например, юзер заведён
    // до триггера авто-создания) — она создаётся, иначе обновляется.
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email, ...patch })
      .select()
      .maybeSingle();
    if (error) { console.error('[useProfile] update:', error.message); return null; }
    setProfile(data);
    return data;
  }, []);

  return { profile, loading, update };
}

// ============================================================ useDiary
// Записи дневника на указанную дату (по умолчанию сегодня).
export function useDiary(date: string = todayStr()) {
  const uid = useUserId();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return []; }
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_date', date)
      .order('logged_at', { ascending: true });
    if (error) { console.error('[useDiary] load:', error.message); }
    const list = data ?? [];
    setEntries(list);
    setLoading(false);
    return list;
  }, [date]);

  useEffect(() => { if (uid !== undefined) load(); }, [load, uid]);

  const add = useCallback(async (entry: Database['public']['Tables']['diary_entries']['Insert']) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('diary_entries')
      .insert({ ...entry, user_id: user.id, entry_date: date })
      .select()
      .maybeSingle();
    if (error) { console.error('[useDiary] add:', error.message); return null; }
    if (data) setEntries((prev) => [...prev, data]);
    return data;
  }, [date]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) { console.error('[useDiary] remove:', error.message); return false; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    return true;
  }, []);

  return { entries, loading, add, remove, reload: load };
}

// ============================================================ useWater
// Стаканы воды на сегодня.
export function useWater(date: string = todayStr()) {
  const uid = useUserId();
  const [glasses, setGlasses] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('water_log')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_date', date)
      .maybeSingle();
    setGlasses(data?.glasses ?? 0);
    setLoading(false);
  }, [date]);

  useEffect(() => { if (uid !== undefined) load(); }, [load, uid]);

  // +1 стакан (upsert: создаёт запись или инкрементит существующую).
  const addGlass = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.rpc('increment_water', { p_date: date });
    // Если RPC нет — fallback на upsert руками.
    if (error) {
      const { data: existing } = await supabase
        .from('water_log')
        .select('glasses')
        .eq('user_id', user.id)
        .eq('entry_date', date)
        .maybeSingle();
      const next = (existing?.glasses ?? 0) + 1;
      const { error: upErr } = await supabase
        .from('water_log')
        .upsert(
          { user_id: user.id, entry_date: date, glasses: next },
          { onConflict: 'user_id,entry_date' }
        );
      if (upErr) { console.error('[useWater] upsert:', upErr.message); return; }
      setGlasses(next);
      return;
    }
    setGlasses((g) => g + 1);
  }, [date]);

  return { glasses, loading, addGlass, reload: load };
}

// ============================================================ useWeight
// История веса (по умолчанию последние 90 дней).
export function useWeight(days: number = 90) {
  const uid = useUserId();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('weight_log')
      .select('*')
      .eq('user_id', user.id)
      .gte('recorded_at', sinceStr)
      .order('recorded_at', { ascending: true });
    if (error) { console.error('[useWeight] load:', error.message); }
    setLogs(data ?? []);
    setLoading(false);
  }, [days]);

  useEffect(() => { if (uid !== undefined) load(); }, [load, uid]);

  const log = useCallback(async (weight: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const today = todayStr();
    const { data, error } = await supabase
      .from('weight_log')
      .upsert(
        { user_id: user.id, weight, recorded_at: today },
        { onConflict: 'user_id,recorded_at' }
      )
      .select()
      .maybeSingle();
    if (error) { console.error('[useWeight] log:', error.message); return null; }
    if (data) setLogs((prev) => {
      const without = prev.filter((w) => w.recorded_at !== data.recorded_at);
      return [...without, data].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
    });
    return data;
  }, []);

  return { logs, loading, log, reload: load };
}

// ============================================================ useTargets
// Считает дневные цели (КБЖУ + клетчатка) из профиля и ПОСЛЕДНЕГО веса.
//
// Берёт последние данные: профиль из profiles, вес — последняя запись из
// weight_log. Если профиль неполон (нет пола/роста/веса) — возвращает
// безопасные дефолты (2000 ккал), чтобы UI не падал.
export function useTargets() {
  const { profile } = useProfile();
  const { logs: weightLogs } = useWeight(90);

  // Последний вес: weight_log отсортирован по возрастанию, последний = текущий.
  const currentWeight = weightLogs.length ? Number(weightLogs[weightLogs.length - 1].weight) : null;

  if (!profile || !profile.sex || !profile.height || currentWeight === null || !profile.age) {
    // Профиль неполон — дефолты (как было в моках).
    return {
      targets: {
        target_kcal: 2000, protein_g: 120, fat_g: 65, carbs_g: 250, fiber_g: 25,
        bmr: 0, tdee: 0, condition_label: '', activity_label: '', goal_label: '', warnings: [],
      } as ReturnType<typeof calculate>,
      ready: false,
      currentWeight,
    };
  }

  const targets = calculate({
    sex: profile.sex,
    age: profile.age,
    weight: currentWeight,
    height: profile.height,
    activity: profile.activity,
    goal: profile.goal,
    condition: profile.condition,
    life_stage: profile.life_stage,
    formula: profile.formula ?? 'who',
  });

  return { targets, ready: true, currentWeight };
}

export type { Profile, DiaryEntry, WeightLog, WaterLog };
