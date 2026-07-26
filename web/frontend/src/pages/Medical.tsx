import { useState } from 'react';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import { medicalConditions } from '@/data/content';

interface MedicalProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const conditionDetails: Record<string, { foods: string[]; avoid: string[]; tips: string[] }> = {
  diabetes: {
    foods: ['Листовая зелень', 'Цельнозерновые', 'Бобовые и чечевица', 'Ягоды', 'Жирная рыба', 'Орехи'],
    avoid: ['Сладкие напитки', 'Рафинированные углеводы', 'Промышленные снеки', 'Белый хлеб'],
    tips: ['Выбирайте продукты с низким ГИ (ГИ < 55)', 'Сочетайте углеводы с белком или жирами', 'Ешьте чаще, но меньшими порциями', 'Контролируйте размер порций'],
  },
  obesity: {
    foods: ['Овощи', 'Нежирные белки', 'Цельнозерновые', 'Фрукты', 'Бобовые', 'Вода'],
    avoid: ['Сладкие напитки', 'Фастфуд', 'Жареное', 'Частые перекусы'],
    tips: ['Контролируйте порции', 'Ешьте осознанно, без экранов', 'Планируйте питание заранее', 'Пейте достаточно воды'],
  },
  hypertension: {
    foods: ['Листовая зелень', 'Ягоды', 'Бананы', 'Овсянка', 'Свёкла', 'Лосось'],
    avoid: ['Продукты с высоким содержанием натрия', 'Колбасные изделия', 'Консервированные супы', 'Избыток соли'],
    tips: ['Придерживайтесь принципов диеты DASH', 'Ограничьте натрий до 1500 мг/день', 'Увеличьте потребление калия', 'Сократите кофеин'],
  },
  kidney: {
    foods: ['Цветная капуста', 'Черника', 'Яичные белки', 'Чеснок', 'Оливковое масло', 'Капуста'],
    avoid: ['Тёмные колы', 'Авокадо', 'Цельнозерновой хлеб', 'Бананы (много калия)'],
    tips: ['Контролируйте потребление белка', 'Ограничьте продукты, богатые фосфором', 'Следите за уровнем калия', 'Пейте воду умеренно'],
  },
  digestive: {
    foods: ['Овсянка', 'Бананы', 'Имбирь', 'Йогурт (пробиотики)', 'Фенхель', 'Белый рис'],
    avoid: ['Острая пища', 'Продукты с высоким содержанием FODMAP', 'Избыток кофеина', 'Жареное'],
    tips: ['Попробуйте диету с низким содержанием FODMAP', 'Ешьте медленно и тщательно пережёвывайте', 'Определите продукты-триггеры', 'Подумайте о пробиотиках'],
  },
  allergies: {
    foods: ['Свежие цельные продукты', 'Альтернативные злаки', 'Белки-заменители'],
    avoid: ['Конкретные аллергены (индивидуально)', 'Продукты с перекрёстным загрязнением'],
    tips: ['Всегда читайте этикетки', 'Держите под рукой экстренные контакты', 'Предупреждайте рестораны', 'Проверяйте скрытые аллергены'],
  },
};

export default function Medical({ currentPage, onNavigate }: MedicalProps) {
  const [selected, setSelected] = useState('diabetes');
  const details = conditionDetails[selected];

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Медицинское питание" subtitle="Персональная поддержка при вашем заболевании">
      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-info-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <AlertCircle size={20} className="text-info-700 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-primary leading-relaxed">
          Vivora даёт рекомендации по питанию, а не медицинские советы. Всегда консультируйтесь с врачом перед изменением диеты при заболевании.
        </p>
      </div>

      {/* Condition selector */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {medicalConditions.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${selected === c.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{c.emoji}</span>
              <p className="font-semibold text-text-primary">{c.name}</p>
            </div>
            <p className="text-xs text-text-secondary">{c.description}</p>
          </button>
        ))}
      </div>

      {/* Selected condition details */}
      <div className="grid lg:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-6">
        {/* Recommended foods */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
              <Check size={16} className="text-primary" />
            </div>
            <h3 className="font-bold text-text-primary">Рекомендуемые продукты</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {details.foods.map((f) => (
              <span key={f} className="tag bg-primary-50 text-primary">{f}</span>
            ))}
          </div>
        </div>

        {/* Foods to avoid */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-accent-50 rounded-lg flex items-center justify-center">
              <AlertCircle size={16} className="text-accent-700" />
            </div>
            <h3 className="font-bold text-text-primary">Продукты, которые стоит ограничить</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {details.avoid.map((f) => (
              <span key={f} className="tag bg-accent-50 text-accent-700">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-4 sm:mb-6">
        <h3 className="font-bold text-text-primary mb-4">Полезные советы</h3>
        <div className="space-y-3">
          {details.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-sm text-text-primary">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vivi personalized recommendation */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-info-50 rounded-2xl p-3 sm:p-4 mb-4">
        <Vivi size={56} mood="thinking" />
        <div className="flex-1 pt-1">
          <p className="text-sm font-semibold text-text-primary mb-1">Персональный совет от Виви</p>
          <p className="text-sm text-text-primary leading-relaxed">
            На основе вашего профиля ({medicalConditions.find((c) => c.id === selected)?.name.toLowerCase()}) я скорректировала рекомендации по питанию. Ваш недельный план теперь отдаёт приоритет продуктам вроде «{details.foods[0].toLowerCase()}». Показать подходящие рецепты?
          </p>
          <button onClick={() => onNavigate('recipes')} className="btn-primary text-sm mt-3 flex items-center gap-2 w-fit">
            Показать рецепты <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
