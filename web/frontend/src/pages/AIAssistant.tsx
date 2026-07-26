import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Camera, Mic } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';
import type { ChatMessage } from '@/data/content';

interface AIProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const suggestions = [
  'Что съесть на ужин?',
  'Сравните киноа и бурый рис',
  'У меня диабет — можно ли банан?',
  'Предложите белковый завтрак',
];

const aiResponses: Record<string, string> = {
  'Что съесть на ужин?': "Отличный вопрос! Судя по вашим целям и сегодняшнему рациону, я бы предложила гриль из лосося с киноа и запечёнными овощами. Сегодня вам немного не хватает белка и омега-3, и лосось отлично восполнит оба пробела. Добавить в план питания?",
  'Сравните киноа и бурый рис': "Оба — отличные цельные злаки! В киноа больше белка (8 г против 5 г на чашку), это полноценный белок, а её гликемический индекс ниже (53 против 50). В буром рисе чуть больше клетчатки. Для контроля диабета полноценный белковый профиль киноа даёт небольшое преимущество. Но оба варианта — прекрасный выбор!",
  'У меня диабет — можно ли банан?': "Да, в умеренных количествах! У бананов средний гликемический индекс (51). Небольшой банан — вполне нормально. Чтобы снизить влияние на уровень сахара, сочетайте его с белком или жирами — например, с горстью миндаля или ложкой арахисовой пасты. Ягоды и вишня — ещё более низкогликемичные альтернативы, если хочется разнообразия. 🍌",
  'Предложите белковый завтрак': "Вот три белковых завтрака, которые вам понравятся:\n\n1. Пафф из греческого йогурта (17 г белка) — слоями выложите йогурт, ягоды и немного гранолы\n2. Овощной омлет из 2 яиц (24 г белка) — добавьте шпинат и помидоры\n3. Протеиновый смузи (25 г белка) — банан, греческий йогурт, миндальная паста и мерная ложка протеина\n\nДобавить один из них в дневник?",
};

export default function AIAssistant({ currentPage, onNavigate }: AIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Привет, Алекс! Я Виви, твоя напарница по питанию. Спрашивай о чём угодно — идеи блюд, сравнение продуктов, советы по диете или просто скажи привет! Я здесь, чтобы помочь, а не осуждать. 💚",
      timestamp: 'now',
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: 'now' };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = aiResponses[text] || "Отличный вопрос! Судя по вашему профилю и целям, я бы рекомендовала сосредоточиться на цельных продуктах, пить достаточно воды и сбалансировать тарелку белком, полезными жирами и углеводами, богатыми клетчаткой. Предложить конкретные блюда или посмотреть какой-нибудь продукт для вас?";
      setMessages((m) => [...m, { id: Date.now().toString(), role: 'assistant', content: response, timestamp: 'now' }]);
      setTyping(false);
    }, 1400);
  };

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="ИИ-ассистент Виви" subtitle="Твоя напарница по питанию в любое время">
      <div className="flex flex-col h-[calc(100vh-220px)] lg:h-[calc(100vh-160px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && <Vivi size={36} mood="happy" animate={false} className="flex-shrink-0 mt-1" />}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-tr-md'
                    : 'bg-white border border-border rounded-tl-md shadow-soft text-text-primary'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{m.content}</p>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-2 justify-start">
              <Vivi size={36} mood="thinking" animate={false} className="flex-shrink-0 mt-1" />
              <div className="bg-white border border-border rounded-2xl rounded-tl-md shadow-soft px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="bg-white border border-border rounded-full px-4 py-2 text-sm text-text-primary hover:border-primary hover:bg-primary-50 transition-all flex items-center gap-1.5"
              >
                <Sparkles size={12} className="text-primary" /> {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-white border border-border rounded-2xl p-2 shadow-soft">
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center text-text-secondary hover:bg-primary-50 transition-all flex-shrink-0">
              <Camera size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Спросить Виви о чём угодно..."
              className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder-text-secondary text-sm py-2"
            />
            <button className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center text-text-secondary hover:bg-primary-50 transition-all flex-shrink-0">
              <Mic size={18} />
            </button>
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
