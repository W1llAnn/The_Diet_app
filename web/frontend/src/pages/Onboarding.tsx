import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Leaf } from 'lucide-react';
import type { Page } from '@/App';
import Vivi from '@/components/Vivi';
import { supabase } from '@/lib/supabase';

interface OnboardingProps {
  onNavigate: (page: Page) => void;
}

const goals = [
  { id: 'lose', label: 'Снизить вес', emoji: '⚖️' },
  { id: 'gain', label: 'Набрать вес', emoji: '💪' },
  { id: 'maintain', label: 'Поддерживать вес', emoji: '🌱' },
  { id: 'build', label: 'Нарастить мышцы', emoji: '🏋️' },
  { id: 'energy', label: 'Больше энергии', emoji: '⚡' },
  { id: 'health', label: 'Питаться здоровее', emoji: '🥗' },
  { id: 'manage', label: 'Контроль состояния', emoji: '🩺' },
  { id: 'sleep', label: 'Лучший сон', emoji: '😴' },
];

const activityLevels = [
  { id: 'sedentary', label: 'Сидячий образ жизни', desc: 'Мало или без упражнений', factor: 1.2 },
  { id: 'light', label: 'Лёгкая активность', desc: 'Упражнения 1–3 дня/неделю', factor: 1.375 },
  { id: 'moderate', label: 'Умеренная активность', desc: 'Упражнения 3–5 дней/неделю', factor: 1.55 },
  { id: 'very', label: 'Высокая активность', desc: 'Упражнения 6–7 дней/неделю', factor: 1.725 },
  { id: 'extra', label: 'Очень высокая активность', desc: 'Ежедневные тяжёлые тренировки или работа', factor: 1.9 },
];

const dietaryPrefs = [
  { id: 'none', label: 'Без ограничений', emoji: '✅' },
  { id: 'vegetarian', label: 'Вегетарианство', emoji: '🥕' },
  { id: 'vegan', label: 'Веганство', emoji: '🌱' },
  { id: 'pescatarian', label: 'Пескетарианство', emoji: '🐟' },
  { id: 'keto', label: 'Кето', emoji: '🥑' },
  { id: 'paleo', label: 'Палео', emoji: '🍖' },
  { id: 'halal', label: 'Халяль', emoji: '☪️' },
  { id: 'kosher', label: 'Кошер', emoji: '✡️' },
];

const allergies = [
  'Глютен', 'Молочное', 'Яйца', 'Орехи', 'Арахис', 'Морепродукты', 'Соя', 'Кунжут', 'Рыба',
];

const conditions = [
  { id: 'diabetes', label: 'Диабет', emoji: '🩸' },
  { id: 'obesity', label: 'Ожирение', emoji: '⚖️' },
  { id: 'hypertension', label: 'Гипертония', emoji: '❤️' },
  { id: 'kidney', label: 'Заболевание почек', emoji: '🫘' },
  { id: 'digestive', label: 'Расстройства пищеварения', emoji: '🌿' },
  { id: 'pcos', label: 'СПКЯ', emoji: '🌸' },
  { id: 'cholesterol', label: 'Высокий холестерин', emoji: '🫀' },
  { id: 'none', label: 'Ничего из этого', emoji: '✅' },
];

const habits = [
  { id: 'water', label: 'Пить больше воды', emoji: '💧' },
  { id: 'breakfast', label: 'Завтракать каждый день', emoji: '🍳' },
  { id: 'veggies', label: 'Больше овощей', emoji: '🥬' },
  { id: 'lesssugar', label: 'Меньше сахара', emoji: '🍬' },
  { id: 'cooking', label: 'Готовить дома', emoji: '👨‍🍳' },
  { id: 'mindful', label: 'Осознанное питание', emoji: '🧘' },
];

const steps = ['Welcome', 'Goals', 'About you', 'Body', 'Activity', 'Conditions', 'Allergies', 'Diet', 'Target', 'Habits'];

