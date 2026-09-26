import { cn } from '@/utils/helpers';
import { TrendingUp, Target, Clock, Flame } from 'lucide-react';
import { formatDuration } from '@/utils/helpers';

interface DashboardStatsProps {
  focusMinutes: number;
  sessions: number;
  tasksCompleted: number;
  streak: number;
  dailyGoal: number;
}

export function DashboardStats({ focusMinutes, sessions, tasksCompleted, streak, dailyGoal }: DashboardStatsProps) {
  const progress = Math.min(100, (focusMinutes / dailyGoal) * 100);

  const stats = [
    {
      label: 'Focus Time',
      value: formatDuration(focusMinutes),
      icon: Clock,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      trend: '+12% from yesterday',
      trendIcon: TrendingUp,
    },
    {
      label: 'Sessions',
      value: sessions.toString(),
      icon: Target,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      trend: '+3 from yesterday',
      trendIcon: TrendingUp,
    },
    {
      label: 'Tasks Done',
      value: tasksCompleted.toString(),
      icon: CheckSquare,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
      trend: '+5 from yesterday',
      trendIcon: TrendingUp,
    },
    {
      label: 'Streak',
      value: `${streak} days`,
      icon: Flame,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
      trend: streak > 0 ? 'Keep it up!' : 'Start today',
      trendIcon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            'card p-5 animate-slide-up',
            'transition-all duration-300 hover:shadow-elevated'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-50">{stat.value}</p>
              <p className="mt-1.5 text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
                <stat.trendIcon className="w-3 h-3" />
                {stat.trend}
              </p>
            </div>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          
          {index === 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 mb-1.5">
                <span>Daily Goal</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-500 ease-spring"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-surface-500 dark:text-surface-400">
                {formatDuration(focusMinutes)} / {formatDuration(dailyGoal)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import { CheckSquare } from 'lucide-react';