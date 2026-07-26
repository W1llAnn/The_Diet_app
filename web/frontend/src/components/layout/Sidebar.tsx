import { Leaf, LayoutDashboard, BookOpen, Search, CalendarDays, ChefHat, Bot, TrendingUp, Trophy, Heart, User, type LucideIcon } from 'lucide-react';
import type { Page } from '@/App';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { icon: LucideIcon; label: string; page: Page }[] = [
  { icon: LayoutDashboard, label: 'Панель', page: 'dashboard' },
  { icon: BookOpen, label: 'Дневник питания', page: 'diary' },
  { icon: Search, label: 'Поиск продуктов', page: 'search' },
  { icon: CalendarDays, label: 'Планировщик', page: 'planner' },
  { icon: ChefHat, label: 'Рецепты', page: 'recipes' },
  { icon: Bot, label: 'ИИ-помощник', page: 'ai' },
  { icon: TrendingUp, label: 'Прогресс', page: 'progress' },
  { icon: Trophy, label: 'Достижения', page: 'achievements' },
  { icon: Heart, label: 'Медицина', page: 'medical' },
  { icon: User, label: 'Профиль', page: 'profile' },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border flex flex-col z-30 hidden lg:flex">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">Vivora</span>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ icon: Icon, label, page }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={currentPage === page ? 'sidebar-item-active w-full text-left' : 'sidebar-item w-full text-left'}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
            {page === 'ai' && (
              <span className="ml-auto bg-accent text-white text-xs px-2 py-0.5 rounded-full">AI</span>
            )}
          </button>
        ))}
      </nav>

      {/* Settings & Premium */}
      <div className="p-4 border-t border-border space-y-1">
        <button
          onClick={() => onNavigate('premium')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 text-primary hover:from-primary-100 hover:to-accent-100 transition-all"
        >
          <span className="text-base">✦</span>
          <span className="text-sm font-semibold">Перейти на Premium</span>
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className="sidebar-item w-full text-left"
        >
          <span className="text-base">⚙</span>
          <span className="text-sm font-medium">Настройки</span>
        </button>
      </div>
    </aside>
  );
}
