import { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Check } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface PlannerProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const meals = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

const plan: Record<string, Record<string, { emoji: string; name: string; cals: number }>> = {
  Пн: {
    Завтрак: { emoji: '🥣', name: 'Ленивая овсянка с ягодами', cals: 320 },
    Обед: { emoji: '🥗', name: 'Салат с курицей гриль', cals: 480 },
    Ужин: { emoji: '🐟', name: 'Лосось и киноа', cals: 540 },
    Перекус: { emoji: '🍎', name: 'Яблоко и миндаль', cals: 180 },
  },
  Вт: {
    Завтрак: { emoji: '🫐', name: 'Боул с ягодным смузи', cals: 290 },
    Обед: { emoji: '🥑', name: 'Тост с авокадо и яйцом', cals: 420 },
    Ужин: { emoji: '🍲', name: 'Чечевичный овощной суп', cals: 380 },
    Перекус: { emoji: '🥛', name: 'Греческий йогурт', cals: 100 },
  },
  Ср: {
    Завтрак: { emoji: '🍳', name: 'Овощной омлет', cals: 310 },
    Обед: { emoji: '🌯', name: 'Ролл с индейкой и хумусом', cals: 450 },
    Ужин: { emoji: '🍗', name: 'Курица и бурый рис', cals: 560 },
    Перекус: { emoji: '🥕', name: 'Морковные палочки и хумус', cals: 150 },
  },
  Чт: {
    Завтрак: { emoji: '🥣', name: 'Чиа-пудинг', cals: 280 },
    Обед: { emoji: '🥗', name: 'Боул Будда с киноа', cals: 460 },
    Ужин: { emoji: '🍝', name: 'Цельнозерновые макароны', cals: 520 },
    Перекус: { emoji: '🍌', name: 'Банан и арахисовая паста', cals: 200 },
  },
  Пт: {
    Завтрак: { emoji: '🥞', name: 'Овсяно-банановые панкейки', cals: 340 },
    Обед: { emoji: '🥙', name: 'Фалафель и табуле', cals: 440 },
    Ужин: { emoji: '🍤', name: 'Стир-фрай с креветками', cals: 500 },
    Перекус: { emoji: '🫐', name: 'Ассорти из ягод', cals: 90 },
  },
  Сб: {
    Завтрак: { emoji: '🍳', name: 'Яйца бенедикт с авокадо', cals: 380 },
    Обед: { emoji: '🥗', name: 'Средиземноморский салат', cals: 420 },
    Ужин: { emoji: '🍗', name: 'Запечённая курица и овощи', cals: 580 },
    Перекус: { emoji: '🍫', name: 'Тёмный шоколад (28 г)', cals: 170 },
  },
  Вс: {},
};

const shoppingList = [
  { item: 'Филе лосося', qty: '2', checked: false },
  { item: 'Киноа', qty: '500 г', checked: true },
  { item: 'Греческий йогурт', qty: '4 чашки', checked: false },
  { item: 'Авокадо', qty: '3', checked: false },
  { item: 'Ассорти из ягод', qty: '300 г', checked: true },
  { item: 'Куриная грудка', qty: '500 г', checked: false },
  { item: 'Бурый рис', qty: '1 кг', checked: false },
  { item: 'Шпинат', qty: '2 пучка', checked: false },
  { item: 'Миндаль', qty: '200 г', checked: true },
  { item: 'Оливковое масло', qty: '1 бутылка', checked: false },
];

export default function Planner({ currentPage, onNavigate }: PlannerProps) {
  const [selectedDay, setSelectedDay] = useState('Пн');
  const [listChecked, setListChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(shoppingList.map((s) => [s.item, s.checked]))
  );

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Планировщик питания" subtitle="Ваша неделя, красиво спланированная">
      {/* AI generate */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <Vivi size={56} mood="excited" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed mb-3">
            Я спланировала вашу неделю с учётом целей и предпочтений. Хотите, чтобы я обновила план или заменила какое-то блюдо?
          </p>
          <button className="btn-primary text-sm flex items-center gap-2 w-fit">
            <Sparkles size={16} /> Обновить план с ИИ
          </button>
        </div>
      </div>

      {/* Week selector */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-primary-50 transition-all">
          <ChevronLeft size={18} className="text-text-secondary" />
        </button>
        <span className="font-semibold text-text-primary">22–28 июля 2026</span>
        <button className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-primary-50 transition-all">
          <ChevronRight size={18} className="text-text-secondary" />
        </button>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-3 sm:mb-4">
        {days.map((d) => {
          const active = d === selectedDay;
          const hasPlan = Object.keys(plan[d] || {}).length > 0;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl transition-all ${active ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:border-primary'}`}
            >
              <span className="text-xs font-medium">{d}</span>
              <span className={`w-1.5 h-1.5 rounded-full mt-1 ${hasPlan ? (active ? 'bg-white' : 'bg-primary') : 'bg-border'}`} />
            </button>
          );
        })}
      </div>

      {/* Day plan */}
      <div className="grid lg:grid-cols-3 gap-3 sm:gap-5">
        <div className="lg:col-span-2 space-y-3">
          {meals.map((meal) => {
            const entry = plan[selectedDay]?.[meal];
            return (
              <div key={meal} className="card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text-primary">{meal}</h3>
                  {entry && <span className="text-sm text-text-secondary">{entry.cals} ккал</span>}
                </div>
                {entry ? (
                  <div className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft">{entry.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{entry.name}</p>
                    </div>
                    <button onClick={() => onNavigate('recipes')} className="text-xs text-primary font-medium hover:underline">Заменить</button>
                  </div>
                ) : (
                  <button onClick={() => onNavigate('search')} className="w-full p-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-all text-sm font-medium">
                    + Добавить {meal.toLowerCase()}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Shopping list */}
        <div className="card h-fit">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={18} className="text-primary" />
            <h3 className="font-bold text-text-primary">Список покупок</h3>
          </div>
          <div className="space-y-1.5">
            {shoppingList.map((s) => (
              <button
                key={s.item}
                onClick={() => setListChecked({ ...listChecked, [s.item]: !listChecked[s.item] })}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-cream transition-all text-left"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${listChecked[s.item] ? 'bg-primary border-primary' : 'border-border'}`}>
                  {listChecked[s.item] && <Check size={12} className="text-white" />}
                </div>
                <span className={`flex-1 text-sm ${listChecked[s.item] ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{s.item}</span>
                <span className="text-xs text-text-secondary">{s.qty}</span>
              </button>
            ))}
          </div>
          <button className="btn-secondary w-full mt-4 text-sm py-2">Поделиться списком</button>
        </div>
      </div>
    </AppShell>
  );
}
