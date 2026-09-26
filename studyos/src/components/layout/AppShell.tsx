import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/utils/helpers';

export function AppShell() {
  useEffect(() => {
    const handleToggleSidebar = () => {
      document.body.classList.toggle('sidebar-open');
    };
    document.addEventListener('toggle-sidebar', handleToggleSidebar);
    return () => document.removeEventListener('toggle-sidebar', handleToggleSidebar);
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <div className={cn(
        'transition-all duration-300 min-h-screen',
        'lg:pl-64'
      )}>
        <Header />
        <main className="pt-16 pb-8 px-4 md:px-6 lg:px-8" id="main-content" role="main">
          <Outlet />
        </main>
      </div>
      
      <style jsx global>{`
        @media (max-width: 1023px) {
          .sidebar-open .lg\\:pl-64 {
            padding-left: 16rem;
          }
        }
      `}</style>
    </div>
  );
}