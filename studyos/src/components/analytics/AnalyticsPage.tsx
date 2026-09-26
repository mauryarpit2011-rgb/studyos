import { useMemo } from 'react';
import { cn } from '@/utils/helpers';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { Card } from '@/components/ui';
import { useAppStore } from '@/store';
import { formatDuration, getWeekStart, getWeekEnd } from '@/utils/helpers';
import type { Task, StudySession, FocusSession } from '@/types';

const COLORS = ['#0c8ce9', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#06b6d4', '#84cc16'];

export function AnalyticsPage() {
  const { tasks, studySessions, focusSessions, courses, preferences } = useAppStore();
  const allSessions = [...studySessions, ...focusSessions];

  const weeklyData = useMemo(() => {
    const weeks: { week: string; focusMinutes: number; sessions: number; tasksCompleted: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      const start = getWeekStart(date);
      const end = getWeekEnd(date);
      const weekSessions = allSessions.filter(s => {
        const d = new Date(s.startedAt);
        return d >= start && d <= end;
      });
      const weekTasks = tasks.filter(t => t.completedAt && new Date(t.completedAt) >= start && new Date(t.completedAt) <= end);
      weeks.push({
        week: `W${Math.ceil((date.getDate() + start.getDay()) / 7)}`,
        focusMinutes: weekSessions.reduce((sum, s) => sum + s.actualDuration, 0),
        sessions: weekSessions.length,
        tasksCompleted: weekTasks.length,
      });
    }
    return weeks;
  }, [allSessions, tasks]);

  const dailyData = useMemo(() => {
    const days: { day: string; focusMinutes: number; sessions: number; tasksCompleted: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const daySessions = allSessions.filter(s => {
        const d = new Date(s.startedAt);
        return d >= date && d < nextDay;
      });
      const dayTasks = tasks.filter(t => t.completedAt && new Date(t.completedAt) >= date && new Date(t.completedAt) < nextDay);
      days.push({
        day: date.toLocaleDateString(undefined, { weekday: 'short' }),
        focusMinutes: daySessions.reduce((sum, s) => sum + s.actualDuration, 0),
        sessions: daySessions.length,
        tasksCompleted: dayTasks.length,
      });
    }
    return days;
  }, [allSessions, tasks]);

  const categoryData = useMemo(() => {
    const courseMap = new Map<string, { minutes: number; color: string; name: string }>();
    courses.forEach(c => courseMap.set(c.id, { minutes: 0, color: c.color, name: c.name }));
    
    allSessions.forEach(s => {
      if (s.courseId && courseMap.has(s.courseId)) {
        const entry = courseMap.get(s.courseId)!;
        entry.minutes += s.actualDuration;
      }
    });

    return Array.from(courseMap.values())
      .filter(c => c.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6)
      .map((c, i) => ({ ...c, color: c.color || COLORS[i % COLORS.length] }));
  }, [allSessions, courses]);

  const priorityData = useMemo(() => {
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    return priorities.map((p, i) => ({
      priority: p,
      count: tasks.filter(t => t.priority === p && t.status !== 'completed').length,
      color: COLORS[i],
    })).filter(p => p.count > 0);
  }, [tasks]);

  const statusData = useMemo(() => {
    const statuses: { status: string; count: number; color: string }[] = [
      { status: 'Completed', count: tasks.filter(t => t.status === 'completed').length, color: '#22c55e' },
      { status: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: '#0c8ce9' },
      { status: 'Pending', count: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b' },
    ];
    return statuses.filter(s => s.count > 0);
  }, [tasks]);

  const totalFocusMinutes = allSessions.reduce((sum, s) => sum + s.actualDuration, 0);
  const totalSessions = allSessions.length;
  const avgSessionLength = totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
  const streak = calculateStreak([
    ...tasks.filter(t => t.completedAt).map(t => t.completedAt!),
    ...allSessions.map(s => s.startedAt),
  ]);

  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const goalProgress = Math.min(100, Math.round((totalFocusMinutes / preferences.dailyGoalMinutes) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Analytics</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Track your productivity and progress</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Focus Time" value={formatDuration(totalFocusMinutes)} icon="⏱" color="text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard label="Total Sessions" value={totalSessions.toString()} icon="🎯" color="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" />
        <StatCard label="Avg Session" value={formatDuration(avgSessionLength)} icon="📊" color="text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" />
        <StatCard label="Tasks Completed" value={completedTasks.toString()} icon="✅" color="text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Weekly Focus Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c8ce9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0c8ce9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="week" stroke="#71717a" fontSize={12} tickMargin={10} />
                <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => formatDuration(v)} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatDuration(value), 'Focus Time']}
                />
                <Area type="monotone" dataKey="focusMinutes" stroke="#0c8ce9" strokeWidth={2} fillOpacity={1} fill="url(#colorFocus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Daily Activity (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} tickFormatter={(v) => formatDuration(v)} />
                <YAxis dataKey="day" type="category" stroke="#71717a" fontSize={12} width={60} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatDuration(value), 'Focus Time']}
                />
                <Bar dataKey="focusMinutes" fill="#0c8ce9" radius={[0, 4, 4, 0]} maxBarSize={40} />
                <Bar dataKey="sessions" fill="#22c55e" radius={[0, 4, 4, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Focus by Course</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {categoryData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="minutes"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [formatDuration(value), 'Focus Time']}
                  />
                </PieChart>
              ) : (
                <div className="h-full flex items-center justify-center text-surface-500 dark:text-surface-400">
                  No course data available
                </div>
              )}
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categoryData.map((entry, index) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}: {formatDuration(entry.minutes)}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Task Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {statusData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.1)' }} />
                </PieChart>
              ) : (
                <div className="h-full flex items-center justify-center text-surface-500 dark:text-surface-400">
                  No task data
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Priority Breakdown</h3>
          <div className="space-y-4">
            {priorityData.map((p, i) => (
              <div key={p.priority} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="capitalize text-sm text-surface-700 dark:text-surface-300 w-20">{p.priority}</span>
                <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${tasks.length > 0 ? (p.count / tasks.length) * 100 : 0}%`, backgroundColor: p.color }} />
                </div>
                <span className="text-sm font-mono text-surface-600 dark:text-surface-400 w-16 text-right">{p.count}</span>
              </div>
            ))}
            {priorityData.length === 0 && <p className="text-surface-500 dark:text-surface-400 text-center py-8">No pending tasks</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Productivity Score</h3>
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" fill="none" stroke="#e4e4e7" strokeWidth="12" />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  strokeDasharray={503}
                  strokeDashoffset={503 * (1 - goalProgress / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold text-surface-900 dark:text-surface-50">{goalProgress}%</span>
                <span className="text-sm text-surface-500 dark:text-surface-400">Daily Goal</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{streak}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Day Streak</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{completionRate}%</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Completion Rate</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <th className="text-left p-3 font-medium text-surface-500 dark:text-surface-400">Date</th>
                <th className="text-left p-3 font-medium text-surface-500 dark:text-surface-400">Type</th>
                <th className="text-left p-3 font-medium text-surface-500 dark:text-surface-400">Details</th>
                <th className="text-right p-3 font-medium text-surface-500 dark:text-surface-400">Duration</th>
              </tr>
            </thead>
            <tbody>
              {allSessions
                .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
                .slice(0, 10)
                .map((s) => (
                  <tr key={s.id} className="border-b border-surface-100 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="p-3 text-surface-600 dark:text-surface-400">{new Date(s.startedAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs', 
                        s.type === 'focus' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' :
                        s.type === 'short_break' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      )}>
                        {s.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-surface-700 dark:text-surface-300">
                      {s.taskId ? `Task: ${tasks.find(t => t.id === s.taskId)?.title || 'Unknown'}` : 
                       s.courseId ? `Course: ${courses.find(c => c.id === s.courseId)?.name || 'Unknown'}` : 
                       'General focus'}
                    </td>
                    <td className="p-3 text-right font-mono text-surface-900 dark:text-surface-50">{formatDuration(s.actualDuration)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-50">{value}</p>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl', color)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sortedDates = [...dates].sort().reverse();
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - date.getTime()) / 86400000);
    if (diffDays === streak) streak++;
    else if (diffDays > streak) break;
  }
  return streak;
}