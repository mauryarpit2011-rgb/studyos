import { useState, useEffect } from 'react';
import { cn } from '@/utils/helpers';
import { 
  Sun, Moon, Monitor, Bell, Palette, Database, Download, Upload, Trash2, 
  Shield, Key, Globe, Info, ChevronRight, Check, X
} from 'lucide-react';
import { Button, Input, Select, Card, CardContent, Modal, Avatar } from '@/components/ui';
import { useAppStore } from '@/store';
import { useTheme } from '@/hooks';
import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast';
import { exportData, importData, clearAllData } from '@/services/storage';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
] as const;

export function SettingsPage() {
  const { preferences, updatePreferences, courses, tasks, notes, folders, loadAllData } = useAppStore();
  const { theme, toggleTheme, setTheme, mounted } = useTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'focus' | 'notifications' | 'data' | 'about'>('appearance');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'focus', label: 'Focus Timer', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ] as const;

  const handleExport = async () => {
    setExporting(true);
    try {
      const json = await exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studyos-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess('Data exported successfully');
    } catch (error) {
      toastError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const text = await importFile.text();
      await importData(text);
      await loadAllData();
      toastSuccess('Data imported successfully');
      setImportFile(null);
    } catch (error) {
      toastError('Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      await loadAllData();
      toastSuccess('All data cleared');
      setShowClearConfirm(false);
    } catch (error) {
      toastError('Failed to clear data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Settings</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Customize your StudyOS experience</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="lg:w-56 flex-shrink-0 p-2">
          <nav className="space-y-1" role="navigation" aria-label="Settings categories">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        <div className="flex-1 space-y-6">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    Theme
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                    Choose your preferred color scheme. System setting follows your OS preference.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun, desc: 'Always light' },
                      { value: 'dark', label: 'Dark', icon: Moon, desc: 'Always dark' },
                      { value: 'system', label: 'System', icon: Monitor, desc: 'Follow OS' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          theme === option.value
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', theme === option.value ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-surface-100 dark:bg-surface-800')}>
                            <option.icon className={cn('w-5 h-5', theme === option.value ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500 dark:text-surface-400')} />
                          </div>
                          <div>
                            <p className="font-medium text-surface-900 dark:text-surface-50">{option.label}</p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">{option.desc}</p>
                          </div>
                        </div>
                        {theme === option.value && (
                          <Check className="w-5 h-5 text-brand-600 dark:text-brand-400 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-brand-500" />
                    Language & Region
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Language"
                      value={preferences.language}
                      onChange={(e) => updatePreferences({ language: e.target.value })}
                      options={languageOptions.map(o => ({ value: o.value, label: o.label }))}
                    />
                    <Select
                      label="Time Format"
                      value={preferences.timeFormat}
                      onChange={(e) => updatePreferences({ timeFormat: e.target.value as any })}
                      options={[
                        { value: '12h', label: '12 Hour (AM/PM)' },
                        { value: '24h', label: '24 Hour' },
                      ]}
                    />
                    <Select
                      label="Week Starts On"
                      value={preferences.weekStartsOn}
                      onChange={(e) => updatePreferences({ weekStartsOn: Number(e.target.value) as any })}
                      options={[
                        { value: '0', label: 'Sunday' },
                        { value: '1', label: 'Monday' },
                        { value: '6', label: 'Saturday' },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'focus' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-500" />
                    Pomodoro Durations
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <DurationSetting
                      label="Focus Time"
                      value={preferences.pomodoroWorkMinutes}
                      min={5}
                      max={60}
                      step={5}
                      icon={<Brain className="w-5 h-5" />}
                      color="text-blue-600"
                      onChange={(v) => updatePreferences({ pomodoroWorkMinutes: v })}
                    />
                    <DurationSetting
                      label="Short Break"
                      value={preferences.pomodoroShortBreakMinutes}
                      min={1}
                      max={30}
                      step={1}
                      icon={<Coffee className="w-5 h-5" />}
                      color="text-green-600"
                      onChange={(v) => updatePreferences({ pomodoroShortBreakMinutes: v })}
                    />
                    <DurationSetting
                      label="Long Break"
                      value={preferences.pomodoroLongBreakMinutes}
                      min={5}
                      max={60}
                      step={5}
                      icon={<RotateCcw className="w-5 h-5" />}
                      color="text-purple-600"
                      onChange={(v) => updatePreferences({ pomodoroLongBreakMinutes: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-surface-50">Sessions before long break</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">Number of focus sessions before a long break</p>
                    </div>
                    <Select
                      value={preferences.pomodoroSessionsBeforeLongBreak}
                      onChange={(e) => updatePreferences({ pomodoroSessionsBeforeLongBreak: Number(e.target.value) })}
                      options={[
                        { value: '2', label: '2 sessions' },
                        { value: '3', label: '3 sessions' },
                        { value: '4', label: '4 sessions' },
                        { value: '5', label: '5 sessions' },
                        { value: '6', label: '6 sessions' },
                      ]}
                      className="w-40"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-500" />
                    Automation
                  </h3>
                  <div className="space-y-4">
                    <ToggleSetting
                      label="Auto-start breaks"
                      description="Automatically start break timer after focus session completes"
                      checked={preferences.autoStartBreaks}
                      onChange={(v) => updatePreferences({ autoStartBreaks: v })}
                    />
                    <ToggleSetting
                      label="Auto-start focus"
                      description="Automatically start next focus session after break ends"
                      checked={preferences.autoStartWork}
                      onChange={(v) => updatePreferences({ autoStartWork: v })}
                    />
                    <ToggleSetting
                      label="Sound notifications"
                      description="Play sound when timer completes"
                      checked={preferences.soundEnabled}
                      onChange={(v) => updatePreferences({ soundEnabled: v })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-500" />
                    Daily Goal
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="30"
                      max="480"
                      step="15"
                      value={preferences.dailyGoalMinutes}
                      onChange={(e) => updatePreferences({ dailyGoalMinutes: Number(e.target.value) })}
                      className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none accent-brand-600"
                    />
                    <div className="text-right w-24">
                      <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                        {Math.floor(preferences.dailyGoalMinutes / 60)}h {preferences.dailyGoalMinutes % 60}m
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">Daily focus goal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardContent className="pt-6 pb-4 px-6">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-brand-500" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  <ToggleSetting
                    label="Enable notifications"
                    description="Receive browser notifications for reminders and timer completion"
                    checked={preferences.notificationsEnabled}
                    onChange={(v) => updatePreferences({ notificationsEnabled: v })}
                  />
                  <div className="text-sm text-surface-500 dark:text-surface-400">
                    <p>Notification permissions are managed by your browser.</p>
                    <button className="text-brand-600 dark:text-brand-400 hover:underline mt-1 inline-block">
                      Check browser settings
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-brand-500" />
                    Export Data
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                    Download a complete backup of all your tasks, notes, events, sessions, and settings.
                  </p>
                  <Button onClick={handleExport} disabled={exporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export All Data'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-brand-500" />
                    Import Data
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                    Restore your data from a previously exported backup file.
                  </p>
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                      <Button variant="secondary" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </label>
                    <Button 
                      onClick={handleImport} 
                      disabled={importing || !importFile}
                      variant="primary"
                    >
                      {importing ? 'Importing...' : 'Import'}
                    </Button>
                  </div>
                  {importFile && (
                    <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                      Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                    Permanently delete all your data. This action cannot be undone.
                  </p>
                  <Button variant="danger" onClick={() => setShowClearConfirm(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 pb-4 px-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-600 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">StudyOS</h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-1">Version 1.0.0</p>
                  <p className="mt-4 text-sm text-surface-600 dark:text-surface-400 max-w-md mx-auto">
                    A modern student productivity platform for managing studies, assignments, notes, schedules, and focus sessions.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                    <span>Built with React, TypeScript, Tailwind CSS</span>
                    <span>•</span>
                    <span>Data stored locally in IndexedDB</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Keyboard Shortcuts</h3>
                  <dl className="space-y-3 text-sm">
                    {[
                      ['⌘K', 'Open global search'],
                      ['⌘N', 'Create new task (from tasks page)'],
                      ['Space', 'Play/pause focus timer (when focused)'],
                      ['Esc', 'Close modals and dropdowns'],
                    ].map(([key, desc]) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                          <span className="text-surface-600 dark:text-surface-400">{desc}</span>
                          <kbd className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded text-xs font-mono text-surface-900 dark:text-surface-50">{key}</kbd>
                        </div>
                      ))}
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 pb-4 px-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Data Statistics</h3>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      ['Courses', courses.length],
                      ['Tasks', tasks.length],
                      ['Notes', notes.length],
                      ['Folders', folders.length],
                    ].map(([label, count]) => (
                        <div key={label} className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
                          <p className="text-surface-500 dark:text-surface-400">{label}</p>
                          <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{count}</p>
                        </div>
                      ))}
                  </dl>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All Data"
        message="This will permanently delete all your tasks, notes, events, sessions, courses, and settings. This action cannot be undone."
        onConfirm={handleClearAll}
        confirmText="Delete Everything"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

function DurationSetting({ label, value, min, max, step, icon: Icon, color, onChange }: any) {
  return (
    <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
      <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 mb-2">
        <Icon className={cn('w-4 h-4', color)} />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => onChange(Math.max(min, value - step))} className="w-8 h-8 p-0">
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-2xl font-bold text-surface-900 dark:text-surface-50 font-mono w-16 text-center">
          {value}min
        </span>
        <Button variant="ghost" size="sm" onClick={() => onChange(Math.min(max, value + step))} className="w-8 h-8 p-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-50">{label}</p>
        <p className="text-sm text-surface-500 dark:text-surface-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-brand-600' : 'bg-surface-300 dark:bg-surface-600'
        )}
        role="switch"
        aria-checked={checked}
      >
        <span className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  );
}