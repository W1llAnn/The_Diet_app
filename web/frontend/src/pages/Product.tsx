import { useState } from 'react';
import { ArrowLeft, Plus, Star, Share2, AlertCircle, Check } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import { sampleFoods, type FoodItem } from '@/data/content';
import { useDiary } from '@/lib/hooks';

interface ProductProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

// Тип приёма пищи по умолчанию. В полной версии будет выбор при добавлении.
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function Product({ currentPage, onNavigate }: ProductProps) {
  // Продукт приходит из поиска через sessionStorage (мост без state-лифтинга).
  // Если там пусто — fallback на sampleFoods[2] (для прямого захода на страницу).
  const [food, setFood] = useState<FoodItem>(() => {
    try {
      const raw = sessionStorage.getItem('selectedFood');
      if (raw) return JSON.parse(raw) as FoodItem;
    } catch { /* ignore */ }
    return sampleFoods[2];
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [added, setAdded] = useState(false);
  const { add } = useDiary();

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Карточка продукта" subtitle={food.name} showBack backPage="search">
      <button onClick={() => onNavigate('search')} className="flex items-center gap-2 text-text-secondary hover:text-primary mb-4 text-sm lg:hidden">
        <ArrowLeft size={16} /> Назад к поиску
      </button>

      {/* Hero */}
      <div className="card mb-3 sm:mb-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cream rounded-2xl flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">{food.emoji}</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary">{food.name}</h2>
            <p className="text-sm text-text-secondary mt-1">{food.serving} • {food.category}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm font-bold text-primary">Индекс здоровья: {food.healthScore}</span>
              </div>
              {food.glycemicIndex !== undefined && (
                <div className="flex items-center gap-1.5 bg-info-50 px-3 py-1.5 rounded-full">
                  <span className="text-sm font-bold text-info-700">ГИ: {food.glycemicIndex}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsFavorite(!isFavorite)} className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center hover:bg-accent-50 transition-all">
              <Star size={18} className={isFavorite ? 'text-accent fill-accent' : 'text-text-secondary'} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center hover:bg-primary-50 transition-all">
              <Share2 size={18} className="text-text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Calories + macros */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-5">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{food.calories * quantity}</p>
          <p className="text-xs text-text-secondary mt-1">Калории</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{food.protein * quantity}g</p>
          <p className="text-xs text-text-secondary mt-1">Белки</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-info">{food.carbs * quantity}g</p>
          <p className="text-xs text-text-secondary mt-1">Углеводы</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-accent">{food.fat * quantity}g</p>
          <p className="text-xs text-text-secondary mt-1">Жиры</p>
        </div>
      </div>

      {/* Quantity + add */}
      <div className="card mb-3 sm:mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Порции</p>
            <p className="text-xs text-text-secondary">Настройте размер порции</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center text-text-primary hover:bg-primary-50 transition-all text-lg font-bold">−</button>
            <span className="text-lg font-bold text-text-primary w-8 text-center">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center text-text-primary hover:bg-primary-50 transition-all text-lg font-bold">+</button>
          </div>
        </div>

        {/* Выбор приёма пищи */}
        <div className="flex gap-2 mt-4">
          {([
            { id: 'breakfast', label: '🌅 Завтрак' },
            { id: 'lunch', label: '☀️ Обед' },
            { id: 'dinner', label: '🌙 Ужин' },
            { id: 'snack', label: '🍿 Перекус' },
          ] as { id: MealType; label: string }[]).map((m) => (
            <button
              key={m.id}
              onClick={() => setMealType(m.id)}
              className={`flex-1 px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                mealType === m.id ? 'bg-primary text-white' : 'bg-cream text-text-secondary hover:bg-primary-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          onClick={async () => {
            const result = await add({
              food_id: food.id,
              food_name: food.name,
              emoji: food.emoji,
              // макросы снимаются ПОРЦИИ (на одну порцию × количество)
              calories: food.calories * quantity,
              protein: food.protein * quantity,
              carbs: food.carbs * quantity,
              fat: food.fat * quantity,
              fiber: 0,
              quantity: quantity,
              quantity_unit: 'порц.',
              meal_type: mealType,
            });
            if (result) {
              setAdded(true);
              setTimeout(() => onNavigate('diary'), 600);
            }
          }}
          disabled={added}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {added ? (
            <><Check size={18} /> Добавлено!</>
          ) : (
            <><Plus size={18} /> Добавить в дневник</>
          )}
        </button>
      </div>

      {/* Vitamins & minerals */}
      {food.vitamins && (
        <div className="card mb-3 sm:mb-5">
          <h3 className="font-bold text-text-primary mb-3">Витамины и минералы</h3>
          <div className="flex flex-wrap gap-2">
            {food.vitamins.map((v) => (
              <span key={v} className="tag bg-primary-50 text-primary">{v}</span>
            ))}
          </div>
        </div>
      )}

      {/* Allergens */}
      {food.allergens && food.allergens.length > 0 && (
        <div className="card mb-3 sm:mb-5 border-accent-200 bg-accent-50/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-accent-700" />
            <h3 className="font-bold text-text-primary">Содержит аллергены</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {food.allergens.map((a) => (
              <span key={a} className="tag bg-accent-100 text-accent-700">{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Safe for */}
      <div className="card mb-3 sm:mb-5">
        <h3 className="font-bold text-text-primary mb-3">Рекомендовано для</h3>
        <div className="space-y-2">
          {[
            { label: 'Подходит для диабетиков', ok: food.glycemicIndex !== undefined && food.glycemicIndex < 55 },
            { label: 'Высокобелковая диета', ok: food.protein > 15 },
            { label: 'Низкоуглеводная диета', ok: food.carbs < 10 },
            { label: 'Полезно для сердца', ok: true },
            { label: 'Дружелюбно к почкам', ok: food.protein < 35 },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              {r.ok ? (
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>
              ) : (
                <div className="w-5 h-5 bg-border rounded-full flex items-center justify-center"><span className="text-xs text-text-secondary">✕</span></div>
              )}
              <span className={`text-sm ${r.ok ? 'text-text-primary' : 'text-text-secondary'}`}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vivi recommendation */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-info-50 rounded-2xl p-3 sm:p-4">
        <Vivi size={56} mood="thinking" />
        <div className="flex-1 pt-1">
          <p className="text-sm font-semibold text-text-primary mb-1">Виви подсказывает</p>
          <p className="text-sm text-text-primary leading-relaxed">
            Лосось — отличный источник жирных кислот омега-3, что прекрасно для сердца и мозга. Подавайте его с листовой зеленью — получится идеальный ужин. Поскольку вы следите за количеством белка, это блюдо отлично впишется в сегодняшний план.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
