import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { Sun, Moon, Monitor, Bell, Menu, X, Command, User, LogOut } from 'lucide-react';
import { Button, Dropdown, Avatar, useToast } from '@/components/ui';
import { useAppStore } from '@/store';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { preferences, updatePreferences } = useAppStore();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(preferences.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updatePreferences({ theme: nextTheme });
  };

  const themeIcon = preferences.theme === 'dark' ? <Moon className="w-5 h-5" /> : 
    preferences.theme === 'light' ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />;

  const userMenuItems = [
    { label: 'Profile', onClick: () => {}, icon: <User className="w-4 h-4" /> },
    { label: 'Settings', onClick: () => { navigate('/settings'); }, icon: <Settings className="w-4 h-4" /> },
    { label: 'Sign out', onClick: () => { toast({ type: 'info', title: 'Sign out not implemented' }); }, icon: <LogOut className="w-4 h-4" />, dangerous: true },
  ];

  const notificationItems = [
    { label: 'No new notifications', onClick: () => {}, disabled: true },
  ];

  const navigate = (path: string) => {
    setSearchParams({});
    window.location.href = path;
  };

  return (
    <header className={cn(
      'fixed top-0 right-0 z-30 h-16 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800',
      'transition-all duration-300'
    )}>
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            aria-label="Open menu"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative hidden sm:block">
            <input
              ref={searchRef}
              type="search"
              placeholder="Search... (⌘K)"
              className={cn(
                'w-72 pl-10 pr-4 py-2 text-sm bg-surface-100 dark:bg-surface-800 border-0 rounded-xl',
                'focus:bg-white dark:focus:bg-surface-900 focus:ring-2 focus:ring-brand-500/20 focus:outline-none',
                searchOpen && 'bg-white dark:bg-surface-900 shadow-elevated border border-surface-200 dark:border-surface-700'
              )}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              value={searchParams.get('q') || ''}
              onChange={(e) => setSearchParams({ q: e.target.value })}
              aria-label="Global search"
            />
            <Command className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            {searchOpen && searchParams.get('q') && (
              <button
                onClick={() => setSearchParams({})}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Theme: ${preferences.theme}`} onClick={toggleTheme}>
                {themeIcon}
              </Button>
            }
            items={[
              { label: 'Light', onClick: () => updatePreferences({ theme: 'light' }), checked: preferences.theme === 'light' },
              { label: 'Dark', onClick: () => updatePreferences({ theme: 'dark' }), checked: preferences.theme === 'dark' },
              { label: 'System', onClick: () => updatePreferences({ theme: 'system' }), checked: preferences.theme === 'system' },
            ]}
          />

          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="w-5 h-5" />
              </Button>
            }
            items={notificationItems}
          />

          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" aria-label="User menu" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <Avatar name="Student" size="sm" />
              </Button>
            }
            items={userMenuItems}
          />
        </div>
      </div>
    </header>
  );
}