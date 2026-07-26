import { Droplets, Plus, Flame, TrendingUp, Apple, Calendar, Bot, ChefHat } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import ProgressRing from '@/components/ProgressRing';
import Vivi from '@/components/Vivi';

interface DashboardProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const todayMeals = [
  { type: 'Завтрак', emoji: '🥣', name: 'Овсянка с ягодами', time: '8:30', calories: 320 },
  { type: 'Обед', emoji: '🥗', name: 'Чаша Будды с киноа', time: '12:45', calories: 480 },
  { type: 'Перекус', emoji: '🍎', name: 'Яблоко и миндаль', time: '15:30', calories: 180 },
];

const weightData = [72, 71.5, 71.2, 70.8, 70.5, 70.3, 70];

export default function Dashboard({ currentPage, onNavigate }: DashboardProps) {
  const caloriesEaten = 980;
  const caloriesGoal = 2000;
  const protein = 82, proteinGoal = 120;
  const carbs = 145, carbsGoal = 250;
  const fat = 48, fatGoal = 65;
  const water = 6, waterGoal = 8;

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Главная" subtitle="Сегодня, 26 июля" showSearch>
      {/* Vivi motivation */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <Vivi size={48} mood="happy" className="flex-shrink-0 sm:hidden" />
        <Vivi size={56} mood="happy" className="flex-shrink-0 hidden sm:block" />
        <div className="flex-1 pt-0.5 sm:pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            <span className="font-semibold">Доброе утро, Алекс!</span> Вы на 71% от цели по калориям — отличный темп. Попробуйте добавить горсть шпината к следующему приёму пищи для дополнительного железа. 🌿
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
            {todayMeals.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft">{m.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{m.name}</p>
                  <p className="text-xs text-text-secondary">{m.type} • {m.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary">{m.calories}</p>
                  <p className="text-xs text-text-secondary">ккал</p>
                </div>
              </div>
            ))}
            <button onClick={() => onNavigate('diary')} className="w-full p-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-all text-sm font-medium">
              + Добавить приём пищи
            </button>
          </div>
        </div>

        {/* Weight progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">Динамика веса</h3>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-text-primary">70.0 <span className="text-base text-text-secondary">кг</span></p>
            <p className="text-sm text-primary font-medium mt-1">↓ 2.0 кг за 7 дней</p>
          </div>
          {/* Mini chart */}
          <div className="flex items-end justify-between gap-1.5 h-24">
            {weightData.map((w, i) => (
              <div key={i} className="flex-1 bg-primary-200 rounded-t-md bar-animate" style={{ height: `${((w - 69) / (72.5 - 69)) * 100}%`, animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-text-secondary mt-2">
            <span>20 июля</span><span>Сегодня</span>
          </div>
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
