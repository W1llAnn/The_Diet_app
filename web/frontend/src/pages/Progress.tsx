import { useState } from 'react';
import { TrendingUp, Droplets, Flame, Award, Calendar } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface ProgressProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const weightHistory = [72.5, 72.2, 72, 71.6, 71.3, 71, 70.8, 70.5, 70.3, 70];
const caloriesHistory = [1850, 1920, 1780, 2010, 1880, 1950, 1820, 1900, 1870, 1940];
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Progress({ currentPage, onNavigate }: ProgressProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  const habits = [
    { name: 'Пить воду', emoji: '💧', streak: 7, goal: 8, done: 6 },
    { name: 'Завтракать', emoji: '🍳', streak: 5, goal: 7, done: 5 },
    { name: 'Записывать приёмы пищи', emoji: '📝', streak: 7, goal: 7, done: 7 },
    { name: 'Есть овощи', emoji: '🥬', streak: 4, goal: 5, done: 3 },
    { name: 'Не превышать калории', emoji: '✨', streak: 6, goal: 7, done: 6 },
  ];

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Прогресс" subtitle="Ваш путь, красиво визуализированный">
      {/* Period selector */}
      <div className="flex gap-1 bg-white rounded-xl p-1 w-fit shadow-soft mb-4 sm:mb-6">
        {(['week', 'month', 'year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${period === p ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:text-primary'}`}
          >
            {p === 'week' ? 'На этой неделе' : p === 'month' ? 'За месяц' : 'За год'}
          </button>
        ))}
      </div>

      {/* Weight chart */}
      <div className="card mb-3 sm:mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="font-bold text-text-primary">История веса</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">70.0 кг</p>
            <p className="text-xs text-primary">↓ 2.5 кг всего</p>
          </div>
        </div>
        <div className="relative h-48 flex items-end justify-between gap-2">
          {weightHistory.map((w, i) => {
            const pct = ((w - 69) / (73 - 69)) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-primary to-primary-300 rounded-t-lg bar-animate" style={{ height: `${pct}%`, animationDelay: `${i * 50}ms` }} />
                <span className="text-[10px] text-text-secondary">{weekDays[i % 7]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calories chart */}
      <div className="card mb-3 sm:mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-accent" />
            <h3 className="font-bold text-text-primary">История калорий</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-text-primary">1,888</p>
            <p className="text-xs text-text-secondary">в среднем / день</p>
          </div>
        </div>
        <div className="relative h-40 flex items-end justify-between gap-2">
          {caloriesHistory.map((c, i) => {
            const pct = (c / 2200) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-accent to-accent-200 rounded-t-lg bar-animate" style={{ height: `${pct}%`, animationDelay: `${i * 50}ms` }} />
                <span className="text-[10px] text-text-secondary">{weekDays[i % 7]}</span>
              </div>
            );
          })}
        </div>
        <div className="border-t-2 border-dashed border-accent-300 mt-2 pt-2 flex justify-between text-xs text-text-secondary">
          <span>Цель: 2,000 ккал</span>
          <span className="text-primary">На верном пути!</span>
        </div>
      </div>

      {/* Nutrition balance */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-3 sm:mb-5">
        {[
          { label: 'Белки', value: 82, goal: 120, color: '#58B47A', unit: 'г' },
          { label: 'Углеводы', value: 145, goal: 250, color: '#77B7F7', unit: 'г' },
          { label: 'Жиры', value: 48, goal: 65, color: '#FF8A65', unit: 'г' },
        ].map((m) => (
          <div key={m.label} className="card text-center">
            <p className="text-sm text-text-secondary mb-2">{m.label}</p>
            <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}{m.unit}</p>
            <p className="text-xs text-text-secondary mt-1">из {m.goal}{m.unit}</p>
            <div className="h-1.5 bg-border rounded-full overflow-hidden mt-2">
              <div className="h-full rounded-full" style={{ width: `${(m.value / m.goal) * 100}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Water stats */}
      <div className="card mb-3 sm:mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-info" />
            <h3 className="font-bold text-text-primary">Статистика воды</h3>
          </div>
          <p className="text-2xl font-bold text-info">6.4 <span className="text-sm text-text-secondary">стаканов в среднем</span></p>
        </div>
        <div className="flex items-end justify-between gap-2 h-24">
          {[5, 7, 6, 8, 6, 7, 6].map((g, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-info-200 rounded-t-lg bar-animate" style={{ height: `${(g / 8) * 100}%`, animationDelay: `${i * 50}ms` }} />
              <span className="text-[10px] text-text-secondary">{weekDays[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Habit tracking */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-primary" />
            <h3 className="font-bold text-text-primary">Отслеживание привычек</h3>
          </div>
          <button onClick={() => onNavigate('achievements')} className="text-sm text-primary font-medium hover:underline">Посмотреть достижения</button>
        </div>
        <div className="space-y-3">
          {habits.map((h) => (
            <div key={h.name} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center text-lg flex-shrink-0">{h.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{h.name}</p>
                <p className="text-xs text-text-secondary">{h.streak} дней подряд</p>
              </div>
              <div className="flex gap-1">
                {[...Array(h.goal)].map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-md ${i < h.done ? 'bg-primary' : 'bg-border'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vivi encouragement */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mt-4 sm:mt-5">
        <Vivi size={56} mood="proud" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            Ты молодец, Алекс! 7 дней последовательных записей — это настоящее достижение. Твой вес плавно снижается, а потребление белка улучшается. Так держать — я горжусь тобой! 💚
          </p>
        </div>
      </div>
    </AppShell>
  );
}
