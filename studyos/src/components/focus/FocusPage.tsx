import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/helpers';
import { Play, Pause, RotateCcw, Target, Settings, X, Plus, Minus, Clock, CheckCircle, Coffee, Brain } from 'lucide-react';
import { Button, Card, Input, Select } from '@/components/ui';
import { useAppStore } from '@/store';
import { formatDuration } from '@/utils/helpers';
import type { SessionType } from '@/types';

const sessionLabels: Record<SessionType, string> = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
};

const sessionIcons: Record<SessionType, React.ReactNode> = {
  focus: <Brain className="w-6 h-6" />,
  short_break: <Coffee className="w-6 h-6" />,
  long_break: <RotateCcw className="w-6 h-6" />,
};

const sessionColors: Record<SessionType, string> = {
  focus: 'bg-brand-600',
  short_break: 'bg-green-500',
  long_break: 'bg-purple-500',
};

const sessionBgColors: Record<SessionType, string> = {
  focus: 'bg-brand-100 dark:bg-brand-900/30',
  short_break: 'bg-green-100 dark:bg-green-900/30',
  long_break: 'bg-purple-100 dark:bg-purple-900/30',
};

export function FocusPage() {
  const { 
    currentFocusSession, 
    startFocusSession, 
    endFocusSession, 
    completeFocusSession, 
    preferences,
    tasks,
    courses,
    focusSessions,
  } = useAppStore();
  
  const { session, timeRemaining, progress, formattedTime, isActive, sessionType } = useFocusTimer();
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (preferences.soundEnabled) {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
      audioRef.current.volume = 0.5;
    }
  }, [preferences.soundEnabled]);

  const playSound = () => {
    if (audioRef.current && preferences.soundEnabled) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleStart = () => {
    startFocusSession(selectedTaskId || undefined, selectedCourseId || undefined);
    setShowTaskPicker(false);
    selectedTaskId && localStorage.setItem('studyos-last-focus-task', JSON.stringify({ taskId: selectedTaskId, courseId: selectedCourseId }));
  };

  const handlePause = () => {
    endFocusSession();
    playSound();
  };

  const handleComplete = () => {
    completeFocusSession();
    playSound();
  };

  const handleSkip = () => {
    endFocusSession();
  };

  const adjustTime = (minutes: number) => {
    if (session && !isActive) {
      const newEndTime = new Date(Date.now() + minutes * 60000).toISOString();
      useAppStore.getState().updateFocusSession(session.id, {
        plannedMinutes: minutes,
        currentSessionEndTime: newEndTime,
      });
    }
  };

  const completedSessions = focusSessions.filter(s => s.isCompleted).length;
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.totalFocusMinutes, 0);
  const todayFocusMinutes = focusSessions
    .filter(s => new Date(s.startedAt).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.totalFocusMinutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Focus Timer</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Pomodoro sessions for deep work</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand-100 dark:bg-brand-900/20 blur-3xl" />
            
            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-6">
                <span className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium text-white',
                  sessionColors[sessionType]
                )}>
                  {sessionLabels[sessionType]}
                </span>
                {session && session.sessionsCompleted > 0 && (
                  <span className="px-3 py-1.5 text-sm text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 rounded-full">
                    Session {session.sessionsCompleted} of {preferences.pomodoroSessionsBeforeLongBreak}
                  </span>
                )}
              </div>

              <div className="relative w-64 h-64 mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="118"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-surface-200 dark:text-surface-700"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="118"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={741}
                    strokeDashoffset={741 * (1 - progress)}
                    strokeLinecap="round"
                    className={cn('transition-all duration-100 ease-linear', sessionColors[sessionType])}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl md:text-7xl font-mono font-bold text-surface-900 dark:text-surface-50">
                      {formattedTime}
                    </p>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">
                      {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  variant={isActive ? 'secondary' : 'primary'}
                  size="lg"
                  onClick={isActive ? handlePause : handleStart}
                  className="min-w-[140px]"
                  disabled={!isActive && !selectedTaskId && !showTaskPicker}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-6 h-6 mr-2" />
                      Pause
                    </>
                  ) : selectedTaskId ? (
                    <>
                      <Play className="w-6 h-6 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 mr-2" />
                      Start Session
                    </>
                  )}
                </Button>
                
                {sessionType === 'focus' && isActive && (
                  <Button variant="secondary" size="lg" onClick={handleComplete} className="min-w-[140px]">
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Complete
                  </Button>
                )}

                <Button variant="ghost" size="lg" onClick={handleSkip} className="min-w-[120px]">
                  <X className="w-6 h-6 mr-2" />
                  Skip
                </Button>
              </div>

              {selectedTaskId && !isActive && (
                <div className="mt-6 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Ready to start: {tasks.find(t => t.id === selectedTaskId)?.title}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedTaskId(null); setShowTaskPicker(true); }} className="mt-2">
                    Change task
                  </Button>
                </div>
              )}

              {!selectedTaskId && !isActive && (
                <Button variant="secondary" className="mt-6" onClick={() => setShowTaskPicker(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Select Task
                </Button>
              )}

              <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-800 w-full max-w-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-surface-900 dark:text-surface-50">
                      {formatDuration(totalFocusMinutes)}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Total Focus</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-surface-900 dark:text-surface-50">
                      {completedSessions}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Sessions</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-surface-900 dark:text-surface-50">
                      {formatDuration(todayFocusMinutes)}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Today</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              Session History
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {focusSessions.slice(0, 10).map((fs) => (
                <div key={fs.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', sessionBgColors[fs.currentSessionType])}>
                      {sessionIcons[fs.currentSessionType]}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900 dark:text-surface-50">
                        {sessionLabels[fs.currentSessionType]}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        {formatDuration(fs.actualMinutes)} • {new Date(fs.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    fs.isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    fs.isActive ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' :
                    'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400'
                  )}>
                    {fs.isCompleted ? 'Completed' : fs.isActive ? 'Active' : 'Incomplete'}
                  </span>
                </div>
              ))}
              {focusSessions.length === 0 && (
                <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No sessions yet. Start your first focus session!</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              Quick Timer
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Quick Focus', minutes: 15, icon: <Brain className="w-4 h-4" /> },
                { label: 'Standard', minutes: 25, icon: <Target className="w-4 h-4" /> },
                { label: 'Deep Work', minutes: 50, icon: <Brain className="w-4 h-4" /> },
                { label: 'Short Break', minutes: 5, icon: <Coffee className="w-4 h-4" /> },
                { label: 'Long Break', minutes: 15, icon: <RotateCcw className="w-4 h-4" /> },
              ].map(preset => (
                <Button
                  key={preset.minutes}
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedTaskId(null);
                    setSelectedCourseId(null);
                    adjustTime(preset.minutes);
                    handleStart();
                  }}
                  disabled={isActive}
                >
                  {preset.icon}
                  <span className="flex-1 text-left">{preset.label}</span>
                  <span className="text-sm font-mono">{preset.minutes}min</span>
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              Timer Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Focus Duration: {preferences.pomodoroWorkMinutes} min
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={preferences.pomodoroWorkMinutes}
                    onChange={(e) => useAppStore.getState().updatePreferences({ pomodoroWorkMinutes: Number(e.target.value) })}
                    className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none accent-brand-600"
                  />
                  <span className="text-sm font-mono text-surface-600 dark:text-surface-400 w-12">
                    {preferences.pomodoroWorkMinutes}min
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Short Break: {preferences.pomodoroShortBreakMinutes} min
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={preferences.pomodoroShortBreakMinutes}
                    onChange={(e) => useAppStore.getState().updatePreferences({ pomodoroShortBreakMinutes: Number(e.target.value) })}
                    className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none accent-green-500"
                  />
                  <span className="text-sm font-mono text-surface-600 dark:text-surface-400 w-12">
                    {preferences.pomodoroShortBreakMinutes}min
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Long Break: {preferences.pomodoroLongBreakMinutes} min
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={preferences.pomodoroLongBreakMinutes}
                    onChange={(e) => useAppStore.getState().updatePreferences({ pomodoroLongBreakMinutes: Number(e.target.value) })}
                    className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none accent-purple-500"
                  />
                  <span className="text-sm font-mono text-surface-600 dark:text-surface-400 w-12">
                    {preferences.pomodoroLongBreakMinutes}min
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Sessions before long break: {preferences.pomodoroSessionsBeforeLongBreak}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={preferences.pomodoroSessionsBeforeLongBreak}
                    onChange={(e) => useAppStore.getState().updatePreferences({ pomodoroSessionsBeforeLongBreak: Number(e.target.value) })}
                    className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none accent-brand-600"
                  />
                  <span className="text-sm font-mono text-surface-600 dark:text-surface-400 w-12">
                    {preferences.pomodoroSessionsBeforeLongBreak}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-700 dark:text-surface-300">Auto-start breaks</span>
                <button
                  onClick={() => useAppStore.getState().updatePreferences({ autoStartBreaks: !preferences.autoStartBreaks })}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    preferences.autoStartBreaks ? 'bg-brand-600' : 'bg-surface-300 dark:bg-surface-600'
                  )}
                  role="switch"
                  aria-checked={preferences.autoStartBreaks}
                >
                  <span className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                    preferences.autoStartBreaks ? 'translate-x-5' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-700 dark:text-surface-300">Sound notifications</span>
                <button
                  onClick={() => useAppStore.getState().updatePreferences({ soundEnabled: !preferences.soundEnabled })}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    preferences.soundEnabled ? 'bg-brand-600' : 'bg-surface-300 dark:bg-surface-600'
                  )}
                  role="switch"
                  aria-checked={preferences.soundEnabled}
                >
                  <span className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                    preferences.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}