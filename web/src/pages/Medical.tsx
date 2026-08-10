import { useState } from 'react';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import { medicalConditions } from '@/data/content';

interface MedicalProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const conditionDetails: Record<string, { foods: string[]; avoid: string[]; tips: string[] }> = {
  diabetes: {
    foods: ['Leafy greens', 'Whole grains', 'Beans & lentils', 'Berries', 'Fatty fish', 'Nuts'],
    avoid: ['Sugary drinks', 'Refined carbs', 'Processed snacks', 'White bread'],
    tips: ['Choose low-GI foods (GI < 55)', 'Pair carbs with protein or fat', 'Eat smaller, frequent meals', 'Monitor portion sizes'],
  },
  obesity: {
    foods: ['Vegetables', 'Lean proteins', 'Whole grains', 'Fruits', 'Legumes', 'Water'],
    avoid: ['Sugary drinks', 'Fast food', 'Fried foods', 'Excessive snacking'],
    tips: ['Focus on portion control', 'Eat mindfully without screens', 'Plan meals ahead', 'Stay hydrated'],
  },
  hypertension: {
    foods: ['Leafy greens', 'Berries', 'Bananas', 'Oats', 'Beets', 'Salmon'],
    avoid: ['High-sodium foods', 'Processed meats', 'Canned soups', 'Excessive salt'],
    tips: ['Follow DASH diet principles', 'Limit sodium to 1500mg/day', 'Increase potassium intake', 'Reduce caffeine'],
  },
  kidney: {
    foods: ['Cauliflower', 'Blueberries', 'Egg whites', 'Garlic', 'Olive oil', 'Cabbage'],
    avoid: ['Dark colas', 'Avocados', 'Whole wheat bread', 'Bananas (high potassium)'],
    tips: ['Monitor protein intake', 'Limit phosphorus-rich foods', 'Watch potassium levels', 'Stay hydrated moderately'],
  },
  digestive: {
    foods: ['Oatmeal', 'Bananas', 'Ginger', 'Yogurt (probiotics)', 'Fennel', 'White rice'],
    avoid: ['Spicy foods', 'High-FODMAP foods', 'Excessive caffeine', 'Fried foods'],
    tips: ['Try low-FODMAP diet', 'Eat slowly and chew well', 'Identify trigger foods', 'Consider probiotics'],
  },
  allergies: {
    foods: ['Fresh whole foods', 'Alternative grains', 'Substitute proteins'],
    avoid: ['Specific allergens (personalized)', 'Cross-contaminated foods'],
    tips: ['Always read labels', 'Carry emergency contacts', 'Inform restaurants', 'Check for hidden allergens'],
  },
};

export default function Medical({ currentPage, onNavigate }: MedicalProps) {
  const [selected, setSelected] = useState('diabetes');
  const details = conditionDetails[selected];

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Medical Nutrition" subtitle="Personalized support for your condition">
      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-info-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <AlertCircle size={20} className="text-info-700 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-primary leading-relaxed">
          Vivora provides nutrition guidance, not medical advice. Always consult your doctor before making dietary changes for a medical condition.
        </p>
      </div>

      {/* Condition selector */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {medicalConditions.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${selected === c.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{c.emoji}</span>
              <p className="font-semibold text-text-primary">{c.name}</p>
            </div>
            <p className="text-xs text-text-secondary">{c.description}</p>
          </button>
        ))}
      </div>

      {/* Selected condition details */}
      <div className="grid lg:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-6">
        {/* Recommended foods */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
              <Check size={16} className="text-primary" />
            </div>
            <h3 className="font-bold text-text-primary">Recommended foods</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {details.foods.map((f) => (
              <span key={f} className="tag bg-primary-50 text-primary">{f}</span>
            ))}
          </div>
        </div>

        {/* Foods to avoid */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-accent-50 rounded-lg flex items-center justify-center">
              <AlertCircle size={16} className="text-accent-700" />
            </div>
            <h3 className="font-bold text-text-primary">Foods to limit</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {details.avoid.map((f) => (
              <span key={f} className="tag bg-accent-50 text-accent-700">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-4 sm:mb-6">
        <h3 className="font-bold text-text-primary mb-4">Helpful tips</h3>
        <div className="space-y-3">
          {details.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-sm text-text-primary">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vivi personalized recommendation */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-info-50 rounded-2xl p-3 sm:p-4 mb-4">
        <Vivi size={56} mood="thinking" />
        <div className="flex-1 pt-1">
          <p className="text-sm font-semibold text-text-primary mb-1">Vivi's personalized advice</p>
          <p className="text-sm text-text-primary leading-relaxed">
            Based on your {medicalConditions.find((c) => c.id === selected)?.name.toLowerCase()} profile, I've adjusted your meal recommendations. Your weekly plan now prioritizes {details.foods[0].toLowerCase()} and similar foods. Want me to show you recipes that fit?
          </p>
          <button onClick={() => onNavigate('recipes')} className="btn-primary text-sm mt-3 flex items-center gap-2 w-fit">
            Show me recipes <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
