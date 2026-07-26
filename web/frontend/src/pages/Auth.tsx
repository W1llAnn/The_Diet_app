import { useState } from 'react';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import type { Page } from '@/App';
import Vivi from '@/components/Vivi';
import { supabase } from '@/lib/supabase';

interface AuthProps {
  mode: 'login' | 'register' | 'forgot';
  onNavigate: (page: Page) => void;
}

export default function Auth({ mode, onNavigate }: AuthProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const titles = {
    login: { title: 'Welcome back', subtitle: 'Let\'s continue your journey together.' },
    register: { title: 'Create your account', subtitle: 'Your brighter relationship with food starts here.' },
    forgot: { title: 'Reset your password', subtitle: 'We\'ll send you a link to get back in.' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'forgot') {
      // Отправляем письмо для сброса пароля через Supabase.
      setLoading(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      if (resetError) {
        setError(resetError.message);
        return;
      }
      alert('Password reset link sent! Check your email.');
      onNavigate('login');
      return;
    }

    setLoading(true);
    if (mode === 'register') {
      // Регистрация: Supabase создаёт пользователя, сессия возвращается сразу.
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // Если требуется подтверждение email — сессии не будет.
      if (!data.session) {
        setError('Check your email to confirm the account, then log in.');
        onNavigate('login');
        return;
      }
      onNavigate('onboarding');
    } else {
      // Вход: проверка пароля в Supabase.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - form */}
      <div className="flex flex-col p-6 lg:p-12 bg-cream safe-area-top">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5 self-start">
          <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">Vivora</span>
        </button>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">{titles[mode].title}</h1>
              <p className="text-text-secondary mt-2">{titles[mode].subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="input-field"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-text-primary">Password</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => onNavigate('forgot')} className="text-xs text-primary hover:underline">Forgot password?</button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-11 pr-11"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait…' : (
                  <>
                    {mode === 'login' && 'Log in'}
                    {mode === 'register' && 'Create account'}
                    {mode === 'forgot' && 'Send reset link'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {mode === 'forgot' && (
              <button onClick={() => onNavigate('login')} className="btn-ghost w-full mt-3 text-sm">
                Back to login
              </button>
            )}

            {mode === 'login' && (
              <p className="text-center text-sm text-text-secondary mt-6">
                New to Vivora?{' '}
                <button onClick={() => onNavigate('register')} className="text-primary font-semibold hover:underline">Create an account</button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-center text-sm text-text-secondary mt-6">
                Already have an account?{' '}
                <button onClick={() => onNavigate('login')} className="text-primary font-semibold hover:underline">Log in</button>
              </p>
            )}

            {mode === 'register' && (
              <p className="text-center text-xs text-text-secondary mt-4 leading-relaxed">
                By continuing, you agree to Vivora's Terms of Service and Privacy Policy. Your health data stays private.
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-text-secondary text-center">© 2026 Vivora</p>
      </div>

      {/* Right side - illustration */}
      <div className="hidden lg:flex bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent-100 rounded-full blur-3xl opacity-40" />
        <div className="relative text-center max-w-md">
          <div className="flex justify-center mb-8">
            <Vivi size={140} mood="waving" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary leading-tight">
            "Hi, I'm Vivi!
            <br />Let's grow together."
          </h2>
          <p className="text-text-secondary mt-4 leading-relaxed">
            I'll be your gentle companion on this journey. No judgment, no pressure — just small, happy steps toward feeling your best.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="bg-white/60 backdrop-blur rounded-2xl p-4">
              <p className="text-2xl font-bold text-primary">50K+</p>
              <p className="text-xs text-text-secondary">Happy users</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-2xl p-4">
              <p className="text-2xl font-bold text-primary">1M+</p>
              <p className="text-xs text-text-secondary">Meals logged</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-2xl p-4">
              <p className="text-2xl font-bold text-primary">4.9★</p>
              <p className="text-xs text-text-secondary">App rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
