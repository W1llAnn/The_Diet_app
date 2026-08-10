import type { Page } from '@/App';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

interface AppShellProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showBack?: boolean;
  backPage?: Page;
  children: React.ReactNode;
}

export default function AppShell({ currentPage, onNavigate, title, subtitle, showSearch, showBack, backPage, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar
          title={title}
          subtitle={subtitle}
          onNavigate={onNavigate}
          showSearch={showSearch}
          showBack={showBack}
          backPage={backPage}
        />
        <main className="flex-1 px-3 sm:px-4 lg:px-8 py-4 lg:py-6 pb-28 lg:pb-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
}
