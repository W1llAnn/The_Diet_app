import { Users, MessageCircle, Trophy, ChefHat, ArrowRight, Sparkles } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface CommunityProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const discussions = [
  { author: 'Sarah M.', avatar: '👩', title: 'Best low-GI snacks for afternoon cravings?', replies: 24, likes: 89, tag: 'Diabetes' },
  { author: 'James K.', avatar: '👨', title: 'Sharing my 30-day meal plan — lost 4kg!', replies: 56, likes: 142, tag: 'Weight loss' },
  { author: 'Lena T.', avatar: '👩‍🎓', title: 'Vegan high-protein breakfast ideas?', replies: 18, likes: 67, tag: 'Vegan' },
  { author: 'Marco D.', avatar: '🏃', title: 'Pre-workout meals that actually work', replies: 31, likes: 95, tag: 'Fitness' },
];

const challenges = [
  { name: '30-Day Hydration Challenge', participants: 1240, days: 12, emoji: '💧', progress: 40 },
  { name: 'Eat 5 Veggies a Day', participants: 890, days: 7, emoji: '🥬', progress: 71 },
  { name: 'No Added Sugar Week', participants: 2100, days: 5, emoji: '🍬', progress: 28 },
];

export default function Community({ currentPage, onNavigate }: CommunityProps) {
  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Community" subtitle="Coming soon — grow together">
      {/* Coming soon banner */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <Vivi size={56} mood="excited" />
        <div className="flex-1 pt-1">
          <p className="text-sm font-semibold text-text-primary mb-1">Something beautiful is growing 🌱</p>
          <p className="text-sm text-text-primary leading-relaxed">
            Community is coming soon — share recipes, join challenges, and connect with people on the same journey as you. Here's a sneak peek!
          </p>
        </div>
      </div>

      {/* Challenges */}
      <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><Trophy size={18} className="text-primary" /> Active challenges</h3>
      <div className="grid sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {challenges.map((c) => (
          <div key={c.name} className="card-hover">
            <div className="text-3xl mb-2">{c.emoji}</div>
            <p className="font-semibold text-text-primary text-sm">{c.name}</p>
            <p className="text-xs text-text-secondary mt-1">{c.participants.toLocaleString()} people joined</p>
            <div className="h-1.5 bg-border rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
            </div>
            <p className="text-xs text-primary font-medium mt-1">Day {c.days} • {c.progress}%</p>
            <button className="btn-secondary w-full mt-3 text-xs py-2">Join challenge</button>
          </div>
        ))}
      </div>

      {/* Discussions */}
      <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><MessageCircle size={18} className="text-primary" /> Trending discussions</h3>
      <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
        {discussions.map((d, i) => (
          <div key={i} className="card-hover">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-cream rounded-full flex items-center justify-center text-lg">{d.avatar}</div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{d.author}</p>
                <span className="tag bg-primary-50 text-primary text-xs">{d.tag}</span>
              </div>
            </div>
            <p className="font-semibold text-text-primary">{d.title}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
              <span className="flex items-center gap-1"><MessageCircle size={12} /> {d.replies} replies</span>
              <span className="flex items-center gap-1">❤ {d.likes}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Features preview */}
      <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><Sparkles size={18} className="text-primary" /> What's coming</h3>
      <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
        {[
          { icon: ChefHat, title: 'Recipe sharing', text: 'Share your healthy creations with the community' },
          { icon: Users, title: 'Find friends', text: 'Connect with people who share your goals and conditions' },
          { icon: Trophy, title: 'Group challenges', text: 'Join or create challenges to stay motivated together' },
          { icon: MessageCircle, title: 'Support groups', text: 'Find your tribe — diabetes, vegan, weight loss, and more' },
        ].map((f, i) => (
          <div key={i} className="card flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <f.icon size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">{f.title}</p>
              <p className="text-xs text-text-secondary mt-0.5">{f.text}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary w-full mt-4 sm:mt-6 flex items-center justify-center gap-2">
        Get notified when we launch <ArrowRight size={16} />
      </button>
    </AppShell>
  );
}
