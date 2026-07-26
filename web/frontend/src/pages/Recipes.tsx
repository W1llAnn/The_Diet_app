import { useState } from 'react';
import { Clock, Flame, Star, Sparkles, Filter, Heart } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import { recipes } from '@/data/content';

interface RecipesProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const filters = ['All', 'AI Recipes', 'High Protein', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Low GI', 'Quick (< 20 min)'];

export default function Recipes({ currentPage, onNavigate }: RecipesProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const filtered = recipes.filter((r) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'AI Recipes') return r.ai;
    return r.tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()));
  });

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Recipes" subtitle="Healthy, delicious, made for you" showSearch>
      {/* AI banner */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <Vivi size={56} mood="excited" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed mb-3">
            Tell me what's in your fridge and I'll whip up a healthy recipe just for you!
          </p>
          <button className="btn-primary text-sm flex items-center gap-2 w-fit">
            <Sparkles size={16} /> Generate a custom recipe
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 sm:mb-5">
        <button className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-primary-50 transition-all">
          <Filter size={16} className="text-text-secondary" />
        </button>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === f ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:border-primary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {filtered.map((r) => (
          <div key={r.id} className="card-hover group">
            <div className="relative h-40 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
              <span className="text-6xl group-hover:scale-110 transition-transform">{r.emoji}</span>
              {r.ai && (
                <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                  <Sparkles size={10} /> AI
                </span>
              )}
              <button
                onClick={() => setFavorites({ ...favorites, [r.id]: !favorites[r.id] })}
                className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-all"
              >
                <Heart size={14} className={favorites[r.id] ? 'text-accent fill-accent' : 'text-text-secondary'} />
              </button>
            </div>
            <h3 className="font-bold text-text-primary">{r.name}</h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
              <span className="flex items-center gap-1"><Clock size={12} /> {r.time}</span>
              <span className="flex items-center gap-1"><Flame size={12} /> {r.calories} kcal</span>
              <span className="flex items-center gap-1">● {r.difficulty}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {r.tags.map((t) => (
                <span key={t} className="tag bg-primary-50 text-primary text-xs">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-accent fill-accent" />
                <span className="text-xs font-bold text-text-primary">{r.healthScore}</span>
              </div>
              <button className="ml-auto text-xs text-primary font-medium hover:underline">View recipe →</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
