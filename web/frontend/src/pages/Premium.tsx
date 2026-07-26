import { useState } from 'react';
import { Check, Crown, Sparkles, ArrowLeft } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface PremiumProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const plans = [
  { id: 'monthly', name: 'Помесячно', price: 9.99, period: '/мес', save: null },
  { id: 'yearly', name: 'Годовой', price: 4.99, period: '/мес, оплата за год', save: 'Скидка 50%' },
  { id: 'lifetime', name: 'Навсегда', price: 199, period: 'разовый платёж', save: 'Лучшая цена' },
];

const features = [
  'Безлимитные ИИ-консультации по питанию от Виви',
  'Персональные планы питания на неделю',
  'Специализированная медицинская поддержка по питанию',
  'Расширенная аналитика прогресса и инсайты',
  'Генерация рецептов на заказ',
  'Синхронизация с Apple Health и Google Fit',
  'Приоритетная поддержка',
  'Работа без рекламы',
];

export default function Premium({ currentPage, onNavigate }: PremiumProps) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Vivora Premium" subtitle="Раскройте весь потенциал вашего пути к здоровому питанию">
      <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-primary mb-4 text-sm lg:hidden">
        <ArrowLeft size={16} /> Назад
      </button>

      {/* Hero */}
      <div className="bg-gradient-primary rounded-3xl p-6 sm:p-8 text-white text-center mb-4 sm:mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex justify-center mb-4">
            <Vivi size={80} mood="excited" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 mb-4">
            <Crown size={14} /> <span className="text-sm font-semibold">Vivora Premium</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Чувствуйте себя лучше быстрее</h2>
          <p className="text-base sm:text-lg opacity-90 mt-3 max-w-md mx-auto">Раскройте все возможности вашего помощника по питанию с персональными ИИ-рекомендациями.</p>
        </div>
      </div>

      {/* Features */}
      <div className="card mb-4 sm:mb-6">
        <h3 className="font-bold text-text-primary mb-4">Всё из Premium</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={12} className="text-white" />
              </div>
              <span className="text-sm text-text-primary">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            className={`p-5 rounded-2xl border-2 transition-all text-left relative ${selectedPlan === p.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'}`}
          >
            {p.save && (
              <span className="absolute -top-2 right-3 bg-accent text-white text-xs px-2 py-0.5 rounded-full font-medium">{p.save}</span>
            )}
            <p className="font-bold text-text-primary">{p.name}</p>
            <p className="text-2xl font-bold text-primary mt-2">${p.price}</p>
            <p className="text-xs text-text-secondary mt-1">{p.period}</p>
            {selectedPlan === p.id && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button className="btn-primary w-full text-base flex items-center justify-center gap-2 mb-3">
        <Sparkles size={18} /> Начать 7-дневный бесплатный пробный период
      </button>
      <p className="text-center text-xs text-text-secondary mb-6">Отмена в любой момент. В пробный период оплата не списывается.</p>

      {/* Vivi note */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4">
        <Vivi size={48} mood="happy" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            Premium — это то, как я могу дать вам самое лучшее: персональные планы, глубокие инсайты и поддержку круглосуточно. Но и в бесплатной версии достаточно заботы. 💚
          </p>
        </div>
      </div>
    </AppShell>
  );
}
