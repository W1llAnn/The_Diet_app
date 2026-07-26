import { useState } from 'react';
import { Search, ChevronRight, Mail, MessageCircle, BookOpen } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface HelpProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const helpCategories = [
  { icon: '🚀', title: 'Getting started', articles: 12 },
  { icon: '🤖', title: 'AI Assistant (Vivi)', articles: 8 },
  { icon: '🥗', title: 'Food tracking & diary', articles: 15 },
  { icon: '📅', title: 'Meal planning', articles: 10 },
  { icon: '🩺', title: 'Medical conditions', articles: 14 },
  { icon: '👤', title: 'Account & profile', articles: 9 },
  { icon: '💳', title: 'Billing & Premium', articles: 7 },
  { icon: '🔒', title: 'Privacy & security', articles: 6 },
];

const popularArticles = [
  'How do I set up my daily calorie goal?',
  'Can I sync Vivora with Apple Health?',
  'How does Vivi personalize my recommendations?',
  'What medical conditions does Vivora support?',
  'How do I cancel my Premium subscription?',
  'Is my health data private and secure?',
];

export default function Help({ currentPage, onNavigate }: HelpProps) {
  const [query, setQuery] = useState('');

  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="Help Center" subtitle="How can we help?">
      {/* Search */}
      <div className="relative mb-4 sm:mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for help..."
          className="input-field pl-11"
        />
      </div>

      {/* Vivi help */}
      <div className="flex items-start gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <Vivi size={56} mood="happy" />
        <div className="flex-1 pt-1">
          <p className="text-sm text-text-primary leading-relaxed">
            Can't find what you're looking for? Ask me directly — I can answer most questions about nutrition and using Vivora!
          </p>
          <button onClick={() => onNavigate('ai')} className="btn-primary text-sm mt-3 flex items-center gap-2 w-fit">
            Ask Vivi <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <h3 className="font-bold text-text-primary mb-3">Browse by topic</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {helpCategories.map((c, i) => (
          <button key={i} className="card-hover text-left">
            <div className="text-3xl mb-2">{c.icon}</div>
            <p className="font-semibold text-text-primary text-sm">{c.title}</p>
            <p className="text-xs text-text-secondary mt-1">{c.articles} articles</p>
          </button>
        ))}
      </div>

      {/* Popular articles */}
      <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><BookOpen size={18} className="text-primary" /> Popular articles</h3>
      <div className="card p-2 mb-4 sm:mb-6">
        {popularArticles.map((a, i) => (
          <button key={i} className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cream transition-all text-left">
            <span className="text-sm font-medium text-text-primary">{a}</span>
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        ))}
      </div>

      {/* Contact */}
      <h3 className="font-bold text-text-primary mb-3">Still need help?</h3>
      <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
        <a href="mailto:support@vivora.app" className="card-hover flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center"><Mail size={18} className="text-primary" /></div>
          <div>
            <p className="font-semibold text-text-primary text-sm">Email support</p>
            <p className="text-xs text-text-secondary">support@vivora.app</p>
          </div>
        </a>
        <button onClick={() => onNavigate('ai')} className="card-hover flex items-center gap-3 text-left">
          <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center"><MessageCircle size={18} className="text-accent-700" /></div>
          <div>
            <p className="font-semibold text-text-primary text-sm">Chat with Vivi</p>
            <p className="text-xs text-text-secondary">Available 24/7</p>
          </div>
        </button>
      </div>
    </AppShell>
  );
}
