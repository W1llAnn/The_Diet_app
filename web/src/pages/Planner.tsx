import { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Check } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface PlannerProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const plan: Record<string, Record<string, { emoji: string; name: string; cals: number }>> = {
  Mon: {
    Breakfast: { emoji: '🥣', name: 'Overnight oats & berries', cals: 320 },
    Lunch: { emoji: '🥗', name: 'Grilled chicken salad', cals: 480 },
    Dinner: { emoji: '🐟', name: 'Salmon & quinoa', cals: 540 },
    Snack: { emoji: '🍎', name: 'Apple & almonds', cals: 180 },
  },
  Tue: {
    Breakfast: { emoji: '🫐', name: 'Berry smoothie bowl', cals: 290 },
    Lunch: { emoji: '🥑', name: 'Avocado toast & egg', cals: 420 },
    Dinner: { emoji: '🍲', name: 'Lentil vegetable soup', cals: 380 },
    Snack: { emoji: '🥛', name: 'Greek yogurt', cals: 100 },
  },
  Wed: {
    Breakfast: { emoji: '🍳', name: 'Veggie omelette', cals: 310 },
    Lunch: { emoji: '🌯', name: 'Turkey & hummus wrap', cals: 450 },
    Dinner: { emoji: '🍗', name: 'Chicken & brown rice', cals: 560 },
    Snack: { emoji: '🥕', name: 'Carrot sticks & hummus', cals: 150 },
  },
  Thu: {
    Breakfast: { emoji: '🥣', name: 'Chia pudding', cals: 280 },
    Lunch: { emoji: '🥗', name: 'Quinoa Buddha bowl', cals: 460 },
    Dinner: { emoji: '🍝', name: 'Whole wheat pasta', cals: 520 },
    Snack: { emoji: '🍌', name: 'Banana & peanut butter', cals: 200 },
  },
  Fri: {
    Breakfast: { emoji: '🥞', name: 'Banana oat pancakes', cals: 340 },
    Lunch: { emoji: '🥙', name: 'Falafel & tabbouleh', cals: 440 },
    Dinner: { emoji: '🍤', name: 'Shrimp stir-fry', cals: 500 },
    Snack: { emoji: '🫐', name: 'Mixed berries', cals: 90 },
  },
  Sat: {
    Breakfast: { emoji: '🍳', name: 'Avocado eggs benedict', cals: 380 },
    Lunch: { emoji: '🥗', name: 'Mediterranean salad', cals: 420 },
    Dinner: { emoji: '🍗', name: 'Roast chicken & veg', cals: 580 },
    Snack: { emoji: '🍫', name: 'Dark chocolate (1 oz)', cals: 170 },
  },
  Sun: {},
};

const shoppingList = [
  { item: 'Salmon fillets', qty: '2', checked: false },
  { item: 'Quinoa', qty: '500g', checked: true },
  { item: 'Greek yogurt', qty: '4 cups', checked: false },
  { item: 'Avocados', qty: '3', checked: false },
  { item: 'Mixed berries', qty: '300g', checked: true },
  { item: 'Chicken breast', qty: '500g', checked: false },
  { item: 'Brown rice', qty: '1 kg', checked: false },
  { item: 'Spinach', qty: '2 bunches', checked: false },
  { item: 'Almonds', qty: '200g', checked: true },
  { item: 'Olive oil', qty: '1 bottle', checked: false },
];

export default function Planner({ currentPage, onNavigate }: PlannerProps) {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [listChecked, setListChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(shoppingList.map((s) => [s.item, s.checked]))
  );

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Meal Planner" subtitle="Your week, beautifully planned">
      {/* AI generate */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <Vivi size={56} mood="excited" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed mb-3">
            I've planned your week based on your goals and preferences. Want me to regenerate it or swap any meal?
          </p>
          <button className="btn-primary text-sm flex items-center gap-2 w-fit">
            <Sparkles size={16} /> Regenerate plan with AI
          </button>
        </div>
      </div>

      {/* Week selector */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-primary-50 transition-all">
          <ChevronLeft size={18} className="text-text-secondary" />
        </button>
        <span className="font-semibold text-text-primary">July 22 – 28, 2026</span>
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
                  {entry && <span className="text-sm text-text-secondary">{entry.cals} kcal</span>}
                </div>
                {entry ? (
                  <div className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft">{entry.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{entry.name}</p>
                    </div>
                    <button onClick={() => onNavigate('recipes')} className="text-xs text-primary font-medium hover:underline">Swap</button>
                  </div>
                ) : (
                  <button onClick={() => onNavigate('search')} className="w-full p-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-all text-sm font-medium">
                    + Add {meal.toLowerCase()}
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
            <h3 className="font-bold text-text-primary">Shopping list</h3>
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
          <button className="btn-secondary w-full mt-4 text-sm py-2">Share list</button>
        </div>
      </div>
    </AppShell>
  );
}
