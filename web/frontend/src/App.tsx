import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import type { Page } from '@/data/content';

export type { Page };
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Diary from '@/pages/Diary';
import SearchPage from '@/pages/SearchPage';
import Product from '@/pages/Product';
import Planner from '@/pages/Planner';
import Recipes from '@/pages/Recipes';
import Medical from '@/pages/Medical';
import AIAssistant from '@/pages/AIAssistant';
import Progress from '@/pages/Progress';
import Achievements from '@/pages/Achievements';
import Community from '@/pages/Community';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Premium from '@/pages/Premium';
import Help from '@/pages/Help';
import About from '@/pages/About';
import { supabase, fetchIsAdmin } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Публичные страницы — доступны без входа.
const PUBLIC_PAGES: Page[] = ['landing', 'login', 'register', 'forgot', 'about', 'help'];

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false); // false, пока не проверили сессию

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Один раз при старте: восстановить сессию + подписаться на её изменения.
  useEffect(() => {
    let active = true;

    // Восстановление текущей сессии из localStorage.
    // catch обязателен: если промис отвергнётся, без него authReady навсегда
    // останется false и приложение уйдёт в вечный белый экран.
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        const u = data.session?.user ?? null;
        setUser(u);
        if (u) {
          try {
            setIsAdmin(await fetchIsAdmin());
          } catch (e) {
            console.error('[auth] fetchIsAdmin упал:', e);
          }
        }
        setAuthReady(true);
      })
      .catch((e) => {
        console.error('[auth] getSession упал:', e);
        if (active) setAuthReady(true); // всё равно показываем UI
      });

    // Реакция на вход/выход (например, из формы Auth).
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      try {
        setIsAdmin(u ? await fetchIsAdmin() : false);
      } catch (e) {
        console.error('[auth] fetchIsAdmin в onAuthStateChange упал:', e);
      }
      // После входа кидаем на дашборд.
      if (u && (page === 'login' || page === 'register')) navigate('dashboard');
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = 'Vivora — ваш бережный спутник в питании';
  }, []);

  // Пока не проверили сессию — не рендерим ничего тяжёлого, чтобы не мелькал логин.
  if (!authReady) return null;

  // Защита: на закрытую страницу без пользователя — кидаем на логин.
  if (!user && !PUBLIC_PAGES.includes(page)) {
    return <Auth mode="login" onNavigate={navigate} />;
  }

  // Landing & auth pages render full-screen (no app shell)
  if (page === 'landing') return <Landing onNavigate={navigate} />;
  if (page === 'login') return <Auth mode="login" onNavigate={navigate} />;
  if (page === 'register') return <Auth mode="register" onNavigate={navigate} />;
  if (page === 'forgot') return <Auth mode="forgot" onNavigate={navigate} />;
  if (page === 'onboarding') return <Onboarding onNavigate={navigate} />;

  // App pages (with shell)
  switch (page) {
    case 'dashboard': return <Dashboard currentPage={page} onNavigate={navigate} />;
    case 'diary': return <Diary currentPage={page} onNavigate={navigate} />;
    case 'search': return <SearchPage currentPage={page} onNavigate={navigate} />;
    case 'product': return <Product currentPage={page} onNavigate={navigate} />;
    case 'planner': return <Planner currentPage={page} onNavigate={navigate} />;
    case 'recipes': return <Recipes currentPage={page} onNavigate={navigate} />;
    case 'medical': return <Medical currentPage={page} onNavigate={navigate} />;
    case 'ai': return <AIAssistant currentPage={page} onNavigate={navigate} />;
    case 'progress': return <Progress currentPage={page} onNavigate={navigate} />;
    case 'achievements': return <Achievements currentPage={page} onNavigate={navigate} />;
    case 'community': return <Community currentPage={page} onNavigate={navigate} />;
    case 'notifications': return <Notifications currentPage={page} onNavigate={navigate} />;
    case 'profile': return <Profile currentPage={page} onNavigate={navigate} />;
    case 'settings':
      // В Settings передаём user/isAdmin, чтобы можно было показать «вы админ» и кнопку выхода.
      return <Settings currentPage={page} onNavigate={navigate} user={user} isAdmin={isAdmin} />;
    case 'premium': return <Premium currentPage={page} onNavigate={navigate} />;
    case 'help': return <Help currentPage={page} onNavigate={navigate} />;
    case 'about': return <About currentPage={page} onNavigate={navigate} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf size={28} className="text-white" />
            </div>
            <p className="text-text-secondary">Страница не найдена</p>
            <button onClick={() => navigate('landing')} className="btn-primary mt-4">На главную</button>
          </div>
        </div>
      );
  }
}

export default App;
