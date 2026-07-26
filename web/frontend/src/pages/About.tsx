import { Leaf, Heart, Target, Users, Shield, Sparkles } from 'lucide-react';
import type { Page } from '@/App';
import AppShell from '@/components/layout/AppShell';
import Vivi from '@/components/Vivi';

interface AboutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function About({ currentPage, onNavigate }: AboutProps) {
  return (
    <AppShell currentPage={currentPage} onNavigate={onNavigate} title="About Vivora" subtitle="Our story, our heart">
      {/* Hero */}
      <div className="text-center py-6 sm:py-8 mb-4 sm:mb-6">
        <div className="flex justify-center mb-4">
          <Vivi size={100} mood="love" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">We believe food should feel good</h2>
        <p className="text-base sm:text-lg text-text-secondary mt-3 max-w-xl mx-auto leading-relaxed">
          Vivora was born from a simple idea: nutrition guidance should be warm, personal, and never make anyone feel guilty about what they eat.
        </p>
      </div>

      {/* Mission */}
      <div className="card mb-4 sm:mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Target size={20} className="text-primary" />
          <h3 className="font-bold text-text-primary">Our mission</h3>
        </div>
        <p className="text-text-primary leading-relaxed">
          To build a nutrition companion that helps every person — regardless of age, gender, or health condition — develop a healthier, happier relationship with food. We're not a calorie counter. We're a companion.
        </p>
      </div>

      {/* Values */}
      <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
        {[
          { icon: Heart, title: 'Compassion first', text: 'No judgment, ever. We celebrate progress, not perfection.' },
          { icon: Sparkles, title: 'Intelligence with warmth', text: 'AI that feels human — helpful, gentle, and genuinely caring.' },
          { icon: Shield, title: 'Privacy by design', text: 'Your health data is yours. Encrypted, never sold, always exportable.' },
          { icon: Users, title: 'For everyone', text: 'From teens to retirees, athletes to beginners — Vivora adapts to you.' },
        ].map((v, i) => (
          <div key={i} className="card">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
              <v.icon size={18} className="text-primary" />
            </div>
            <p className="font-semibold text-text-primary">{v.title}</p>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-gradient-primary rounded-3xl p-6 sm:p-8 text-white text-center mb-4 sm:mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: '50K+', label: 'Happy users' },
            { value: '1M+', label: 'Meals logged' },
            { value: '6', label: 'Conditions supported' },
            { value: '4.9★', label: 'App rating' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm opacity-90 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="card mb-4 sm:mb-5">
        <h3 className="font-bold text-text-primary mb-3">The story of Vivi</h3>
        <p className="text-text-primary leading-relaxed mb-3">
          Vivi started as a small sprout — a simple idea that nutrition tools could be kind. Most apps felt cold, clinical, or punishing. We knew there was a better way.
        </p>
        <p className="text-text-primary leading-relaxed mb-3">
          So we built Vivora around a gentle companion that learns who you are and walks beside you. Whether you're managing diabetes, trying to lose weight, or just want to eat a bit better, Vivi is there with a helpful nudge and a warm word.
        </p>
        <p className="text-text-primary leading-relaxed">
          Today, Vivi helps tens of thousands of people feel brighter — one small, happy step at a time.
        </p>
      </div>

      {/* Team */}
      <div className="card mb-4 sm:mb-5 text-center">
        <div className="flex justify-center mb-3">
          <Vivi size={64} mood="waving" />
        </div>
        <h3 className="font-bold text-text-primary">Made with care</h3>
        <p className="text-sm text-text-secondary mt-1">By a small team of nutritionists, designers, and engineers who care.</p>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-bold text-text-primary">Vivora</span>
        </div>
        <p className="text-xs text-text-secondary">© 2026 Vivora. Made with 💚 for everyone.</p>
        <p className="text-xs text-text-secondary mt-1">Not a substitute for professional medical advice.</p>
      </div>
    </AppShell>
  );
}
