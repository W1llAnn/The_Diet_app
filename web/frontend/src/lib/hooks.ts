import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
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

// ============================================================ useProfile
// Читает и обновляет профиль текущего пользователя.
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (active) { setProfile(data); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const update = useCallback(async (patch: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
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

  useEffect(() => { load(); }, [load]);

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

  useEffect(() => { load(); }, [load]);

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

  useEffect(() => { load(); }, [load]);

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

export type { Profile, DiaryEntry, WeightLog, WaterLog };
