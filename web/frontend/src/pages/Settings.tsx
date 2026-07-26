import { useState, useEffect } from 'react';
import { ChevronRight, Bell, Globe, Moon, Lock, User, Database as DataIcon, HelpCircle, Shield, LogOut, Heart, Save, Check, type LucideIcon } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import { supabase } from '@/lib/supabase';
import { useProfile, useWeight } from '@/lib/hooks';
import type { User as AuthUser } from '@supabase/supabase-js';

interface SettingsProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user?: AuthUser | null;
  isAdmin?: boolean;
}

// Справочники для формы здоровья (более компактные, чем в онбординге).
const SEXES = [
  { id: 'female', label: 'Женский' },
  { id: 'male', label: 'Мужской' },
];
const ACTIVITIES = [
  { id: 'sedentary', label: 'Сидячий' },
  { id: 'light', label: 'Лёгкая' },
  { id: 'moderate', label: 'Умеренная' },
  { id: 'very', label: 'Высокая' },
  { id: 'extra', label: 'Очень высокая' },
];
const GOALS = [
  { id: 'lose', label: 'Снизить вес' },
  { id: 'maintain', label: 'Поддерживать' },
  { id: 'gain', label: 'Набрать вес' },
];
const CONDITIONS = [
  { id: 'healthy', label: 'Здоров' },
  { id: 'diabetes', label: 'Диабет' },
  { id: 'obesity', label: 'Ожирение' },
  { id: 'hypertension', label: 'Гипертония' },
  { id: 'kidney', label: 'Почки' },
];

