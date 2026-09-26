import { Link } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { CheckSquare, Plus, ChevronRight, MoreHorizontal, Clock, Flag } from 'lucide-react';
import { Button, Badge, PriorityBadge } from '@/components/ui';
import { useAppStore } from '@/store';
import { formatTime, isDueToday, isOverdue, getPriorityColor } from '@/utils/helpers';
import type { Task } from '@/types';

export function TodayTasks() {
  const { tasks, toggleTaskStatus, getUpcomingTasks, getOverdueTasks } = useAppStore();
  
  const todayTasks = tasks.filter(t => 
    t.status !== 'completed' && 
    t.dueDate && 
    (isDueToday(t.dueDate) || isOverdue(t.dueDate))
  ).sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }).slice(0, 5);

  const upcomingTasks = getUpcomingTasks(3).slice(0, 3);

  if (todayTasks.length === 0 && upcomingTasks.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <CheckSquare className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-1">No tasks for today</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4">Enjoy your free time or add a new task</p>
          <Button asChild>
            <Link to="/tasks?new=true">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Today's Tasks
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/tasks">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      
      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        {todayTasks.map((task, index) => (
          <TaskRow key={task.id} task={task} index={index} />
        ))}
        
        {upcomingTasks.length > 0 && (
          <>
            <div className="px-4 py-2 bg-surface-50 dark:bg-surface-800/50">
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                Upcoming
              </p>
            </div>
            {upcomingTasks.map((task, index) => (
              <TaskRow key={task.id} task={task} index={index} upcoming />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, upcoming = false }: { task: Task; upcoming?: boolean }) {
  const { toggleTaskStatus } = useAppStore();
  const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'completed';
  const dueToday = task.dueDate && isDueToday(task.dueDate);

  return (
    <div className={cn('p-4 flex items-center gap-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50', upcoming && 'opacity-70')}>
      <button
        onClick={() => toggleTaskStatus(task.id)}
        className={cn(
          'w-5 h-5 rounded border-2 flex-shrink-0 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          task.status === 'completed'
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-surface-300 dark:border-surface-600 hover:border-brand-500'
        )}
        aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
        aria-pressed={task.status === 'completed'}
      >
        {task.status === 'completed' && (
          <svg className="w-3 h-3 mx-auto my-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-surface-900 dark:text-surface-50 truncate',
          task.status === 'completed' && 'line-through text-surface-400 dark:text-surface-500'
        )}>
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
          {task.courseId && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              Course
            </span>
          )}
          {task.dueDate && (
            <span className={cn('flex items-center gap-1', overdue && 'text-red-500', dueToday && 'text-brand-600')}>
              <Clock className="w-3 h-3" />
              {overdue ? 'Overdue' : dueToday ? `Due ${formatTime(task.dueDate)}` : formatTime(task.dueDate)}
            </span>
          )}
          <PriorityBadge priority={task.priority} size="sm" />
        </div>
      </div>
      
      <button className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" aria-label="More options">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}