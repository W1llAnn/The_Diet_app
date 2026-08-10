import { useState } from 'react';
import { Search, ScanLine, Star, Clock } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import { sampleFoods, foodCategories } from '@/data/content';

interface SearchPageProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function SearchPage({ currentPage, onNavigate }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'favorites' | 'recent'>('all');

  const filtered = sampleFoods.filter((f) => {
    const matchesQuery = !query || f.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !activeCategory || f.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const display = tab === 'favorites' ? filtered.filter((f) => f.isFavorite) : tab === 'recent' ? filtered.slice(0, 6) : filtered;

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Food Search" subtitle="Find any food, fast" showSearch>
      {/* Search bar */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a food..."
            className="input-field pl-11"
            autoFocus
          />
        </div>
        <button className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-soft hover:bg-primary-600 transition-all active:scale-95">
          <ScanLine size={20} />
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3 sm:mb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeCategory ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:border-primary'}`}
        >
          All
        </button>
        {foodCategories.map((c) => (
          <button
            key={c.name}
            onClick={() => setActiveCategory(c.name)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${activeCategory === c.name ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:border-primary'}`}
          >
            <span>{c.emoji}</span> {c.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-3 sm:mb-4 shadow-soft">
        {[
          { id: 'all', label: 'All foods' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'recent', label: 'Recent' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'all' | 'favorites' | 'recent')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:text-primary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2 sm:space-y-2">
        {display.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-4xl mb-3">🔍</p>
            <p>No foods found. Try a different search.</p>
          </div>
        ) : (
          display.map((food) => (
            <button
              key={food.id}
              onClick={() => onNavigate('product')}
              className="card-hover w-full text-left flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{food.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary truncate">{food.name}</p>
                <p className="text-xs text-text-secondary">{food.serving} • {food.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-primary">{food.calories} kcal</span>
                  <span className="text-xs text-text-secondary">• P{food.protein}g C{food.carbs}g F{food.fat}g</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: food.healthScore >= 90 ? '#58B47A' : food.healthScore >= 75 ? '#FF8A65' : '#77B7F7' }} />
                  <span className="text-xs font-bold text-text-primary">{food.healthScore}</span>
                </div>
                {food.isFavorite && <Star size={14} className="text-accent fill-accent" />}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Recent tip */}
      <div className="flex items-center gap-2 text-xs text-text-secondary mt-5 sm:mt-6 justify-center">
        <Clock size={14} />
        <span>Tip: Use the barcode scanner to log packaged foods instantly</span>
      </div>
    </AppShell>
  );
}
