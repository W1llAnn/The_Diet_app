import { LayoutDashboard, BookOpen, Bot, TrendingUp, User, type LucideIcon } from 'lucide-react';
import type { Page } from '@/App';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const tabs: { icon: LucideIcon; label: string; page: Page }[] = [
  { icon: LayoutDashboard, label: 'Home', page: 'dashboard' },
  { icon: BookOpen, label: 'Diary', page: 'diary' },
  { icon: Bot, label: 'AI', page: 'ai' },
  { icon: TrendingUp, label: 'Progress', page: 'progress' },
  { icon: User, label: 'Profile', page: 'profile' },
];

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border z-30 lg:hidden safe-area-px">
      <div className="flex items-center justify-around px-1 pt-1.5 pb-2 safe-area-pb">
        {tabs.map(({ icon: Icon, label, page }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`nav-item flex-1 max-w-[72px] ${active ? 'text-primary' : 'text-text-secondary'}`}
              aria-label={label}
            >
              {page === 'ai' ? (
                <>
                  <div className="w-11 h-11 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft -mt-5 border-[3px] border-white">
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-primary mt-0.5">AI</span>
                </>
              ) : (
                <>
                  <Icon size={22} className={active ? 'text-primary' : 'text-text-secondary'} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-text-secondary'}`}>{label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
