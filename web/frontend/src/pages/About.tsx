import { Leaf, Heart, Target, Users, Shield, Sparkles } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface AboutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function About({ currentPage, onNavigate }: AboutProps) {
  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="О Vivora" subtitle="Наша история, наше сердце">
      {/* Hero */}
      <div className="text-center py-6 sm:py-8 mb-4 sm:mb-6">
        <div className="flex justify-center mb-4">
          <Vivi size={100} mood="love" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Мы верим, что еда должна приносить радость</h2>
        <p className="text-base sm:text-lg text-text-secondary mt-3 max-w-xl mx-auto leading-relaxed">
          Vivora появилась из простой идеи: помощь в питании должна быть теплой, индивидуальной и никогда не вызывать у людей чувство вины за то, что они едят.
        </p>
      </div>

      {/* Mission */}
      <div className="card mb-4 sm:mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Target size={20} className="text-primary" />
          <h3 className="font-bold text-text-primary">Наша миссия</h3>
        </div>
        <p className="text-text-primary leading-relaxed">
          Создать помощника по питанию, который поможет каждому человеку — независимо от возраста, пола или состояния здоровья — выстроить более здоровые и радостные отношения с едой. Мы не считаем калории. Мы — ваш спутник.
        </p>
      </div>

      {/* Values */}
      <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
        {[
          { icon: Heart, title: 'Сочувствие прежде всего', text: 'Никаких осуждений. Мы ценим прогресс, а не совершенство.' },
          { icon: Sparkles, title: 'Интеллект с теплом', text: 'ИИ, который ощущается по-человечески — полезный, мягкий и искренне заботливый.' },
          { icon: Shield, title: 'Конфиденциальность по умолчанию', text: 'Ваши данные о здоровье принадлежат вам. Они зашифрованы, никогда не продаются и всегда доступны для экспорта.' },
          { icon: Users, title: 'Для каждого', text: 'От подростков до пенсионеров, от спортсменов до новичков — Vivora подстраивается под вас.' },
        ].map((v, i) => (
          <div key={i} className="card">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
              <v.icon size={18} className="text-primary" />
            </div>
            <p className="font-semibold text-text-primary">{v.title}</p>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-gradient-primary rounded-3xl p-6 sm:p-8 text-white text-center mb-4 sm:mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: '50K+', label: 'Довольных пользователей' },
            { value: '1M+', label: 'Зафиксированных приемов пищи' },
            { value: '6', label: 'Поддерживаемых состояний' },
            { value: '4.9★', label: 'Рейтинг приложения' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm opacity-90 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="card mb-4 sm:mb-5">
        <h3 className="font-bold text-text-primary mb-3">История Виви</h3>
        <p className="text-text-primary leading-relaxed mb-3">
          Виви появилась как маленький росток — из простой идеи, что инструменты для питания могут быть добрыми. Большинство приложений казались холодными, сухими или наказывающими. Мы знали, что есть лучший путь.
        </p>
        <p className="text-text-primary leading-relaxed mb-3">
          Поэтому мы создали Vivora вокруг нежного помощника, который узнаёт вас и идёт рядом. Берёте ли вы под контроль диабет, пытаетесь сбросить вес или просто хотите питаться чуть лучше — Виви рядом с полезным советом и тёплым словом.
        </p>
        <p className="text-text-primary leading-relaxed">
          Сегодня Виви помогает десяткам тысяч людей чувствовать себя лучше — шаг за шагом, с маленькими радостями.
        </p>
      </div>

      {/* Team */}
      <div className="card mb-4 sm:mb-5 text-center">
        <div className="flex justify-center mb-3">
          <Vivi size={64} mood="waving" />
        </div>
        <h3 className="font-bold text-text-primary">Создано с заботой</h3>
        <p className="text-sm text-text-secondary mt-1">Маленькой командой нутрициологов, дизайнеров и инженеров, которым не всё равно.</p>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-bold text-text-primary">Vivora</span>
        </div>
        <p className="text-xs text-text-secondary">© 2026 Vivora. Сделано с 💚 для каждого.</p>
        <p className="text-xs text-text-secondary mt-1">Не является заменой профессиональной медицинской консультации.</p>
      </div>
    </AppShell>
  );
}
