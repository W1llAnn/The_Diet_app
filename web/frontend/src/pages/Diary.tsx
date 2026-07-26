import { Plus, Droplets, Flame } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import { sampleFoods } from '@/data/content';

interface DiaryProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const mealSections = [
  { id: 'breakfast', label: 'Завтрак', emoji: '🌅', goal: 500 },
  { id: 'lunch', label: 'Обед', emoji: '☀️', goal: 650 },
  { id: 'dinner', label: 'Ужин', emoji: '🌙', goal: 600 },
  { id: 'snack', label: 'Перекус', emoji: '🍿', goal: 250 },
];

export default function Diary({ currentPage, onNavigate }: DiaryProps) {
  const logged: Record<string, { food: typeof sampleFoods[0]; quantity: number; time: string }[]> = {
    breakfast: [{ food: sampleFoods[7], quantity: 1, time: '8:30' }, { food: sampleFoods[5], quantity: 1, time: '8:35' }],
    lunch: [{ food: sampleFoods[3], quantity: 1, time: '12:45' }],
    dinner: [],
    snack: [{ food: sampleFoods[4], quantity: 1, time: '15:30' }],
  };

  const totalEaten = Object.values(logged).flat().reduce((s, e) => s + e.food.calories * e.quantity, 0);
  const totalGoal = 2000;
  const protein = Object.values(logged).flat().reduce((s, e) => s + e.food.protein * e.quantity, 0);
  const carbs = Object.values(logged).flat().reduce((s, e) => s + e.food.carbs * e.quantity, 0);
  const fat = Object.values(logged).flat().reduce((s, e) => s + e.food.fat * e.quantity, 0);

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Дневник питания" subtitle="Сегодня, 26 июля" showSearch>
      {/* Summary card */}
      <div className="card mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text-primary">Итоги за сегодня</h3>
          <Flame size={18} className="text-accent" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalEaten}</p>
            <p className="text-xs text-text-secondary">Съедено калорий</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-text-secondary">{totalGoal - totalEaten}</p>
            <p className="text-xs text-text-secondary">Осталось</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{Math.round(protein)}г</p>
            <p className="text-xs text-text-secondary">Белки</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-info">{Math.round(carbs)}г</p>
            <p className="text-xs text-text-secondary">Углеводы</p>
          </div>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-primary rounded-full transition-all duration-1000" style={{ width: `${(totalEaten / totalGoal) * 100}%` }} />
        </div>
      </div>

      {/* Meal sections */}
      <div className="space-y-3 sm:space-y-4">
        {mealSections.map((section) => {
          const entries = logged[section.id] || [];
          const sectionCals = entries.reduce((s, e) => s + e.food.calories * e.quantity, 0);
          return (
            <div key={section.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.emoji}</span>
                  <h3 className="font-bold text-text-primary">{section.label}</h3>
                </div>
                <span className="text-sm text-text-secondary">{sectionCals} / {section.goal} ккал</span>
              </div>

              {entries.length === 0 ? (
                <button
                  onClick={() => onNavigate('search')}
                  className="w-full p-4 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Добавить в {section.label.toLowerCase()}
                </button>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg shadow-soft">{entry.food.emoji}</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">{entry.food.name}</p>
                        <p className="text-xs text-text-secondary">{entry.food.serving} • {entry.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-text-primary">{entry.food.calories}</p>
                        <p className="text-xs text-text-secondary">ккал</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => onNavigate('search')}
                    className="w-full p-2 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Добавить ещё
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Water */}
      <div className="card mt-3 sm:mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets size={20} className="text-info" />
            <h3 className="font-bold text-text-primary">Вода</h3>
          </div>
          <span className="text-sm text-text-secondary">6 / 8 стаканов</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[...Array(8)].map((_, i) => (
            <button key={i} className={`w-10 h-12 rounded-lg border-2 flex items-end justify-center pb-1 transition-all ${i < 6 ? 'bg-info border-info' : 'bg-white border-border'}`}>
              <Droplets size={14} className={i < 6 ? 'text-white' : 'text-border'} />
            </button>
          ))}
        </div>
      </div>

      {/* Vivi tip */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mt-3 sm:mt-4">
        <Vivi size={48} mood="love" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            Отличный баланс сегодня! С белком всё отлично. На ужин кусочек жареного лосося отлично дополнит ваши омега-3. 🐟
          </p>
        </div>
      </div>
    </AppShell>
  );
}
