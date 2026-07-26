import { Bell, Droplets, Flame, Trophy, Bot, Check } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';

interface NotificationsProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const notifications = [
  { id: 1, icon: Flame, color: 'bg-accent-50 text-accent-700', title: 'You\'re 80% to your calorie goal', text: 'Nicely paced! Try a light dinner to finish strong.', time: '5 min ago', unread: true },
  { id: 2, icon: Trophy, color: 'bg-primary-50 text-primary', title: 'Achievement unlocked: Week Warrior!', text: 'You logged meals for 7 consecutive days. Amazing!', time: '2 hours ago', unread: true },
  { id: 3, icon: Droplets, color: 'bg-info-50 text-info-700', title: 'Time to hydrate', text: 'You\'re 2 glasses short of your daily water goal.', time: '3 hours ago', unread: true },
  { id: 4, icon: Bot, color: 'bg-primary-50 text-primary', title: 'Vivi has a tip for you', text: 'Your iron intake is a bit low today. Try adding spinach to dinner!', time: '5 hours ago', unread: false },
  { id: 5, icon: Flame, color: 'bg-accent-50 text-accent-700', title: 'Daily summary ready', text: 'Yesterday you hit 1,920 kcal and all your macros. Great balance!', time: 'Yesterday', unread: false },
  { id: 6, icon: Trophy, color: 'bg-primary-50 text-primary', title: 'You\'re on a 7-day streak!', text: 'Keep logging to extend it. You\'ve got this!', time: 'Yesterday', unread: false },
];

export default function Notifications({ currentPage, onNavigate }: NotificationsProps) {
  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Notifications" subtitle="Stay in the loop, gently">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-sm text-text-secondary">3 unread</span>
        <button className="text-sm text-primary font-medium hover:underline">Mark all read</button>
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
          <Check size={12} /> You're all caught up
        </p>
      </div>
    </AppShell>
  );
}
