import { ChevronRight, Award, Heart, Settings as SettingsIcon, HelpCircle, Bell, Crown, LogOut, Target, TrendingUp, type LucideIcon } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface ProfileProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Profile({ currentPage, onNavigate }: ProfileProps) {
  const menuItems: { icon: LucideIcon; label: string; page: Page; badge?: string }[] = [
    { icon: Target, label: 'Мои цели и профиль', page: 'settings' },
    { icon: TrendingUp, label: 'Прогресс и статистика', page: 'progress' },
    { icon: Award, label: 'Достижения', page: 'achievements' },
    { icon: Heart, label: 'Состояние здоровья', page: 'medical' },
    { icon: Crown, label: 'Премиум-подписка', page: 'premium', badge: 'Pro' },
    { icon: Bell, label: 'Уведомления', page: 'notifications' },
    { icon: SettingsIcon, label: 'Настройки', page: 'settings' },
    { icon: HelpCircle, label: 'Центр помощи', page: 'help' },
  ];

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Профиль" subtitle="Ваш аккаунт и предпочтения">
      {/* Profile header */}
      <div className="card mb-4 sm:mb-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-full flex items-center justify-center text-2xl sm:text-3xl text-white font-bold shadow-soft flex-shrink-0">A</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary truncate">Alex Johnson</h2>
            <p className="text-sm text-text-secondary truncate">alex@example.com</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
              <span className="tag bg-primary-50 text-primary text-xs">🌱 С нами с января 2026</span>
              <span className="tag bg-accent-50 text-accent-700 text-xs">🔥 Серия 7 дней</span>
            </div>
          </div>
          <button className="btn-secondary text-sm py-2 flex-shrink-0">Редактировать</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">70.0</p>
          <p className="text-xs text-text-secondary">Текущий вес (кг)</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-info">28</p>
          <p className="text-xs text-text-secondary">ИМТ</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-accent">2,000</p>
          <p className="text-xs text-text-secondary">Дневная цель по калориям</p>
        </div>
      </div>

      {/* Vivi message */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5">
        <Vivi size={48} mood="love" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            Мы идём этим путём вместе уже 6 месяцев, Алекс. Я так горжусь тобой! 💚
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="card p-2">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => onNavigate(item.page)}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-cream transition-all text-left"
          >
            <item.icon size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{item.label}</span>
            {item.badge && <span className="tag bg-accent-50 text-accent-700 text-xs">{item.badge}</span>}
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        ))}
        <div className="h-px bg-border my-1" />
        <button className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-red-50 transition-all text-left text-red-500">
          <LogOut size={18} />
          <span className="flex-1 text-sm font-medium">Выйти</span>
        </button>
      </div>

      <p className="text-center text-xs text-text-secondary mt-6 mb-2">Vivora v1.0.0 · Сделано с 💚</p>
    </AppShell>
  );
}
