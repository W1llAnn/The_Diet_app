import { useState } from 'react';
import { ChevronRight, Bell, Globe, Moon, Lock, User, Database as DataIcon, HelpCircle, Shield, LogOut, type LucideIcon } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import { supabase } from '@/lib/supabase';
import type { User as AuthUser } from '@supabase/supabase-js';

interface SettingsProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user?: AuthUser | null;
  isAdmin?: boolean;
}

export default function Settings({ currentPage, onNavigate, user, isAdmin }: SettingsProps) {
  const [notifications, setNotifications] = useState({ meal: true, water: true, achievements: true, weekly: false, ai: true });
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [darkMode, setDarkMode] = useState(false);
  const [privacy, setPrivacy] = useState({ analytics: false, shareData: false });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('landing');
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`w-11 h-6 rounded-full transition-all relative ${on ? 'bg-primary' : 'bg-border'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-soft transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Настройки" subtitle="Настройте Vivora под себя">
      {/* Текущий пользователь */}
      {user && (
        <div className="card p-4 mb-4 sm:mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user.email}</p>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium text-primary">
                <Shield size={12} /> Administrator
              </span>
            ) : (
              <p className="text-xs text-text-secondary">Обычный аккаунт</p>
            )}
          </div>
        </div>
      )}

      {/* Account */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Аккаунт</p>
        {[
          { icon: User, label: 'Личные данные', action: () => onNavigate('profile') },
          { icon: Lock, label: 'Сменить пароль', action: () => onNavigate('forgot') },
        ].map((item, i) => (
          <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-cream transition-all text-left">
            <item.icon size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{item.label}</span>
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        ))}
      </div>

      {/* Notifications */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Уведомления</p>
        {[
          { key: 'meal', label: 'Напоминания о еде' },
          { key: 'water', label: 'Напоминания о воде' },
          { key: 'achievements', label: 'Уведомления о достижениях' },
          { key: 'weekly', label: 'Недельный отчёт' },
          { key: 'ai', label: 'Советы и мотивация от Виви' },
        ].map((n) => (
          <div key={n.key} className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <Bell size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{n.label}</span>
            <Toggle on={notifications[n.key as keyof typeof notifications]} onClick={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key as keyof typeof notifications] })} />
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Предпочтения</p>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
          <Globe size={18} className="text-text-secondary" />
          <span className="flex-1 text-sm font-medium text-text-primary">Единицы</span>
          <div className="flex gap-1 bg-cream rounded-lg p-1">
            <button onClick={() => setUnits('metric')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${units === 'metric' ? 'bg-white text-primary shadow-soft' : 'text-text-secondary'}`}>Метрические</button>
            <button onClick={() => setUnits('imperial')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${units === 'imperial' ? 'bg-white text-primary shadow-soft' : 'text-text-secondary'}`}>Имперские</button>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
          <Moon size={18} className="text-text-secondary" />
          <span className="flex-1 text-sm font-medium text-text-primary">Тёмная тема</span>
          <Toggle on={darkMode} onClick={() => setDarkMode(!darkMode)} />
        </div>
      </div>

      {/* Privacy */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Конфиденциальность</p>
        {[
          { key: 'analytics', label: 'Делиться статистикой' },
          { key: 'shareData', label: 'Делиться данными с партнёрами' },
        ].map((p) => (
          <div key={p.key} className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <DataIcon size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{p.label}</span>
            <Toggle on={privacy[p.key as keyof typeof privacy]} onClick={() => setPrivacy({ ...privacy, [p.key]: !privacy[p.key as keyof typeof privacy] })} />
          </div>
        ))}
      </div>

      {/* Support */}
      <div className="card p-2 mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-2">Поддержка</p>
        {[
          { icon: HelpCircle, label: 'Центр помощи', action: () => onNavigate('help') },
        ].map((item, i) => (
          <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-cream transition-all text-left">
            <item.icon size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">{item.label}</span>
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        ))}
      </div>

      {user && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-cream hover:text-text-primary transition-all mb-4"
        >
          <LogOut size={16} /> Выйти
        </button>
      )}

      <p className="text-center text-xs text-text-secondary">Vivora v1.0.0</p>
    </AppShell>
  );
}
