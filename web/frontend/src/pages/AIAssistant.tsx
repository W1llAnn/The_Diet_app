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
  'What should I eat for dinner?',
  'Compare quinoa vs brown rice',
  'I have diabetes — is banana okay?',
  'Suggest a high-protein breakfast',
];

const aiResponses: Record<string, string> = {
  'What should I eat for dinner?': "Great question! Based on your goals and today's intake, I'd suggest grilled salmon with quinoa and roasted vegetables. You're a bit low on protein and omega-3s today, and salmon is perfect for both. Want me to add it to your meal plan?",
  'Compare quinoa vs brown rice': "Both are great whole grains! Quinoa has more protein (8g vs 5g per cup), is a complete protein, and has a lower glycemic index (53 vs 50). Brown rice has slightly more fiber. For your diabetes management, quinoa's complete protein profile gives it a slight edge. Both are excellent choices!",
  'I have diabetes — is banana okay?': "Yes, in moderation! Bananas have a medium glycemic index (51). A small banana is perfectly fine. To minimize blood sugar impact, pair it with a protein or fat — like a handful of almonds or a spoon of peanut butter. Berries and cherries are even lower-GI alternatives if you want variety. 🍌",
  'Suggest a high-protein breakfast': "Here are three high-protein breakfasts I think you'll love:\n\n1. Greek yogurt parfait (17g protein) — layer yogurt, berries, and a sprinkle of granola\n2. Veggie omelette with 2 eggs (24g protein) — add spinach and tomatoes\n3. Protein smoothie (25g protein) — banana, Greek yogurt, almond butter, and a scoop of protein\n\nWant me to add one to your diary?",
};

export default function AIAssistant({ currentPage, onNavigate }: AIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi Alex! I'm Vivi, your nutrition buddy. Ask me anything — meal ideas, food comparisons, diet advice, or just say hi! I'm here to help, never to judge. 💚",
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
      const response = aiResponses[text] || "That's a great question! Based on your profile and goals, I'd recommend focusing on whole foods, staying hydrated, and balancing your plate with protein, healthy fats, and fiber-rich carbs. Would you like me to suggest specific meals or look up a food for you?";
      setMessages((m) => [...m, { id: Date.now().toString(), role: 'assistant', content: response, timestamp: 'now' }]);
      setTyping(false);
    }, 1400);
  };

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Vivi AI Assistant" subtitle="Your nutrition buddy, anytime">
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
              placeholder="Ask Vivi anything..."
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
