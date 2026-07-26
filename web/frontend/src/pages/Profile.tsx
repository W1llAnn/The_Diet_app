import { useState, useEffect } from 'react';
import { ChevronRight, Award, Heart, Settings as SettingsIcon, HelpCircle, Bell, Crown, LogOut, Target, TrendingUp, Save, Check, type LucideIcon } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import { useProfile, useWeight } from '@/lib/hooks';

interface ProfileProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

// Справочники для формы здоровья.
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

export default function Profile({ currentPage, onNavigate }: ProfileProps) {
  const { profile, update } = useProfile();
  const { logs: weightLogs, log: logWeight } = useWeight(7);

  const menuItems: { icon: LucideIcon; label: string; page: Page; badge?: string }[] = [
    { icon: Target, label: 'Мои цели и профиль', page: 'settings' },
    { icon: TrendingUp, label: 'Прогресс и статистика', page: 'progress' },
    { icon: Award, label: 'Достижения', page: 'achievements' },
    { icon: Heart, label: 'Состояние здоровья', page: 'medical' },
    { icon: Crown, label: 'Премиум-подписка', page: 'premium', badge: 'Pro' },
    { icon: Bell, label: 'Уведомления', page: 'notifications' },
    { icon: SettingsIcon, label: 'Настройки', page: 'settings' },
    { icon: HelpCircle, label: 'Центр помощи', page: 'help' },
  ];

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
    const res = await update({
      sex: (form.sex || null) as 'male' | 'female' | null,
      age: form.age,
      height: form.height,
      activity: form.activity,
      goal: form.goal as 'maintain' | 'lose' | 'gain',
      condition: form.condition,
      onboarding_completed: true,
    });
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

  // Производные значения для шапки/статистики.
  const displayName = profile?.full_name || profile?.email || 'Профиль';
  const initials = (profile?.full_name || profile?.email || 'П')?.charAt(0).toUpperCase();
  const currentWeight = weightLogs.length ? Number(weightLogs[weightLogs.length - 1].weight) : null;
  const bmi = profile?.height ? (form.weight / Math.pow(profile.height / 100, 2)) : null;

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Профиль" subtitle="Ваш аккаунт и предпочтения">
      {/* Profile header */}
      <div className="card mb-4 sm:mb-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-full flex items-center justify-center text-2xl sm:text-3xl text-white font-bold shadow-soft flex-shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary truncate">{displayName}</h2>
            <p className="text-sm text-text-secondary truncate">{profile?.email}</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
              {profile?.onboarding_completed
                ? <span className="tag bg-primary-50 text-primary text-xs">✓ Профиль настроен</span>
                : <span className="tag bg-accent-50 text-accent-700 text-xs">Профиль не заполнен</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{currentWeight !== null ? currentWeight.toFixed(1) : '—'}</p>
          <p className="text-xs text-text-secondary">Текущий вес (кг)</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-info">{bmi !== null ? bmi.toFixed(0) : '—'}</p>
          <p className="text-xs text-text-secondary">ИМТ</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-accent">{form.height || '—'}</p>
          <p className="text-xs text-text-secondary">Рост (см)</p>
        </div>
      </div>

      {/* Профиль здоровья (форма редактирования) */}
      <div className="card p-2 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 px-3 py-2">
          <Heart size={14} className="text-accent" />
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Профиль здоровья</p>
        </div>

        {/* Форма показывается ВСЕГДА — с дефолтами, если профиль ещё не загружен.
            Так пользователь может заполнить и сохранить даже при проблемах с загрузкой. */}
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
      </div>

      {/* Vivi message */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5">
        <Vivi size={48} mood="love" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            {profile?.onboarding_completed
              ? 'Спасибо, что поделились своими данными! Я буду опираться на них в рекомендациях. 💚'
              : 'Заполните профиль здоровья выше — и мои советы станут точнее.'}
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="card p-2">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => onNavigate(item.page)}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-cream transition-all text-left"
          >
            <item.icon size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{item.label}</span>
            {item.badge && <span className="tag bg-accent-50 text-accent-700 text-xs">{item.badge}</span>}
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        ))}
        <div className="h-px bg-border my-1" />
        <button className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-red-50 transition-all text-left text-red-500">
          <LogOut size={18} />
          <span className="flex-1 text-sm font-medium">Выйти</span>
        </button>
      </div>

      <p className="text-center text-xs text-text-secondary mt-6 mb-2">Vivora v1.0.0 · Сделано с 💚</p>
    </AppShell>
  );
}
