import { Users, MessageCircle, Trophy, ChefHat, ArrowRight, Sparkles } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface CommunityProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const discussions = [
  { author: 'Sarah M.', avatar: '👩', title: 'Лучшие перекусы с низким ГИ при вечернем голоде?', replies: 24, likes: 89, tag: 'Диабет' },
  { author: 'James K.', avatar: '👨', title: 'Делюсь своим меню на 30 дней — минус 4 кг!', replies: 56, likes: 142, tag: 'Похудение' },
  { author: 'Lena T.', avatar: '👩‍🎓', title: 'Веганские идеи для белкового завтрака?', replies: 18, likes: 67, tag: 'Веганство' },
  { author: 'Marco D.', avatar: '🏃', title: 'Предтренировочные приёмы пищи, которые реально работают', replies: 31, likes: 95, tag: 'Фитнес' },
];

const challenges = [
  { name: '30-дневный челлендж гидратации', participants: 1240, days: 12, emoji: '💧', progress: 40 },
  { name: 'Ешь 5 овощей в день', participants: 890, days: 7, emoji: '🥬', progress: 71 },
  { name: 'Неделя без добавленного сахара', participants: 2100, days: 5, emoji: '🍬', progress: 28 },
];

export default function Community({ currentPage, onNavigate }: CommunityProps) {
  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Сообщество" subtitle="Скоро — растём вместе">
      {/* Coming soon banner */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <Vivi size={56} mood="excited" />
        <div className="flex-1 pt-1">
          <p className="text-sm font-semibold text-text-primary mb-1">Здесь растёт что-то прекрасное 🌱</p>
          <p className="text-sm text-text-primary leading-relaxed">
            Сообщество скоро появится — делитесь рецептами, участвуйте в челленджах и находите единомышленников на том же пути, что и вы. Вот небольшой превью!
          </p>
        </div>
      </div>

      {/* Challenges */}
      <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><Trophy size={18} className="text-primary" /> Активные челленджи</h3>
      <div className="grid sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {challenges.map((c) => (
          <div key={c.name} className="card-hover">
            <div className="text-3xl mb-2">{c.emoji}</div>
            <p className="font-semibold text-text-primary text-sm">{c.name}</p>
            <p className="text-xs text-text-secondary mt-1">{c.participants.toLocaleString()} участников присоединились</p>
            <div className="h-1.5 bg-border rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
            </div>
            <p className="text-xs text-primary font-medium mt-1">День {c.days} • {c.progress}%</p>
            <button className="btn-secondary w-full mt-3 text-xs py-2">Присоединиться</button>
          </div>
        ))}
      </div>

      {/* Discussions */}
      <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><MessageCircle size={18} className="text-primary" /> Популярные обсуждения</h3>
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
              <span className="flex items-center gap-1"><MessageCircle size={12} /> {d.replies} ответов</span>
              <span className="flex items-center gap-1">❤ {d.likes}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Features preview */}
      <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><Sparkles size={18} className="text-primary" /> Что вас ждёт</h3>
      <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
        {[
          { icon: ChefHat, title: 'Обмен рецептами', text: 'Делитесь своими полезными блюдами с сообществом' },
          { icon: Users, title: 'Поиск друзей', text: 'Находите единомышленников по целям и состоянию здоровья' },
          { icon: Trophy, title: 'Групповые челленджи', text: 'Присоединяйтесь к челленджам или создавайте свои, чтобы оставаться мотивированными вместе' },
          { icon: MessageCircle, title: 'Группы поддержки', text: 'Найдите своё сообщество — диабет, веганство, похудение и многое другое' },
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
        Получить уведомление о запуске <ArrowRight size={16} />
      </button>
    </AppShell>
  );
}
