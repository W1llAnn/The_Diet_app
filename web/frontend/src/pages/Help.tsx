import { useState } from 'react';
import { Search, ChevronRight, Mail, MessageCircle, BookOpen } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface HelpProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const helpCategories = [
  { icon: '🚀', title: 'С чего начать', articles: 12 },
  { icon: '🤖', title: 'ИИ-ассистент (Виви)', articles: 8 },
  { icon: '🥗', title: 'Учёт еды и дневник', articles: 15 },
  { icon: '📅', title: 'Планирование питания', articles: 10 },
  { icon: '🩺', title: 'Медицинские состояния', articles: 14 },
  { icon: '👤', title: 'Аккаунт и профиль', articles: 9 },
  { icon: '💳', title: 'Оплата и Premium', articles: 7 },
  { icon: '🔒', title: 'Конфиденциальность и безопасность', articles: 6 },
];

const popularArticles = [
  'Как настроить дневную цель по калориям?',
  'Можно ли синхронизировать Vivora с Apple Health?',
  'Как Виви персонализирует мои рекомендации?',
  'Какие медицинские состояния поддерживает Vivora?',
  'Как отменить подписку Premium?',
  'Конфиденциальны и безопасны ли мои данные о здоровье?',
];

export default function Help({ currentPage, onNavigate }: HelpProps) {
  const [query, setQuery] = useState('');

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Центр помощи" subtitle="Чем мы можем помочь?">
      {/* Search */}
      <div className="relative mb-4 sm:mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по справке..."
          className="input-field pl-11"
        />
      </div>

      {/* Vivi help */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <Vivi size={56} mood="happy" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            Не нашли то, что искали? Спросите меня напрямую — я отвечу на большинство вопросов о питании и использовании Vivora!
          </p>
          <button onClick={() => onNavigate('ai')} className="btn-primary text-sm mt-3 flex items-center gap-2 w-fit">
            Спросить Виви <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <h3 className="font-bold text-text-primary mb-3">Просмотр по темам</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {helpCategories.map((c, i) => (
          <button key={i} className="card-hover text-left">
            <div className="text-3xl mb-2">{c.icon}</div>
            <p className="font-semibold text-text-primary text-sm">{c.title}</p>
            <p className="text-xs text-text-secondary mt-1">{c.articles} статей</p>
          </button>
        ))}
      </div>

      {/* Popular articles */}
      <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><BookOpen size={18} className="text-primary" /> Популярные статьи</h3>
      <div className="card p-2 mb-4 sm:mb-6">
        {popularArticles.map((a, i) => (
          <button key={i} className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cream transition-all text-left">
            <span className="text-sm font-medium text-text-primary">{a}</span>
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        ))}
      </div>

      {/* Contact */}
      <h3 className="font-bold text-text-primary mb-3">Всё ещё нужна помощь?</h3>
      <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
        <a href="mailto:support@vivora.app" className="card-hover flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center"><Mail size={18} className="text-primary" /></div>
          <div>
            <p className="font-semibold text-text-primary text-sm">Поддержка по email</p>
            <p className="text-xs text-text-secondary">support@vivora.app</p>
          </div>
        </a>
        <button onClick={() => onNavigate('ai')} className="card-hover flex items-center gap-3 text-left">
          <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center"><MessageCircle size={18} className="text-accent-700" /></div>
          <div>
            <p className="font-semibold text-text-primary text-sm">Чат с Виви</p>
            <p className="text-xs text-text-secondary">Доступно 24/7</p>
          </div>
        </button>
      </div>
    </AppShell>
  );
}
