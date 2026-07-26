import { Bell, Droplets, Flame, Trophy, Bot, Check } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';

interface NotificationsProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const notifications = [
  { id: 1, icon: Flame, color: 'bg-accent-50 text-accent-700', title: 'Вы на 80% близки к цели по калориям', text: 'Отличный темп! Попробуйте лёгкий ужин, чтобы завершить день достойно.', time: '5 мин назад', unread: true },
  { id: 2, icon: Trophy, color: 'bg-primary-50 text-primary', title: 'Достижение разблокировано: Воин недели!', text: 'Вы фиксировали приёмы пищи 7 дней подряд. Здорово!', time: '2 часа назад', unread: true },
  { id: 3, icon: Droplets, color: 'bg-info-50 text-info-700', title: 'Время попить воды', text: 'Вам не хватает 2 стаканов до дневной нормы.', time: '3 часа назад', unread: true },
  { id: 4, icon: Bot, color: 'bg-primary-50 text-primary', title: 'У Виви есть совет для вас', text: 'Сегодня уровень железа немного низкий. Добавьте шпинат к ужину!', time: '5 часов назад', unread: false },
  { id: 5, icon: Flame, color: 'bg-accent-50 text-accent-700', title: 'Дневной итог готов', text: 'Вчера вы набрали 1 920 ккал и выполнили все нормы по макросам. Отличный баланс!', time: 'Вчера', unread: false },
  { id: 6, icon: Trophy, color: 'bg-primary-50 text-primary', title: 'Вы держитесь уже 7 дней подряд!', text: 'Продолжайте фиксировать приёмы пищи, чтобы увеличить серию. У вас получится!', time: 'Вчера', unread: false },
];

export default function Notifications({ currentPage, onNavigate }: NotificationsProps) {
  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Уведомления" subtitle="Будьте в курсе — мягко и ненавязчиво">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-sm text-text-secondary">3 непрочитанных</span>
        <button className="text-sm text-primary font-medium hover:underline">Отметить все прочитанными</button>
      </div>

      <div className="space-y-2 sm:space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`card flex items-start gap-3 ${n.unread ? 'border-primary-200 bg-primary-50/30' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
              <n.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-text-primary text-sm">{n.title}</p>
                {n.unread && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
              </div>
              <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">{n.text}</p>
              <p className="text-xs text-text-secondary mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5 sm:mt-6">
        <p className="text-xs text-text-secondary flex items-center justify-center gap-1">
          <Check size={12} /> Вы прочитали всё
        </p>
      </div>
    </AppShell>
  );
}
