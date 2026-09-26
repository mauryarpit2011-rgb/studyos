import { Link } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { Calendar, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button, Badge, PriorityBadge } from '@/components/ui';
import { useAppStore } from '@/store';
import { formatDate, formatRelativeTime, isOverdue, isDueToday } from '@/utils/helpers';
import type { Task } from '@/types';

export function UpcomingDeadlines() {
  const { tasks, getUpcomingTasks } = useAppStore();
  
  const upcoming = getUpcomingTasks(14)
    .filter(t => t.dueDate)
    .slice(0, 6);

  if (upcoming.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-1">No upcoming deadlines</h3>
          <p className="text-surface-500 dark:text-surface-400">You're all caught up!</p>
        </div>
      </div>
    );
  }

  const grouped = upcoming.reduce((acc, task) => {
    const date = task.dueDate ? formatDate(task.dueDate) : 'No date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="card">
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Upcoming Deadlines
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/tasks?filter=upcoming">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      
      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        {Object.entries(grouped).map(([date, dayTasks]) => (
          <div key={date} className="p-4">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
              {date}
            </p>
            <div className="space-y-2">
              {dayTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-colors',
                    'hover:bg-surface-50 dark:hover:bg-surface-800/50',
                    isOverdue(task.dueDate!) && 'bg-red-50 dark:bg-red-900/10'
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0 mt-1.5',
                    isOverdue(task.dueDate!) ? 'bg-red-500' : 
                    isDueToday(task.dueDate!) ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-600'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium text-surface-900 dark:text-surface-50 truncate',
                      isOverdue(task.dueDate!) && 'text-red-600 dark:text-red-400'
                    )}>
                      {task.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                      {task.dueDate && (
                        <span className={cn('flex items-center gap-1', isOverdue(task.dueDate) && 'text-red-500', isDueToday(task.dueDate) && 'text-brand-600')}>
                          <Calendar className="w-3 h-3" />
                          {formatRelativeTime(task.dueDate)}
                        </span>
                      )}
                      <PriorityBadge priority={task.priority} size="sm" />
                    </div>
                  </div>
                  {isOverdue(task.dueDate!) && (
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" aria-label="Overdue" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}