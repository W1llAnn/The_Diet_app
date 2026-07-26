import { useState } from 'react';
import { Leaf, Menu, X, ArrowRight, Check, Star } from 'lucide-react';
import type { Page } from '@/App';
import Vivi from '@/components/Vivi';
import { landingFeatures, testimonials, faqs } from '@/data/content';

interface LandingProps {
  onNavigate: (page: Page) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">Vivora</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Возможности</a>
            <a href="#ai" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">ИИ-помощник</a>
            <a href="#medical" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Медицина</a>
            <a href="#testimonials" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Истории</a>
            <a href="#faq" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Частые вопросы</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => onNavigate('login')} className="btn-ghost text-sm">Войти</button>
            <button onClick={() => onNavigate('register')} className="btn-primary text-sm">Начать</button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-border">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-2">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block py-2 text-text-secondary">Возможности</a>
            <a href="#ai" onClick={() => setMenuOpen(false)} className="block py-2 text-text-secondary">ИИ-помощник</a>
            <a href="#medical" onClick={() => setMenuOpen(false)} className="block py-2 text-text-secondary">Медицина</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)} className="block py-2 text-text-secondary">Истории</a>
            <a href="#faq" onClick={() => setMenuOpen(false)} className="block py-2 text-text-secondary">Частые вопросы</a>
            <div className="flex gap-2 pt-2">
              <button onClick={() => onNavigate('login')} className="btn-secondary flex-1 text-sm">Войти</button>
              <button onClick={() => onNavigate('register')} className="btn-primary flex-1 text-sm">Начать</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 px-4 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-60" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-accent-100 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-3 sm:px-4 py-1.5 mb-4 sm:mb-6 shadow-soft">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-text-secondary">Ваш мягкий спутник в питании</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight">
              Питайся лучше,
              <br />
              <span className="text-gradient">чувствуй себя бодрее.</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-text-secondary leading-relaxed max-w-md">
              Vivora — ваш спутник в питании на базе ИИ. Отслеживайте мягко, планируйте грамотно и получайте персональные советы — для любого тела, любой цели и любого состояния здоровья.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => onNavigate('register')} className="btn-primary text-base flex items-center justify-center gap-2 group">
                Начать путь
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => onNavigate('dashboard')} className="btn-secondary text-base flex items-center justify-center gap-2">
                Изучить приложение
              </button>
            </div>
            <div className="mt-6 sm:mt-8 flex items-center gap-4 sm:gap-6">
              <div className="flex -space-x-2">
                {['👩', '👨', '👩‍🎓', '👴', '🏃'].map((emoji, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-white border-2 border-white shadow-soft flex items-center justify-center text-base">{emoji}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-accent fill-accent" />)}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">Любим 50 000+ пользователей</p>
              </div>
            </div>
          </div>

          {/* Hero illustration / app preview */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative mx-auto max-w-[280px] sm:max-w-sm">
              {/* Phone mockup */}
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-float p-2.5 sm:p-3 border border-border">
                <div className="bg-cream rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 h-[440px] sm:h-[520px] overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-text-secondary">Доброе утро</p>
                      <p className="text-lg font-bold text-text-primary">Привет, Алекс!</p>
                    </div>
                    <Vivi size={48} mood="waving" />
                  </div>

                  <div className="bg-gradient-primary rounded-2xl p-5 text-white">
                    <p className="text-sm opacity-90">Калории за сегодня</p>
                    <p className="text-3xl font-bold mt-1">1,420<span className="text-base opacity-75 ml-1">/ 2,000</span></p>
                    <div className="h-2 bg-white/30 rounded-full mt-3">
                      <div className="h-2 bg-white rounded-full" style={{ width: '71%' }} />
                    </div>
                    <p className="text-xs opacity-90 mt-2">Осталось 580 ккал — отличный темп!</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-white rounded-xl p-3 text-center shadow-soft">
                      <p className="text-xs text-text-secondary">Белки</p>
                      <p className="text-base font-bold text-primary">82 г</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center shadow-soft">
                      <p className="text-xs text-text-secondary">Углеводы</p>
                      <p className="text-base font-bold text-info">145 г</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center shadow-soft">
                      <p className="text-xs text-text-secondary">Жиры</p>
                      <p className="text-base font-bold text-accent">48 г</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 mt-4 shadow-soft">
                    <div className="flex items-center gap-2">
                      <Vivi size={32} mood="happy" animate={false} />
                      <p className="text-xs text-text-primary leading-snug">«Отличное начало! Добавь горсть шпината к обеду — это даст дополнительное железо.»</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -left-2 sm:-left-6 top-28 sm:top-32 bg-white rounded-2xl shadow-float p-2.5 sm:p-3 flex items-center gap-2 vivi-float">
                <span className="text-xl">💧</span>
                <div>
                  <p className="text-xs font-bold text-text-primary">6 / 8 стаканов</p>
                  <p className="text-[10px] text-text-secondary">Пейте больше воды</p>
                </div>
              </div>
              <div className="absolute -right-1 sm:-right-4 bottom-20 sm:bottom-24 bg-white rounded-2xl shadow-float p-2.5 sm:p-3 flex items-center gap-2 vivi-float" style={{ animationDelay: '1s' }}>
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-xs font-bold text-text-primary">7 дней подряд!</p>
                  <p className="text-[10px] text-text-secondary">Так держать</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="px-4 lg:px-8 py-8 border-y border-border/50 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-text-secondary">
          <span className="text-sm font-medium">Наши публикации</span>
          <span className="text-lg font-bold opacity-50">TechCrunch</span>
          <span className="text-lg font-bold opacity-50">Forbes</span>
          <span className="text-lg font-bold opacity-50">Wired</span>
          <span className="text-lg font-bold opacity-50">The Verge</span>
          <span className="text-lg font-bold opacity-50">Healthline</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 lg:px-8 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">Всё в одном месте</span>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-text-primary mt-3 tracking-tight">Спутник на каждом шагу</h2>
            <p className="text-base sm:text-lg text-text-secondary mt-4">Vivora объединяет отслеживание, планирование и ИИ-рекомендации — без чувства вины.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {landingFeatures.map((f, i) => (
              <div key={i} className="card-hover group">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary">{f.title}</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant section */}
      <section id="ai" className="px-4 lg:px-8 py-12 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Познакомьтесь с Виви</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mt-3 tracking-tight">Ваш ИИ-нутрициолог в любое время</h2>
            <p className="text-lg text-text-secondary mt-4 leading-relaxed">
              Спросите Виви о чём угодно — «Этот перекус подходит при моём диабете?» или «Что съесть на ужин?» Получайте понятные и заботливые ответы за секунды.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Персональные предложения блюд под ваши цели',
                'Сравнение продуктов рядом друг с другом с ИИ-анализом',
                'Мягкие советы без осуждения для любого состояния',
                'Мотивационная поддержка, которая ощущается по-настоящему',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="text-text-primary">{item}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => onNavigate('ai')} className="btn-primary mt-8 flex items-center gap-2 group">
              Пообщаться с Виви
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative">
            <div className="bg-cream rounded-3xl p-6 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <Vivi size={44} mood="happy" />
                <div>
                  <p className="font-bold text-text-primary">Виви</p>
                  <p className="text-xs text-text-secondary">Ваш друг по питанию</p>
                </div>
                <span className="ml-auto w-2 h-2 bg-primary rounded-full" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">Можно ли мне есть бананы при диабете?</p>
                  </div>
                </div>
                <div className="flex justify-start gap-2">
                  <Vivi size={28} mood="thinking" animate={false} />
                  <div className="bg-white border border-border rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%] shadow-soft">
                    <p className="text-sm text-text-primary">Да, в умеренных количествах! У бананов средний гликемический индекс (51). Если сочетать их с горстью миндаля, это замедлит всасывание сахара. Один небольшой банан — отличный выбор. 🍌</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">Спасибо! Есть ли фрукты с низким ГИ на замену?</p>
                  </div>
                </div>
                <div className="flex justify-start gap-2">
                  <Vivi size={28} mood="happy" animate={false} />
                  <div className="bg-white border border-border rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%] shadow-soft">
                    <p className="text-sm text-text-primary">Конечно! Ягоды 🫐 (ГИ ~53), черешня 🍒 (ГИ ~22) и яблоки 🍎 (ГИ ~38) — отличный выбор. К тому же они богаты клетчаткой и антиоксидантами.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical nutrition */}
      <section id="medical" className="px-4 lg:px-8 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Подходит каждому</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mt-3 tracking-tight">Питание, которое подстраивается под вас</h2>
            <p className="text-lg text-text-secondary mt-4">Управляете ли вы заболеванием или просто хотите чувствовать себя лучше — Vivora подстраивается под ваши потребности.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { emoji: '🩸', title: 'Диабет', text: 'Продукты с низким ГИ, планы питания, дружественные уровню сахара в крови, и поддержка подсчёта углеводов.' },
              { emoji: '⚖️', title: 'Ожирение', text: 'Устойчивые калорийные планы, ориентиры по порциям и мягкое формирование привычек — без стыда.' },
              { emoji: '❤️', title: 'Гипертония', text: 'Рекомендации с низким содержанием натрия, планы питания в стиле DASH и продукты, богатые калием.' },
              { emoji: '🫘', title: 'Заболевания почек', text: 'Учёт белков, фосфора и калия с учётом потребностей почек.' },
              { emoji: '🌿', title: 'Расстройства пищеварения', text: 'Варианты, дружественные FODMAP, рецепты для здоровья кишечника и избегание триггеров.' },
              { emoji: '🚫', title: 'Пищевая аллергия', text: 'Автоматическое определение аллергенов и предложения безопасных альтернатив.' },
            ].map((c, i) => (
              <div key={i} className="card-hover">
                <div className="text-3xl mb-3">{c.emoji}</div>
                <h3 className="text-lg font-bold text-text-primary">{c.title}</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meal planning + Calorie tracking showcase */}
      <section className="px-4 lg:px-8 py-12 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-cream rounded-3xl p-6 shadow-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">План на эту неделю</h3>
                <span className="text-xs bg-primary text-white px-3 py-1 rounded-full">Создано ИИ</span>
              </div>
              <div className="space-y-2">
                {[
                  { day: 'Пн', meals: ['Овсянка на ночь', 'Салат с курицей гриль', 'Лосось и киноа'], cals: 1850 },
                  { day: 'Вт', meals: ['Ягодный смузи', 'Тост с авокадо', 'Овощная жаренка'], cals: 1920 },
                  { day: 'Ср', meals: ['Греческий йогурт', 'Ролл с индейкой', 'Чечевичный суп'], cals: 1780 },
                  { day: 'Чт', meals: ['Чиа-пудинг', 'Боул с киноа', 'Курица и рис'], cals: 2010 },
                ].map((d, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-soft">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-sm font-bold text-primary">{d.day}</div>
                    <div className="flex-1">
                      <p className="text-xs text-text-secondary">{d.meals.join(' • ')}</p>
                      <p className="text-xs font-semibold text-text-primary mt-0.5">{d.cals} ккал</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Простое планирование</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mt-3 tracking-tight">Приёмы пищи спланированы, покупки сделаны</h2>
            <p className="text-lg text-text-secondary mt-4 leading-relaxed">
              Получите питание на целую неделю под ваши цели и вкусы — со списком покупок, готовым к использованию. Больше никаких «что приготовить?» в 7 вечера.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'ИИ-планы на неделю за секунды',
                'Автоматический список покупок, который можно отмечать',
                'Меняйте любое блюдо одним касанием — Виви пересчитает',
                'Планы подстраиваются под аллергии, состояния и предпочтения',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="text-text-primary">{item}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => onNavigate('planner')} className="btn-primary mt-8 flex items-center gap-2 group">
              Попробовать планировщик
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 lg:px-8 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Реальные истории</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mt-3 tracking-tight">Любим самыми разными людьми</h2>
            <p className="text-lg text-text-secondary mt-4">От студентов до пенсионеров, от спортсменов до новичков — Vivora вписывается в вашу жизнь.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="text-accent fill-accent" />)}
                </div>
                <p className="text-text-primary leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-lg">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-secondary">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 lg:px-8 py-12 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Вопросы</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mt-3 tracking-tight">Частые вопросы</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-cream rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-text-primary">{faq.q}</span>
                  <span className={`text-2xl text-primary transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 lg:px-8 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto bg-gradient-primary rounded-3xl p-8 sm:p-10 lg:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex justify-center mb-6">
              <Vivi size={80} mood="excited" />
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">Готовы почувствовать себя бодрее?</h2>
            <p className="text-lg opacity-90 mt-4 max-w-md mx-auto">Присоединяйтесь к 50 000+ людей, которые выстраивают здоровые привычки с заботливым спутником.</p>
            <button onClick={() => onNavigate('register')} className="bg-white text-primary font-semibold px-8 py-3.5 rounded-xl mt-8 hover:scale-105 active:scale-95 transition-all shadow-float inline-flex items-center gap-2">
              Начать бесплатно
              <ArrowRight size={18} />
            </button>
            <p className="text-sm opacity-75 mt-4">Кредитная карта не требуется</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 lg:px-8 py-12 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Leaf size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold text-text-primary">Vivora</span>
              </div>
              <p className="text-sm text-text-secondary max-w-xs leading-relaxed">Ваш мягкий спутник в питании. Питайся лучше, чувствуй себя бодрее — для каждого.</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => onNavigate('about')} className="text-text-secondary hover:text-primary transition-colors text-sm">О нас</button>
                <button onClick={() => onNavigate('help')} className="text-text-secondary hover:text-primary transition-colors text-sm">Помощь</button>
                <button onClick={() => onNavigate('premium')} className="text-text-secondary hover:text-primary transition-colors text-sm">Premium</button>
              </div>
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-3 text-sm">Продукт</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#features" className="hover:text-primary transition-colors">Возможности</a></li>
                <li><a href="#ai" className="hover:text-primary transition-colors">ИИ-помощник</a></li>
                <li><button onClick={() => onNavigate('recipes')} className="hover:text-primary transition-colors">Рецепты</button></li>
                <li><button onClick={() => onNavigate('planner')} className="hover:text-primary transition-colors">Планировщик питания</button></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-3 text-sm">Компания</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><button onClick={() => onNavigate('about')} className="hover:text-primary transition-colors">О нас</button></li>
                <li><button onClick={() => onNavigate('community')} className="hover:text-primary transition-colors">Сообщество</button></li>
                <li><a href="#testimonials" className="hover:text-primary transition-colors">Истории</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-3 text-sm">Поддержка</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><button onClick={() => onNavigate('help')} className="hover:text-primary transition-colors">Центр помощи</button></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">Частые вопросы</a></li>
                <li><button onClick={() => onNavigate('settings')} className="hover:text-primary transition-colors">Настройки</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-secondary">© 2026 Vivora. Сделано с заботой.</p>
            <p className="text-xs text-text-secondary">Не заменяет консультацию врача-специалиста.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
