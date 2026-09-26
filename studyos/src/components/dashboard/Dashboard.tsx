import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { Plus, ArrowRight, Target, TrendingUp } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { Greeting } from './Greeting';
import { TodayTasks } from './TodayTasks';
import { UpcomingDeadlines } from './UpcomingDeadlines';
import { FocusSession } from './FocusSession';
import { RecentNotes } from './RecentNotes';
import { DashboardStats } from './DashboardStats';
import { useAppStore } from '@/store';
import { calculateStreak } from '@/utils/helpers';

export function Dashboard() {
  const { tasks, studySessions, focusSessions, notes, preferences, loadAllData } = useAppStore();
  
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const completedToday = tasks.filter(t => 
    t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length;

  const focusMinutesToday = [...studySessions, ...focusSessions]
    .filter(s => new Date(s.startedAt).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.actualDuration, 0);

  const sessionsToday = [...studySessions, ...focusSessions]
    .filter(s => new Date(s.startedAt).toDateString() === new Date().toDateString()).length;

  const streak = calculateStreak(
    [...tasks.filter(t => t.completedAt).map(t => t.completedAt!),
    ...studySessions.map(s => s.startedAt),
    ...focusSessions.map(s => s.startedAt)]
  );

  return (
    <div className="space-y-6 animate-in">
      <Greeting />
      
      <DashboardStats
        focusMinutes={focusMinutesToday}
        sessions={sessionsToday}
        tasksCompleted={completedToday}
        streak={streak}
        dailyGoal={preferences.dailyGoalMinutes}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodayTasks />
          <FocusSession />
        </div>
        
        <div className="space-y-6">
          <UpcomingDeadlines />
          <RecentNotes />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Quick Actions</p>
              <p className="text-surface-900 dark:text-surface-50 mt-1">Start something new</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <Plus className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          </CardContent>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild variant="secondary" size="sm" className="h-auto py-3">
              <Link to="/tasks?new=true">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-5 h-5">✓</span>
                  <span className="text-xs">New Task</span>
                </div>
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="h-auto py-3">
              <Link to="/notes?new=true">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-5 h-5">📝</span>
                  <span className="text-xs">New Note</span>
                </div>
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="h-auto py-3">
              <Link to="/planner?new=true">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-5 h-5">📅</span>
                  <span className="text-xs">Schedule</span>
                </div>
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="h-auto py-3">
              <Link to="/focus">
                <div className="flex flex-col items-center gap-1">
                  <Target className="w-5 h-5" />
                  <span className="text-xs">Focus</span>
                </div>
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Weekly Progress</p>
              <p className="text-surface-900 dark:text-surface-50 mt-1">Track your momentum</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
          <div className="mt-4 space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const date = new Date();
              date.setDate(date.getDate() - date.getDay() + i);
              const daySessions = [...studySessions, ...focusSessions].filter(s => 
                new Date(s.startedAt).toDateString() === date.toDateString()
              );
              const minutes = daySessions.reduce((sum, s) => sum + s.actualDuration, 0);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={day} className="flex items-center justify-between">
                  <span className={cn('text-sm font-medium', isToday && 'text-brand-600 dark:text-brand-400')}>
                    {day}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', isToday ? 'bg-brand-600' : 'bg-surface-400 dark:bg-surface-500')}
                        style={{ width: `${Math.min(100, (minutes / 60) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-surface-500 dark:text-surface-400 w-16 text-right">
                      {minutes > 0 ? `${Math.floor(minutes/60)}h${minutes%60}m` : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Study Streak</p>
              <p className="text-surface-900 dark:text-surface-50 mt-1">Keep the chain going</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </CardContent>
          <div className="mt-4 text-center">
            <p className="text-4xl font-bold text-surface-900 dark:text-surface-50">{streak}</p>
            <p className="text-surface-500 dark:text-surface-400">day streak</p>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              {streak > 0 
                ? 'Amazing consistency! Keep it up.'
                : 'Start your first session today to begin your streak.'}
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/focus">
                <Target className="w-4 h-4 mr-2" />
                Start Session
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}