export default function Onboarding({ onNavigate }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    goals: [] as string[],
    gender: '',
    age: 28,
    height: 170,
    weight: 70,
    activity: '',
    conditions: [] as string[],
    allergies: [] as string[],
    diet: 'none',
    targetWeight: 68,
    habits: [] as string[],
  });

  const toggle = (key: 'goals' | 'conditions' | 'allergies' | 'habits', value: string) => {
    setData((d) => {
      const arr = d[key];
      return { ...d, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  // Сохранение профиля в БД по завершении онбординга.
  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Сессия истекла — войдите снова.');
      setSaving(false);
      return false;
    }
    // Главная цель → goal калькулятора (maintain/lose/gain).
    const primaryGoal = data.goals.includes('lose') ? 'lose'
      : data.goals.includes('gain') ? 'gain'
      : 'maintain';
    // Первое состояние → condition (если выбрано), иначе healthy.
    const cond = data.conditions.length && data.conditions[0] !== 'none' ? data.conditions[0] : 'healthy';

    const { error: upErr } = await supabase.from('profiles').update({
      sex: (data.gender || null) as 'male' | 'female' | 'other' | null,
      age: data.age,
      height: data.height,
      activity: data.activity || null,
      goal: primaryGoal,
      condition: cond,
      goals: data.goals,
      habits: data.habits,
      dietary_prefs: data.diet !== 'none' ? [data.diet] : [],
      allergies: data.allergies,
      target_weight: data.targetWeight,
      onboarding_completed: true,
    }).eq('id', user.id);
    setSaving(false);
    if (upErr) {
      setError(upErr.message);
      return false;
    }
    // Записать стартовый вес в weight_log.
    await supabase.from('weight_log').upsert(
      { user_id: user.id, weight: data.weight, recorded_at: new Date().toISOString().slice(0, 10) },
      { onConflict: 'user_id,recorded_at' }
    );
    return true;
  };

  const next = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const ok = await saveProfile();
      if (ok) onNavigate('dashboard');
    }
  };
  const back = () => (step > 0 ? setStep(step - 1) : onNavigate('register'));

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <header className="px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between border-b border-border bg-white/50 backdrop-blur safe-area-top">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-bold text-text-primary">Vivora</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-20 sm:w-32 lg:w-64 h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-text-secondary font-medium whitespace-nowrap">{step + 1}/{steps.length}</span>
        </div>
        <button onClick={() => onNavigate('dashboard')} className="text-sm text-text-secondary hover:text-primary flex-shrink-0">Пропустить</button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-2xl">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Vivi size={120} mood="waving" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Добро пожаловать в Vivora!</h1>
              <p className="text-lg text-text-secondary mt-4 max-w-md mx-auto leading-relaxed">
                Я Виви, ваш персональный помощник по питанию. Потратим пару минут, чтобы узнать вас получше, и я помогу вам чувствовать себя на все сто.
              </p>
              <div className="bg-white rounded-2xl p-5 mt-8 shadow-soft text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <Vivi size={40} mood="happy" animate={false} />
                  <p className="text-sm text-text-primary">Это займёт около 3 минут. Всё можно будет изменить позже.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Goals */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Какие у вас цели?</h2>
              <p className="text-text-secondary mt-2">Выберите всё, что откликается. Мы построим план вокруг них.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggle('goals', g.id)}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-center ${
                      data.goals.includes(g.id) ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{g.emoji}</div>
                    <p className="text-xs sm:text-sm font-medium text-text-primary">{g.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Gender */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Ваш пол?</h2>
              <p className="text-text-secondary mt-2">Это поможет точно рассчитать ваши потребности в питании.</p>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {[
                  { id: 'female', label: 'Женский', emoji: '👩' },
                  { id: 'male', label: 'Мужской', emoji: '👨' },
                  { id: 'other', label: 'Другое', emoji: '🧑' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setData({ ...data, gender: g.id })}
                    className={`p-4 sm:p-6 rounded-2xl border-2 transition-all text-center ${
                      data.gender === g.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl mb-1.5 sm:mb-2">{g.emoji}</div>
                    <p className="text-sm font-medium text-text-primary">{g.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Age */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Сколько вам лет?</h2>
              <p className="text-text-secondary mt-2">Возраст влияет на ваши потребности в калориях и нутриентах.</p>
              <div className="bg-white rounded-2xl p-8 mt-6 shadow-soft text-center">
                <p className="text-6xl font-bold text-primary">{data.age}</p>
                <p className="text-text-secondary mt-1">лет</p>
                <input
                  type="range"
                  min={13}
                  max={100}
                  value={data.age}
                  onChange={(e) => setData({ ...data, age: +e.target.value })}
                  className="w-full mt-6"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-2">
                  <span>13</span><span>100</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Height & Weight */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Ваше тело</h2>
              <p className="text-text-secondary mt-2">Это останется в секрете. Мы используем это, чтобы персонализировать ваш план.</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                  <p className="text-sm text-text-secondary">Рост</p>
                  <p className="text-4xl font-bold text-primary mt-2">{data.height}<span className="text-lg text-text-secondary ml-1">cm</span></p>
                  <input type="range" min={120} max={220} value={data.height} onChange={(e) => setData({ ...data, height: +e.target.value })} className="w-full mt-4" />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                  <p className="text-sm text-text-secondary">Вес</p>
                  <p className="text-4xl font-bold text-primary mt-2">{data.weight}<span className="text-lg text-text-secondary ml-1">kg</span></p>
                  <input type="range" min={30} max={200} value={data.weight} onChange={(e) => setData({ ...data, weight: +e.target.value })} className="w-full mt-4" />
                </div>
              </div>
              <div className="bg-primary-50 rounded-2xl p-4 mt-4 flex items-center gap-3">
                <Vivi size={36} mood="happy" animate={false} />
                <p className="text-sm text-text-primary">Ваш ИМТ — <span className="font-bold">{(data.weight / Math.pow(data.height / 100, 2)).toFixed(1)}</span> — отличная отправная точка!</p>
              </div>
            </div>
          )}

          {/* Step 5: Activity */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Какой у вас уровень активности?</h2>
              <p className="text-text-secondary mt-2">Будьте честны — неправильных ответов нет.</p>
              <div className="space-y-3 mt-6">
                {activityLevels.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setData({ ...data, activity: a.id })}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      data.activity === a.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-text-primary">{a.label}</p>
                      <p className="text-sm text-text-secondary">{a.desc}</p>
                    </div>
                    {data.activity === a.id && <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Conditions */}
          {step === 6 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Есть ли у вас заболевания?</h2>
              <p className="text-text-secondary mt-2">Это поможет Виви адаптировать рекомендации. Всё по желанию.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {conditions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggle('conditions', c.id)}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-center ${
                      data.conditions.includes(c.id) ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{c.emoji}</div>
                    <p className="text-xs sm:text-sm font-medium text-text-primary">{c.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Allergies */}
          {step === 7 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Есть ли у вас пищевая аллергия?</h2>
              <p className="text-text-secondary mt-2">Мы обязательно отметим это в каждой рекомендации.</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {allergies.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggle('allergies', a)}
                    className={`px-4 py-2.5 rounded-xl border-2 font-medium transition-all ${
                      data.allergies.includes(a) ? 'border-accent bg-accent-50 text-accent-700' : 'border-border bg-white text-text-primary hover:border-accent-200'
                    }`}
                  >
                    {data.allergies.includes(a) && '✓ '}{a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Diet */}
          {step === 8 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Предпочтения в питании?</h2>
              <p className="text-text-secondary mt-2">Как вам нравится питаться? Мы всегда будем это учитывать.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {dietaryPrefs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setData({ ...data, diet: d.id })}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-center ${
                      data.diet === d.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{d.emoji}</div>
                    <p className="text-xs sm:text-sm font-medium text-text-primary">{d.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Target weight */}
          {step === 9 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Каков ваш целевой вес?</h2>
              <p className="text-text-secondary mt-2">Не торопимся — дойдём мягко и вместе.</p>
              <div className="bg-white rounded-2xl p-8 mt-6 shadow-soft text-center">
                <p className="text-6xl font-bold text-primary">{data.targetWeight}<span className="text-lg text-text-secondary ml-1">kg</span></p>
                <input type="range" min={40} max={180} value={data.targetWeight} onChange={(e) => setData({ ...data, targetWeight: +e.target.value })} className="w-full mt-6" />
                <p className="text-sm text-text-secondary mt-4">
                  Это <span className="font-bold text-primary">{Math.abs(data.weight - data.targetWeight)} kg</span> {data.targetWeight < data.weight ? 'сбросить' : 'набрать'} — вполне реально!
                </p>
              </div>
            </div>
          )}

          {/* Step 10: Habits */}
          {step === 10 && (
            <div>
              <div className="flex justify-center mb-4">
                <Vivi size={80} mood="excited" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Давайте выработаем привычки!</h2>
              <p className="text-text-secondary mt-2">Выберите несколько ежедневных привычек, над которыми хотите поработать. Маленькие шаги — большие перемены.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {habits.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => toggle('habits', h.id)}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-center ${
                      data.habits.includes(h.id) ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{h.emoji}</div>
                    <p className="text-xs sm:text-sm font-medium text-text-primary">{h.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 sm:mt-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-3">
                {error}
              </div>
            )}
            <div className="flex items-center justify-between">
              <button onClick={back} className="btn-ghost flex items-center gap-2">
                <ArrowLeft size={18} /> Назад
              </button>
              <button
                onClick={next}
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Сохраняем…' : (step === steps.length - 1 ? 'Войти в Vivora' : 'Продолжить')}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