export default function Settings({ currentPage, onNavigate, user, isAdmin }: SettingsProps) {
  const { profile, update } = useProfile();
  const { logs: weightLogs, log: logWeight } = useWeight(7);
  const [notifications, setNotifications] = useState({ meal: true, water: true, achievements: true, weekly: false, ai: true });
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [darkMode, setDarkMode] = useState(false);
  const [privacy, setPrivacy] = useState({ analytics: false, shareData: false });

  // --- Форма здоровья (предзаполняется из БД) ---
  const [form, setForm] = useState({
    sex: '' as string,
    age: 28,
    height: 170,
    weight: 70,
    activity: 'sedentary' as string,
    goal: 'maintain' as string,
    condition: 'healthy' as string,
  });
  const [formDirty, setFormDirty] = useState(false);
  const [savingForm, setSavingForm] = useState(false);
  const [formSaved, setFormSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Предзаполнение формы, когда профиль загрузился.
  useEffect(() => {
    if (!profile) return;
    const lastWeight = weightLogs.length ? Number(weightLogs[weightLogs.length - 1].weight) : null;
    setForm({
      sex: profile.sex ?? '',
      age: profile.age ?? 28,
      height: profile.height ?? 170,
      weight: lastWeight ?? 70,
      activity: profile.activity ?? 'sedentary',
      goal: profile.goal ?? 'maintain',
      condition: profile.condition ?? 'healthy',
    });
    setFormDirty(false);
  }, [profile, weightLogs]);

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFormDirty(true);
    setFormSaved(false);
  };

  const saveHealth = async () => {
    setSavingForm(true);
    setFormError(null);
    // Профиль.
    const res = await update({
      sex: (form.sex || null) as 'male' | 'female' | null,
      age: form.age,
      height: form.height,
      activity: form.activity,
      goal: form.goal as 'maintain' | 'lose' | 'gain',
      condition: form.condition,
      onboarding_completed: true,
    });
    // Вес — отдельной записью (если меняли).
    await logWeight(form.weight);
    setSavingForm(false);
    if (!res) {
      setFormError('Не удалось сохранить. Проверьте подключение и права.');
      return;
    }
    setFormDirty(false);
    setFormSaved(true);
    setTimeout(() => setFormSaved(false), 2500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('landing');
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`w-11 h-6 rounded-full transition-all relative ${on ? 'bg-primary' : 'bg-border'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-soft transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Настройки" subtitle="Настройте Vivora под себя">
      {/* Текущий пользователь */}
      {user && (
        <div className="card p-4 mb-4 sm:mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user.email}</p>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium text-primary">
                <Shield size={12} /> Administrator
              </span>
            ) : (
              <p className="text-xs text-text-secondary">Обычный аккаунт</p>
            )}
          </div>
        </div>
      )}

      {/* Account */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Аккаунт</p>
        {[
          { icon: User, label: 'Личные данные', action: () => onNavigate('profile') },
          { icon: Lock, label: 'Сменить пароль', action: () => onNavigate('forgot') },
        ].map((item, i) => (
          <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-cream transition-all text-left">
            <item.icon size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{item.label}</span>
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        ))}
      </div>

      {/* Профиль здоровья (форма редактирования) */}
      <div className="card p-2 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 px-3 py-2">
          <Heart size={14} className="text-accent" />
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Профиль здоровья</p>
        </div>

        {!profile ? (
          <p className="text-sm text-text-secondary px-3 py-4">Загрузка профиля…</p>
        ) : (
          <div className="px-3 py-2 space-y-4">
            {/* Пол */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Пол</label>
              <div className="flex gap-2">
                {SEXES.map((s) => (
                  <button key={s.id} onClick={() => setField('sex', s.id)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${form.sex === s.id ? 'bg-primary text-white' : 'bg-cream text-text-secondary hover:bg-primary-50'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Возраст */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-text-secondary">Возраст</label>
                <span className="text-sm font-bold text-primary">{form.age} лет</span>
              </div>
              <input type="range" min={13} max={100} value={form.age}
                onChange={(e) => setField('age', +e.target.value)} className="w-full" />
            </div>

            {/* Рост */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-text-secondary">Рост</label>
                <span className="text-sm font-bold text-primary">{form.height} см</span>
              </div>
              <input type="range" min={120} max={220} value={form.height}
                onChange={(e) => setField('height', +e.target.value)} className="w-full" />
            </div>

            {/* Вес */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-text-secondary">Вес (сегодня)</label>
                <span className="text-sm font-bold text-primary">{form.weight} кг</span>
              </div>
              <input type="range" min={30} max={200} value={form.weight}
                onChange={(e) => setField('weight', +e.target.value)} className="w-full" />
            </div>

            {/* Активность */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Активность</label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map((a) => (
                  <button key={a.id} onClick={() => setField('activity', a.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.activity === a.id ? 'bg-primary text-white' : 'bg-cream text-text-secondary hover:bg-primary-50'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Цель */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Цель</label>
              <div className="flex gap-2">
                {GOALS.map((g) => (
                  <button key={g.id} onClick={() => setField('goal', g.id)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${form.goal === g.id ? 'bg-primary text-white' : 'bg-cream text-text-secondary hover:bg-primary-50'}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Состояние здоровья */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Состояние здоровья</label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button key={c.id} onClick={() => setField('condition', c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.condition === c.id ? 'bg-primary text-white' : 'bg-cream text-text-secondary hover:bg-primary-50'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
                {formError}
              </div>
            )}

            <button onClick={saveHealth} disabled={!formDirty || savingForm}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {savingForm ? 'Сохраняем…' : formSaved ? (<><Check size={18} /> Сохранено</>) : (<><Save size={18} /> Сохранить</>)}
            </button>
            {!formDirty && !formSaved && (
              <p className="text-xs text-text-secondary text-center">Измените параметры, чтобы сохранить</p>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Уведомления</p>
        {[
          { key: 'meal', label: 'Напоминания о еде' },
          { key: 'water', label: 'Напоминания о воде' },
          { key: 'achievements', label: 'Уведомления о достижениях' },
          { key: 'weekly', label: 'Недельный отчёт' },
          { key: 'ai', label: 'Советы и мотивация от Виви' },
        ].map((n) => (
          <div key={n.key} className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <Bell size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{n.label}</span>
            <Toggle on={notifications[n.key as keyof typeof notifications]} onClick={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key as keyof typeof notifications] })} />
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Предпочтения</p>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
          <Globe size={18} className="text-text-secondary" />
          <span className="flex-1 text-sm font-medium text-text-primary">Единицы</span>
          <div className="flex gap-1 bg-cream rounded-lg p-1">
            <button onClick={() => setUnits('metric')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${units === 'metric' ? 'bg-white text-primary shadow-soft' : 'text-text-secondary'}`}>Метрические</button>
            <button onClick={() => setUnits('imperial')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${units === 'imperial' ? 'bg-white text-primary shadow-soft' : 'text-text-secondary'}`}>Имперские</button>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
          <Moon size={18} className="text-text-secondary" />
          <span className="flex-1 text-sm font-medium text-text-primary">Тёмная тема</span>
          <Toggle on={darkMode} onClick={() => setDarkMode(!darkMode)} />
        </div>
      </div>

      {/* Privacy */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Конфиденциальность</p>
        {[
          { key: 'analytics', label: 'Делиться статистикой' },
          { key: 'shareData', label: 'Делиться данными с партнёрами' },
        ].map((p) => (
          <div key={p.key} className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <DataIcon size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{p.label}</span>
            <Toggle on={privacy[p.key as keyof typeof privacy]} onClick={() => setPrivacy({ ...privacy, [p.key]: !privacy[p.key as keyof typeof privacy] })} />
          </div>
        ))}
      </div>

      {/* Support */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Поддержка</p>
        {[
          { icon: HelpCircle, label: 'Центр помощи', action: () => onNavigate('help') },
        ].map((item, i) => (
          <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-cream transition-all text-left">
            <item.icon size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{item.label}</span>
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        ))}
      </div>

      {user && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-cream hover:text-text-primary transition-all mb-4"
        >
          <LogOut size={16} /> Выйти
        </button>
      )}

      <p className="text-center text-xs text-text-secondary">Vivora v1.0.0</p>
    </AppShell>
  );
}
