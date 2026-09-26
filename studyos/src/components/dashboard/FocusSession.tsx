import { useEffect, useState } from 'react';
import { cn } from '@/utils/helpers';
import { Play, Pause, RotateCcw, Target, Settings, X } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useAppStore } from '@/store';
import { useFocusTimer } from '@/hooks';
import { formatDuration } from '@/utils/helpers';
import type { SessionType } from '@/types';

export function FocusSession() {
  const { currentFocusSession, startFocusSession, endFocusSession, completeFocusSession, preferences } = useAppStore();
  const { session, timeRemaining, progress, formattedTime, isActive, sessionType } = useFocusTimer();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !currentFocusSession) {
      const saved = localStorage.getItem('studyos-last-focus-task');
      if (saved) {
        try {
          const { taskId, courseId } = JSON.parse(saved);
          // Could auto-resume here if desired
        } catch {}
      }
    }
  }, [currentFocusSession]);

  const handleStart = () => {
    startFocusSession();
  };

  const handlePause = () => {
    endFocusSession();
  };

  const handleComplete = () => {
    completeFocusSession();
  };

  const handleSkip = () => {
    endFocusSession();
  };

  const sessionLabels: Record<SessionType, string> = {
    focus: 'Focus',
    short_break: 'Short Break',
    long_break: 'Long Break',
  };

  const sessionIcons: Record<SessionType, React.ReactNode> = {
    focus: <Target className="w-5 h-5" />,
    short_break: <RotateCcw className="w-5 h-5" />,
    long_break: <RotateCcw className="w-5 h-5" />,
  };

  if (!isActive) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <Target className="w-10 h-10 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-1">Ready to focus?</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Start a Pomodoro session to boost your productivity</p>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Button onClick={handleStart} size="lg" className="min-w-[140px]">
              <Play className="w-5 h-5 mr-2" />
              Start Focus
            </Button>
            <Button variant="ghost" onClick={() => setShowSettings(true)}>
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                {preferences.pomodoroWorkMinutes}min
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Focus</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                {preferences.pomodoroShortBreakMinutes}min
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Short Break</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                {preferences.pomodoroLongBreakMinutes}min
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Long Break</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const colors: Record<SessionType, string> = {
    focus: 'bg-brand-600',
    short_break: 'bg-green-500',
    long_break: 'bg-purple-500',
  };

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brand-100 dark:bg-brand-900/20 blur-3xl" />
      
      <div className="relative flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-medium text-white',
            colors[sessionType]
          )}>
            {sessionLabels[sessionType]}
          </span>
          {session.sessionsCompleted > 0 && (
            <span className="px-2 py-1 text-xs text-surface-500 dark:text-surface-400">
              Session {session.sessionsCompleted} of {preferences.pomodoroSessionsBeforeLongBreak}
            </span>
          )}
        </div>

        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-surface-200 dark:text-surface-700"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={553}
              strokeDashoffset={553 * (1 - progress)}
              strokeLinecap="round"
              className={cn('transition-all duration-100 ease-linear', colors[sessionType])}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-mono font-bold text-surface-900 dark:text-surface-50">
                {formattedTime}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant={isActive ? 'secondary' : 'primary'}
            size="lg"
            onClick={isActive ? handlePause : handleStart}
            className="min-w-[120px]"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Resume
              </>
            )}
          </Button>
          
          {sessionType === 'focus' && (
            <Button variant="ghost" size="lg" onClick={handleComplete}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Complete
            </Button>
          )}

          <Button variant="ghost" size="lg" onClick={handleSkip}>
            <X className="w-5 h-5 mr-2" />
            Skip
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-800 w-full">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                {formatDuration(session?.totalFocusMinutes || 0)}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Total Focus</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                {session?.sessionsCompleted || 0}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                {preferences.pomodoroSessionsBeforeLongBreak - (session?.sessionsCompleted || 0) % preferences.pomodoroSessionsBeforeLongBreak}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Until Long Break</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}