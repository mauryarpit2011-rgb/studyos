import { useState, useEffect } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { Home, CheckSquare, FileText, Calendar, Timer, BarChart3, Search, Settings, ChevronLeft, ChevronRight, BookOpen, Target } from 'lucide-react';
import { useAppStore } from '@/store';

const navigation = [
  { key: 'dashboard', label: 'Dashboard', icon: Home, href: '/' },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { key: 'notes', label: 'Notes', icon: FileText, href: '/notes' },
  { key: 'planner', label: 'Planner', icon: Calendar, href: '/planner' },
  { key: 'focus', label: 'Focus', icon: Timer, href: '/focus' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { key: 'search', label: 'Search', icon: Search, href: '/search' },
  { key: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { tasks, preferences } = useAppStore();
  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) <= new Date()).length;
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()).length;

  useEffect(() => {
    const saved = localStorage.getItem('studyos-sidebar-collapsed');
    if (saved !== null) setCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('studyos-sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const badgeCount = overdueTasks > 0 ? overdueTasks : pendingTasks > 0 ? pendingTasks : undefined;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-300 ease-spring flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-surface-200 dark:border-surface-800">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2" aria-label="StudyOS Home">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-surface-900 dark:text-surface-50">StudyOS</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
            collapsed && 'ml-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation" aria-label="Main">
        <div className="px-3 py-2 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          Core
        </div>
        {navigation.slice(0, 4).map((item) => (
          <NavLink
            key={item.key}
            to={item.href}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              isActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.label : undefined}
            aria-current={item.key === location.pathname.slice(1) || (item.key === 'dashboard' && location.pathname === '/') ? 'page' : undefined}
          >
            <item.icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} aria-hidden="true" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        <div className="px-3 py-2 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          Tools
        </div>
        {navigation.slice(4).map((item) => (
          <NavLink
            key={item.key}
            to={item.href}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              isActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.label : undefined}
            aria-current={item.key === location.pathname.slice(1) ? 'page' : undefined}
          >
            <item.icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} aria-hidden="true" />
            {!collapsed && (
              <>
                <span>{item.label}</span>
                {item.key === 'tasks' && badgeCount && (
                  <span className="ml-auto px-1.5 py-0.5 text-xs font-medium rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-4 border-t border-surface-200 dark:border-surface-800">
          <Link
            to="/focus"
            className={cn(
              'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Start Focus Session' : undefined}
          >
            <Target className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span>Start Focus Session</span>}
          </Link>
        </div>
      </nav>

      <div className="p-3 border-t border-surface-200 dark:border-surface-800">
        {!collapsed && (
          <div className="text-xs text-surface-500 dark:text-surface-400 text-center">
            v1.0.0 &middot; <span className="font-medium">StudyOS</span>
          </div>
        )}
      </div>
    </aside>
  );
}