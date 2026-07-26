import { Plus, Droplets, Flame, Trash2 } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import { useDiary, useWater, useTargets } from '@/lib/hooks';

interface DiaryProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const mealSections = [
  { id: 'breakfast' as const, label: 'Завтрак', emoji: '🌅', goal: 500 },
  { id: 'lunch' as const, label: 'Обед', emoji: '☀️', goal: 650 },
  { id: 'dinner' as const, label: 'Ужин', emoji: '🌙', goal: 600 },
  { id: 'snack' as const, label: 'Перекус', emoji: '🍿', goal: 250 },
];

const WATER_GOAL = 8;

export default function Diary({ currentPage, onNavigate }: DiaryProps) {
  const { entries, loading, remove } = useDiary();
  const { glasses, addGlass } = useWater();
  const { targets } = useTargets();

  const totalEaten = entries.reduce((s, e) => s + Number(e.calories), 0);
  const totalGoal = Math.round(targets.target_kcal);
  const protein = entries.reduce((s, e) => s + Number(e.protein), 0);
  const proteinGoal = Math.round(targets.protein_g);
  const carbs = entries.reduce((s, e) => s + Number(e.carbs), 0);
  const carbsGoal = Math.round(targets.carbs_g);
  const fat = entries.reduce((s, e) => s + Number(e.fat), 0);
  const fatGoal = Math.round(targets.fat_g);
  const fiber = entries.reduce((s, e) => s + Number(e.fiber ?? 0), 0);
  const fiberGoal = Math.round(targets.fiber_g);

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Дневник питания" subtitle="Сегодня" showSearch>
      {/* Summary card */}
      <div className="card mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text-primary">Итоги за сегодня</h3>
          <Flame size={18} className="text-accent" />
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{Math.round(totalEaten)}</p>
            <p className="text-xs text-text-secondary">Калории</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-text-secondary">{Math.max(0, Math.round(totalGoal - totalEaten))}</p>
            <p className="text-xs text-text-secondary">Осталось</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{Math.round(protein)}<span className="text-xs text-text-secondary">/{proteinGoal}г</span></p>
            <p className="text-xs text-text-secondary">Белки</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-accent">{Math.round(fat)}<span className="text-xs text-text-secondary">/{fatGoal}г</span></p>
            <p className="text-xs text-text-secondary">Жиры</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-info">{Math.round(carbs)}<span className="text-xs text-text-secondary">/{carbsGoal}г</span></p>
            <p className="text-xs text-text-secondary">Углеводы</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#A78BFA' }}>{Math.round(fiber)}<span className="text-xs text-text-secondary">/{fiberGoal}г</span></p>
            <p className="text-xs text-text-secondary">Клетчатка</p>
          </div>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (totalEaten / totalGoal) * 100)}%` }} />
        </div>
      </div>

      {/* Meal sections */}
      <div className="space-y-3 sm:space-y-4">
        {mealSections.map((section) => {
          const list = entries.filter((e) => e.meal_type === section.id);
          const sectionCals = list.reduce((s, e) => s + Number(e.calories), 0);
          return (
            <div key={section.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.emoji}</span>
                  <h3 className="font-bold text-text-primary">{section.label}</h3>
                </div>
                <span className="text-sm text-text-secondary">{Math.round(sectionCals)} / {section.goal} ккал</span>
              </div>

              {loading ? (
                <p className="text-sm text-text-secondary py-3">Загрузка…</p>
              ) : list.length === 0 ? (
                <button
                  onClick={() => onNavigate('search')}
                  className="w-full p-4 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Добавить в {section.label.toLowerCase()}
                </button>
              ) : (
                <div className="space-y-2">
                  {list.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl group">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg shadow-soft">{entry.emoji || '🍽️'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{entry.food_name}</p>
                        <p className="text-xs text-text-secondary">
                          {Number(entry.quantity)}{entry.quantity_unit} • {entry.protein}Б / {entry.carbs}У / {entry.fat}Ж
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-text-primary">{Math.round(Number(entry.calories))}</p>
                        <p className="text-xs text-text-secondary">ккал</p>
                      </div>
                      <button
                        onClick={() => remove(entry.id)}
                        className="text-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Удалить запись"
                      >
                        <Trash2 size={16} />
                      </button>
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
          <span className="text-sm text-text-secondary">{glasses} / {WATER_GOAL} стаканов</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[...Array(WATER_GOAL)].map((_, i) => (
            <button
              key={i}
              onClick={addGlass}
              className={`w-10 h-12 rounded-lg border-2 flex items-end justify-center pb-1 transition-all ${i < glasses ? 'bg-info border-info' : 'bg-white border-border hover:border-info'}`}
            >
              <Droplets size={14} className={i < glasses ? 'text-white' : 'text-border'} />
            </button>
          ))}
        </div>
        <p className="text-xs text-text-secondary mt-2">Нажмите на стакан, чтобы добавить</p>
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
