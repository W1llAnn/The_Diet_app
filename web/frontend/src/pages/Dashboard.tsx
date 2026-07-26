import { Droplets, Plus, Flame, TrendingUp, Apple, Calendar, Bot, ChefHat } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import ProgressRing from '@/components/ProgressRing';
import Vivi from '@/components/Vivi';
import { useDiary, useWater, useProfile, useWeight } from '@/lib/hooks';

interface DashboardProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snack: 'Перекус',
};
const EMOJI: Record<string, string> = {
  breakfast: '🥣', lunch: '🥗', dinner: '🌙', snack: '🍎',
};

export default function Dashboard({ currentPage, onNavigate }: DashboardProps) {
  const { entries } = useDiary();
  const { glasses } = useWater();
  const { profile } = useProfile();
  const { logs: weightLogs } = useWeight(90);

  const caloriesEaten = Math.round(entries.reduce((s, e) => s + Number(e.calories), 0));
  const caloriesGoal = 2000; // TODO: считать из профиля (после портирования калькулятора)
  const protein = Math.round(entries.reduce((s, e) => s + Number(e.protein), 0));
  const proteinGoal = 120;
  const carbs = Math.round(entries.reduce((s, e) => s + Number(e.carbs), 0));
  const carbsGoal = 250;
  const fat = Math.round(entries.reduce((s, e) => s + Number(e.fat), 0));
  const fatGoal = 65;
  const water = glasses, waterGoal = 8;

  const name = profile?.full_name?.split(' ')[0] || 'друг';

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Главная" subtitle="Сегодня, 26 июля" showSearch>
      {/* Vivi motivation */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <Vivi size={48} mood="happy" className="flex-shrink-0 sm:hidden" />
        <Vivi size={56} mood="happy" className="flex-shrink-0 hidden sm:block" />
        <div className="flex-1 pt-0.5 sm:pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            <span className="font-semibold">Привет, {name}!</span>{' '}
            {entries.length === 0
              ? 'Добавьте первый приём пищи, чтобы начать день. Я рядом и готова помочь! 🌿'
              : `Вы съели ${caloriesEaten} из ${caloriesGoal} ккал — отличный темп. Продолжайте в том же духе! 🌿`}
          </p>
        </div>
      </div>

      {/* Calorie ring + macros */}
      <div className="grid lg:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
        <div className="card flex flex-col items-center justify-center">
          <ProgressRing value={caloriesEaten} max={caloriesGoal} size={160} label={`${caloriesEaten}`} sublabel={`из ${caloriesGoal} ккал`} color="#58B47A" />
          <div className="flex items-center gap-2 mt-3">
            <Flame size={16} className="text-accent" />
            <span className="text-sm text-text-secondary">{caloriesGoal - caloriesEaten} ккал осталось сегодня</span>
          </div>
        </div>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3 sm:gap-5">
          {/* Macros */}
          <div className="card">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Макронутриенты</h3>
            <div className="space-y-4">
              {[
                { label: 'Белки', value: protein, goal: proteinGoal, color: '#58B47A', unit: 'г' },
                { label: 'Углеводы', value: carbs, goal: carbsGoal, color: '#77B7F7', unit: 'г' },
                { label: 'Жиры', value: fat, goal: fatGoal, color: '#FF8A65', unit: 'г' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-text-primary">{m.label}</span>
                    <span className="text-sm text-text-secondary">{m.value}<span className="text-xs">/{m.goal}{m.unit}</span></span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((m.value / m.goal) * 100, 100)}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-secondary">Питьевой режим</h3>
              <Droplets size={18} className="text-info" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[...Array(8)].map((_, i) => (
                <button
                  key={i}
                  className={`w-9 h-12 rounded-lg border-2 flex items-end justify-center pb-1 transition-all ${
                    i < water ? 'bg-info border-info' : 'bg-white border-border'
                  }`}
                >
                  <Droplets size={14} className={i < water ? 'text-white' : 'text-border'} />
                </button>
              ))}
            </div>
            <p className="text-sm text-text-secondary mt-3">{water} из {waterGoal} стаканов — продолжайте пить!</p>
            <button className="btn-secondary w-full mt-3 text-sm py-2">+ Добавить стакан</button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {[
          { icon: Plus, label: 'Записать еду', page: 'diary' as Page, color: 'bg-primary-50 text-primary' },
          { icon: ChefHat, label: 'Рецепты', page: 'recipes' as Page, color: 'bg-accent-50 text-accent-700' },
          { icon: Bot, label: 'Спросить Виви', page: 'ai' as Page, color: 'bg-info-50 text-info-700' },
          { icon: Calendar, label: 'Планировать', page: 'planner' as Page, color: 'bg-primary-50 text-primary' },
        ].map((a) => (
          <button key={a.label} onClick={() => onNavigate(a.page)} className="card-hover flex flex-col items-center gap-2 py-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.color}`}>
              <a.icon size={22} />
            </div>
            <span className="text-sm font-medium text-text-primary">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
        {/* Today's meals */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">Сегодняшние приёмы пищи</h3>
            <button onClick={() => onNavigate('diary')} className="text-sm text-primary font-medium hover:underline">Смотреть все</button>
          </div>
          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-text-secondary text-sm mb-3">Пока ничего не записано</p>
                <button onClick={() => onNavigate('search')} className="btn-primary text-sm">
                  + Добавить первый приём пищи
                </button>
              </div>
            ) : (
              <>
                {entries.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft">{m.emoji || EMOJI[m.meal_type] || '🍽️'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{m.food_name}</p>
                      <p className="text-xs text-text-secondary">
                        {MEAL_LABELS[m.meal_type] || m.meal_type} • {Number(m.quantity)}{m.quantity_unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-primary">{Math.round(Number(m.calories))}</p>
                      <p className="text-xs text-text-secondary">ккал</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => onNavigate('diary')} className="w-full p-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-all text-sm font-medium">
                  + Добавить приём пищи
                </button>
              </>
            )}
          </div>
        </div>

        {/* Weight progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">Динамика веса</h3>
            <TrendingUp size={18} className="text-primary" />
          </div>
          {(() => {
            const recent = weightLogs.slice(-7);
            const current = weightLogs.length ? Number(weightLogs[weightLogs.length - 1].weight) : null;
            const first = weightLogs.length ? Number(weightLogs[0].weight) : null;
            if (current === null) {
              return (
                <div className="text-center py-6">
                  <p className="text-text-secondary text-sm mb-3">Нет записей веса</p>
                  <button onClick={() => onNavigate('progress')} className="btn-secondary text-sm">Записать вес</button>
                </div>
              );
            }
            const delta = first !== null ? current - first : 0;
            const vals = recent.map((w) => Number(w.weight));
            const min = Math.min(...vals), max = Math.max(...vals);
            const range = max - min || 1;
            return (
              <>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-text-primary">{current.toFixed(1)} <span className="text-base text-text-secondary">кг</span></p>
                  {Math.abs(delta) >= 0.05 && (
                    <p className={`text-sm font-medium mt-1 ${delta < 0 ? 'text-primary' : 'text-accent'}`}>
                      {delta < 0 ? '↓' : '↑'} {Math.abs(delta).toFixed(1)} кг с первой записи
                    </p>
                  )}
                </div>
                {/* Mini chart */}
                <div className="flex items-end justify-between gap-1.5 h-24">
                  {recent.map((w, i) => {
                    const val = Number(w.weight);
                    return (
                      <div key={w.id} className="flex-1 bg-primary-200 rounded-t-md bar-animate"
                        style={{ height: `${((val - min) / range) * 100}%`, animationDelay: `${i * 60}ms` }} />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-text-secondary mt-2">
                  <span>{recent[0]?.recorded_at?.slice(5) || ''}</span>
                  <span>Сегодня</span>
                </div>
              </>
            );
          })()}
          <button onClick={() => onNavigate('progress')} className="btn-secondary w-full mt-4 text-sm py-2">Подробнее</button>
        </div>
      </div>

      {/* AI recommendations */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Vivi size={32} mood="thinking" animate={false} />
          <h3 className="font-bold text-text-primary">Рекомендации Виви на сегодня</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-2 sm:gap-3">
          {[
            { emoji: '🥬', title: 'Добавьте листовую зелень', text: 'Сегодня вам не хватает железа. Попробуйте шпинат или капусту за ужином.' },
            { emoji: '💧', title: 'Пейте больше воды', text: 'Осталось 2 стакана до цели. Ваша кожа скажет спасибо.' },
            { emoji: '🌰', title: 'Умный перекус', text: 'Горсть миндаля поможет сбалансировать упадок сил во второй половине дня.' },
          ].map((r, i) => (
            <div key={i} className="bg-cream rounded-xl p-3 sm:p-4">
              <div className="text-2xl mb-2">{r.emoji}</div>
              <p className="text-sm font-semibold text-text-primary">{r.title}</p>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
