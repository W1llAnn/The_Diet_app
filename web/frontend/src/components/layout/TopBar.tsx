import { Bell, Search as SearchIcon, ArrowLeft } from 'lucide-react';
import type { Page } from '@/App';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onNavigate: (page: Page) => void;
  showSearch?: boolean;
  showBack?: boolean;
  backPage?: Page;
}

export default function TopBar({ title, subtitle, onNavigate, showSearch = false, showBack = false, backPage }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 bg-cream/85 backdrop-blur-md border-b border-border/50 safe-area-top">
      <div className="px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={() => onNavigate(backPage || 'dashboard')}
              className="flex-shrink-0 w-9 h-9 -ml-1 rounded-lg flex items-center justify-center text-text-secondary hover:bg-primary-50 hover:text-primary transition-all active:scale-90"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg lg:text-2xl font-bold text-text-primary truncate">{title}</h1>
            {subtitle && <p className="text-xs lg:text-sm text-text-secondary mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {showSearch && (
            <button
              onClick={() => onNavigate('search')}
              className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-text-secondary hover:bg-primary-50 hover:text-primary transition-all active:scale-90"
              aria-label="Search"
            >
              <SearchIcon size={18} />
            </button>
          )}
          <button
            onClick={() => onNavigate('notifications')}
            className="relative w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-text-secondary hover:bg-primary-50 hover:text-primary transition-all active:scale-90"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
