import { Flame, Trophy, Lock, TrendingUp } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import { achievements } from '@/data/content';

interface AchievementsProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Achievements({ currentPage, onNavigate }: AchievementsProps) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Achievements" subtitle="Celebrate every win, big and small">
      {/* Streak hero */}
      <div className="bg-gradient-primary rounded-3xl p-5 sm:p-6 text-white mb-4 sm:mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <Flame size={32} />
          </div>
          <div>
            <p className="text-sm opacity-90">Current streak</p>
            <p className="text-3xl font-bold">7 days!</p>
            <p className="text-sm opacity-90 mt-1">Keep logging to extend it</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        <div className="card text-center">
          <Trophy size={20} className="text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-text-primary">{unlocked.length}</p>
          <p className="text-xs text-text-secondary">Unlocked</p>
        </div>
        <div className="card text-center">
          <Flame size={20} className="text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold text-text-primary">7</p>
          <p className="text-xs text-text-secondary">Day streak</p>
        </div>
        <div className="card text-center">
          <TrendingUp size={20} className="text-info mx-auto mb-1" />
          <p className="text-2xl font-bold text-text-primary">42</p>
          <p className="text-xs text-text-secondary">Total points</p>
        </div>
      </div>

      {/* Unlocked */}
      <h3 className="font-bold text-text-primary mb-3">Recently unlocked</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {unlocked.map((a) => (
          <div key={a.id} className="card-hover text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">{a.emoji}</div>
            <p className="font-bold text-text-primary">{a.name}</p>
            <p className="text-xs text-text-secondary mt-1">{a.description}</p>
            <p className="text-xs text-primary font-medium mt-2">{a.date}</p>
          </div>
        ))}
      </div>

      {/* Locked */}
      <h3 className="font-bold text-text-primary mb-3">Coming up next</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {locked.map((a) => (
          <div key={a.id} className="card text-center opacity-90">
            <div className="relative w-16 h-16 bg-cream rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
              <span className="grayscale opacity-50">{a.emoji}</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-soft">
                <Lock size={12} className="text-text-secondary" />
              </div>
            </div>
            <p className="font-bold text-text-primary">{a.name}</p>
            <p className="text-xs text-text-secondary mt-1">{a.description}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-text-secondary mb-1">
                <span>Progress</span>
                <span className="font-bold text-primary">{a.progress}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${a.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vivi celebration */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4">
        <Vivi size={56} mood="excited" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            Three achievements in one week — that's fantastic! You're building habits that last. Just 3 more days until your next one. I believe in you! 🌱
          </p>
        </div>
      </div>
    </AppShell>
  );
}
