import { useState } from 'react';
import { ArrowLeft, Plus, Star, Share2, AlertCircle, Check } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import { sampleFoods } from '@/data/content';

interface ProductProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Product({ currentPage, onNavigate }: ProductProps) {
  const food = sampleFoods[2]; // Grilled Salmon
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Food Details" subtitle={food.name} showBack backPage="search">
      <button onClick={() => onNavigate('search')} className="flex items-center gap-2 text-text-secondary hover:text-primary mb-4 text-sm lg:hidden">
        <ArrowLeft size={16} /> Back to search
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
                <span className="text-sm font-bold text-primary">Health score: {food.healthScore}</span>
              </div>
              {food.glycemicIndex !== undefined && (
                <div className="flex items-center gap-1.5 bg-info-50 px-3 py-1.5 rounded-full">
                  <span className="text-sm font-bold text-info-700">GI: {food.glycemicIndex}</span>
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
          <p className="text-xs text-text-secondary mt-1">Calories</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{food.protein * quantity}g</p>
          <p className="text-xs text-text-secondary mt-1">Protein</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-info">{food.carbs * quantity}g</p>
          <p className="text-xs text-text-secondary mt-1">Carbs</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-accent">{food.fat * quantity}g</p>
          <p className="text-xs text-text-secondary mt-1">Fat</p>
        </div>
      </div>

      {/* Quantity + add */}
      <div className="card mb-3 sm:mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Quantity</p>
            <p className="text-xs text-text-secondary">Adjust serving size</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center text-text-primary hover:bg-primary-50 transition-all text-lg font-bold">−</button>
            <span className="text-lg font-bold text-text-primary w-8 text-center">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center text-text-primary hover:bg-primary-50 transition-all text-lg font-bold">+</button>
          </div>
        </div>
        <button onClick={() => onNavigate('diary')} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
          <Plus size={18} /> Add to food diary
        </button>
      </div>

      {/* Vitamins & minerals */}
      {food.vitamins && (
        <div className="card mb-3 sm:mb-5">
          <h3 className="font-bold text-text-primary mb-3">Vitamins & minerals</h3>
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
            <h3 className="font-bold text-text-primary">Contains allergens</h3>
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
        <h3 className="font-bold text-text-primary mb-3">Recommended for</h3>
        <div className="space-y-2">
          {[
            { label: 'Diabetes-friendly', ok: food.glycemicIndex !== undefined && food.glycemicIndex < 55 },
            { label: 'High protein diet', ok: food.protein > 15 },
            { label: 'Low carb diet', ok: food.carbs < 10 },
            { label: 'Heart-healthy', ok: true },
            { label: 'Kidney-friendly', ok: food.protein < 35 },
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
          <p className="text-sm font-semibold text-text-primary mb-1">Vivi says</p>
          <p className="text-sm text-text-primary leading-relaxed">
            Salmon is an excellent source of omega-3 fatty acids — great for your heart and brain. Pair it with leafy greens for a perfect dinner. Since you're watching your protein intake, this fits beautifully into today's plan.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
