export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';
export type NoteType = 'text' | 'markdown' | 'checklist';
export type SessionType = 'focus' | 'short_break' | 'long_break';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task extends BaseEntity {
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  courseId: string | null;
  estimatedMinutes: number;
  actualMinutes: number;
  tags: string[];
  recurringRule: RecurringRule | null;
  completedAt: string | null;
}

export interface RecurringRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
}

export interface Course extends BaseEntity {
  name: string;
  code: string;
  color: string;
  instructor: string;
  semester: string;
}

export interface Note extends BaseEntity {
  title: string;
  content: string;
  type: NoteType;
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  wordCount: number;
}

export interface Folder extends BaseEntity {
  name: string;
  parentId: string | null;
  color: string;
  icon: string;
}

export interface StudySession extends BaseEntity {
  type: SessionType;
  plannedDuration: number;
  actualDuration: number;
  taskId: string | null;
  courseId: string | null;
  startedAt: string;
  endedAt: string | null;
  isCompleted: boolean;
  interruptions: number;
}

export interface FocusSession extends BaseEntity {
  taskId: string | null;
  courseId: string | null;
  plannedMinutes: number;
  actualMinutes: number;
  sessionsCompleted: number;
  totalFocusMinutes: number;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  currentSessionType: SessionType;
  currentSessionEndTime: string | null;
}

export interface ScheduleEvent extends BaseEntity {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  courseId: string | null;
  location: string;
  recurrence: RecurringRule | null;
  color: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  pomodoroWorkMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroSessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  dailyGoalMinutes: number;
  weekStartsOn: 0 | 1 | 6;
  timeFormat: '12h' | '24h';
  language: string;
}

export interface AnalyticsData {
  totalFocusMinutes: number;
  totalSessions: number;
  averageSessionLength: number;
  completedTasks: number;
  streakDays: number;
  weeklyData: WeeklyDataPoint[];
  monthlyData: MonthlyDataPoint[];
  categoryBreakdown: CategoryDataPoint[];
  priorityBreakdown: PriorityDataPoint[];
}

export interface WeeklyDataPoint {
  date: string;
  focusMinutes: number;
  sessions: number;
  tasksCompleted: number;
}

export interface MonthlyDataPoint {
  month: string;
  focusMinutes: number;
  sessions: number;
  tasksCompleted: number;
}

export interface CategoryDataPoint {
  category: string;
  minutes: number;
  color: string;
}

export interface PriorityDataPoint {
  priority: Priority;
  count: number;
}

export interface SearchResult {
  type: 'task' | 'note' | 'event' | 'course';
  id: string;
  title: string;
  description: string;
  date: string;
  relevance: number;
}

export interface AppState {
  tasks: Task[];
  courses: Course[];
  notes: Note[];
  folders: Folder[];
  studySessions: StudySession[];
  focusSessions: FocusSession[];
  scheduleEvents: ScheduleEvent[];
  preferences: UserPreferences;
  currentFocusSession: FocusSession | null;
}