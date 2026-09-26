import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Task, Course, Note, Folder, StudySession, FocusSession,
  ScheduleEvent, UserPreferences, SearchResult,
  Priority, TaskStatus, NoteType, SessionType
} from '@/types';
import { generateId } from '@/utils/helpers';
import * as storage from '@/services/storage';

interface AppStore {
  tasks: Task[];
  courses: Course[];
  notes: Note[];
  folders: Folder[];
  studySessions: StudySession[];
  focusSessions: FocusSession[];
  scheduleEvents: ScheduleEvent[];
  preferences: UserPreferences;
  currentFocusSession: FocusSession | null;
  isLoading: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  
  setLoading: (loading: boolean) => void;
  
  loadAllData: () => Promise<void>;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Course>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Folder>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  
  addStudySession: (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StudySession>;
  updateStudySession: (id: string, updates: Partial<StudySession>) => Promise<void>;
  
  addFocusSession: (session: Omit<FocusSession, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FocusSession>;
  updateFocusSession: (id: string, updates: Partial<FocusSession>) => Promise<void>;
  setCurrentFocusSession: (session: FocusSession | null) => void;
  startFocusSession: (taskId?: string, courseId?: string, plannedMinutes?: number) => Promise<FocusSession>;
  endFocusSession: () => Promise<void>;
  completeFocusSession: () => Promise<void>;
  
  addScheduleEvent: (event: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ScheduleEvent>;
  updateScheduleEvent: (id: string, updates: Partial<ScheduleEvent>) => Promise<void>;
  deleteScheduleEvent: (id: string) => Promise<void>;
  
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  
  setSearchQuery: (query: string) => void;
  performSearch: () => Promise<void>;
  
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  
  getTasksByCourse: (courseId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getNotesByFolder: (folderId: string | null) => Note[];
  getUpcomingTasks: (days?: number) => Task[];
  getOverdueTasks: () => Task[];
  getTodaysSchedule: () => ScheduleEvent[];
  getWeeklyStats: () => { focusMinutes: number; sessions: number; tasksCompleted: number };
}

const now = () => new Date().toISOString();

const createEntity = <T extends { id: string; createdAt: string; updatedAt: string }>(
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): T => ({
  ...data,
  id: generateId(),
  createdAt: now(),
  updatedAt: now(),
} as T);

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      courses: [],
      notes: [],
      folders: [],
      studySessions: [],
      focusSessions: [],
      scheduleEvents: [],
      preferences: {
        theme: 'system',
        pomodoroWorkMinutes: 25,
        pomodoroShortBreakMinutes: 5,
        pomodoroLongBreakMinutes: 15,
        pomodoroSessionsBeforeLongBreak: 4,
        autoStartBreaks: false,
        autoStartWork: false,
        soundEnabled: true,
        notificationsEnabled: true,
        dailyGoalMinutes: 120,
        weekStartsOn: 0,
        timeFormat: '24h',
        language: 'en',
      },
      currentFocusSession: null,
      isLoading: true,
      searchQuery: '',
      searchResults: [],

      setLoading: (loading) => set({ isLoading: loading }),

      loadAllData: async () => {
        set({ isLoading: true });
        try {
          const [
            tasks, courses, notes, folders,
            studySessions, focusSessions, scheduleEvents, preferences
          ] = await Promise.all([
            storage.getAllTasks(),
            storage.getAllCourses(),
            storage.getAllNotes(),
            storage.getAllFolders(),
            storage.getAllStudySessions(),
            storage.getAllFocusSessions(),
            storage.getAllScheduleEvents(),
            storage.getPreferences(),
          ]);
          
          set({
            tasks,
            courses,
            notes,
            folders,
            studySessions,
            focusSessions,
            scheduleEvents,
            preferences,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to load data:', error);
          set({ isLoading: false });
        }
      },

      addTask: async (taskData) => {
        const task = createEntity<Task>(taskData);
        set((state) => ({ tasks: [task, ...state.tasks] }));
        await storage.saveTask(task);
        return task;
      },

      updateTask: async (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: now() } : t
          ),
        }));
        const task = get().tasks.find((t) => t.id === id);
        if (task) await storage.saveTask(task);
      },

      deleteTask: async (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        await storage.deleteTask(id);
      },

      toggleTaskStatus: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
        await get().updateTask(id, {
          status: newStatus,
          completedAt: newStatus === 'completed' ? now() : null,
        });
      },

      addCourse: async (courseData) => {
        const course = createEntity<Course>(courseData);
        set((state) => ({ courses: [course, ...state.courses] }));
        await storage.saveCourse(course);
        return course;
      },

      updateCourse: async (id, updates) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: now() } : c
          ),
        }));
        const course = get().courses.find((c) => c.id === id);
        if (course) await storage.saveCourse(course);
      },

      deleteCourse: async (id) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          tasks: state.tasks.map((t) => (t.courseId === id ? { ...t, courseId: null } : t)),
        }));
        await storage.deleteCourse(id);
      },

      addNote: async (noteData) => {
        const wordCount = noteData.content.trim().split(/\s+/).filter(Boolean).length;
        const note = createEntity<Note>({ ...noteData, wordCount });
        set((state) => ({ notes: [note, ...state.notes] }));
        await storage.saveNote(note);
        return note;
      },

      updateNote: async (id, updates) => {
        const note = get().notes.find((n) => n.id === id);
        const wordCount = updates.content
          ? updates.content.trim().split(/\s+/).filter(Boolean).length
          : note?.wordCount || 0;
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, wordCount, updatedAt: now() } : n
          ),
        }));
        const updatedNote = get().notes.find((n) => n.id === id);
        if (updatedNote) await storage.saveNote(updatedNote);
      },

      deleteNote: async (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
        await storage.deleteNote(id);
      },

      togglePinNote: async (id) => {
        const note = get().notes.find((n) => n.id === id);
        if (!note) return;
        await get().updateNote(id, { isPinned: !note.isPinned });
      },

      addFolder: async (folderData) => {
        const folder = createEntity<Folder>(folderData);
        set((state) => ({ folders: [folder, ...state.folders] }));
        await storage.saveFolder(folder);
        return folder;
      },

      updateFolder: async (id, updates) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: now() } : f
          ),
        }));
        const folder = get().folders.find((f) => f.id === id);
        if (folder) await storage.saveFolder(folder);
      },

      deleteFolder: async (id) => {
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          notes: state.notes.map((n) => (n.folderId === id ? { ...n, folderId: null } : n)),
        }));
        await storage.deleteFolder(id);
      },

      addStudySession: async (sessionData) => {
        const session = createEntity<StudySession>(sessionData);
        set((state) => ({ studySessions: [session, ...state.studySessions] }));
        await storage.saveStudySession(session);
        return session;
      },

      updateStudySession: async (id, updates) => {
        set((state) => ({
          studySessions: state.studySessions.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: now() } : s
          ),
        }));
        const session = get().studySessions.find((s) => s.id === id);
        if (session) await storage.saveStudySession(session);
      },

      addFocusSession: async (sessionData) => {
        const session = createEntity<FocusSession>(sessionData);
        set((state) => ({ focusSessions: [session, ...state.focusSessions] }));
        await storage.saveFocusSession(session);
        return session;
      },

      updateFocusSession: async (id, updates) => {
        set((state) => ({
          focusSessions: state.focusSessions.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: now() } : s
          ),
          currentFocusSession:
            state.currentFocusSession?.id === id
              ? { ...state.currentFocusSession, ...updates }
              : state.currentFocusSession,
        }));
        const session = get().focusSessions.find((s) => s.id === id);
        if (session) await storage.saveFocusSession(session);
      },

      setCurrentFocusSession: (session) => set({ currentFocusSession: session }),

      startFocusSession: async (taskId, courseId, plannedMinutes) => {
        const prefs = get().preferences;
        const workMinutes = plannedMinutes || prefs.pomodoroWorkMinutes;
        const endTime = new Date(Date.now() + workMinutes * 60000).toISOString();
        
        const session: FocusSession = {
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
          taskId: taskId || null,
          courseId: courseId || null,
          plannedMinutes: workMinutes,
          actualMinutes: 0,
          sessionsCompleted: 0,
          totalFocusMinutes: 0,
          startedAt: now(),
          endedAt: null,
          isActive: true,
          currentSessionType: 'focus',
          currentSessionEndTime: endTime,
        };
        
        set({ currentFocusSession: session, focusSessions: [session, ...get().focusSessions] });
        await storage.saveFocusSession(session);
        return session;
      },

      endFocusSession: async () => {
        const session = get().currentFocusSession;
        if (!session) return;
        
        const endedAt = now();
        const actualMinutes = Math.round((new Date(endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000);
        
        await get().updateFocusSession(session.id, {
          isActive: false,
          endedAt,
          actualMinutes,
          totalFocusMinutes: session.totalFocusMinutes + actualMinutes,
        });
        
        set({ currentFocusSession: null });
      },

      completeFocusSession: async () => {
        const session = get().currentFocusSession;
        if (!session) return;
        
        const prefs = get().preferences;
        const isLongBreak = (session.sessionsCompleted + 1) % prefs.pomodoroSessionsBeforeLongBreak === 0;
        const breakMinutes = isLongBreak ? prefs.pomodoroLongBreakMinutes : prefs.pomodoroShortBreakMinutes;
        
        const endedAt = now();
        const actualMinutes = session.plannedMinutes;
        
        await get().updateFocusSession(session.id, {
          isActive: false,
          endedAt,
          actualMinutes,
          sessionsCompleted: session.sessionsCompleted + 1,
          totalFocusMinutes: session.totalFocusMinutes + actualMinutes,
        });
        
        if (prefs.autoStartBreaks) {
          const breakEndTime = new Date(Date.now() + breakMinutes * 60000).toISOString();
          const breakSession: FocusSession = {
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
            taskId: session.taskId,
            courseId: session.courseId,
            plannedMinutes: breakMinutes,
            actualMinutes: 0,
            sessionsCompleted: session.sessionsCompleted,
            totalFocusMinutes: session.totalFocusMinutes + actualMinutes,
            startedAt: now(),
            endedAt: null,
            isActive: true,
            currentSessionType: isLongBreak ? 'long_break' : 'short_break',
            currentSessionEndTime: breakEndTime,
          };
          set({ currentFocusSession: breakSession, focusSessions: [breakSession, ...get().focusSessions] });
          await storage.saveFocusSession(breakSession);
        } else {
          set({ currentFocusSession: null });
        }
      },

      addScheduleEvent: async (eventData) => {
        const event = createEntity<ScheduleEvent>(eventData);
        set((state) => ({ scheduleEvents: [event, ...state.scheduleEvents] }));
        await storage.saveScheduleEvent(event);
        return event;
      },

      updateScheduleEvent: async (id, updates) => {
        set((state) => ({
          scheduleEvents: state.scheduleEvents.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: now() } : e
          ),
        }));
        const event = get().scheduleEvents.find((e) => e.id === id);
        if (event) await storage.saveScheduleEvent(event);
      },

      deleteScheduleEvent: async (id) => {
        set((state) => ({ scheduleEvents: state.scheduleEvents.filter((e) => e.id !== id) }));
        await storage.deleteScheduleEvent(id);
      },

      updatePreferences: async (prefs) => {
        const updated = await storage.savePreferences(prefs);
        set({ preferences: updated });
        
        if (prefs.theme) {
          document.documentElement.classList.toggle('dark', updated.theme === 'dark' || 
            (updated.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      performSearch: async () => {
        const { searchQuery, tasks, notes, scheduleEvents, courses } = get();
        if (!searchQuery.trim()) {
          set({ searchResults: [] });
          return;
        }
        
        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];
        
        tasks.forEach((task) => {
          if (task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)) {
            results.push({
              type: 'task',
              id: task.id,
              title: task.title,
              description: task.description || 'No description',
              date: task.dueDate || task.createdAt,
              relevance: task.title.toLowerCase().includes(query) ? 10 : 5,
            });
          }
        });
        
        notes.forEach((note) => {
          if (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) {
            results.push({
              type: 'note',
              id: note.id,
              title: note.title,
              description: note.content.slice(0, 100),
              date: note.updatedAt,
              relevance: note.title.toLowerCase().includes(query) ? 10 : 5,
            });
          }
        });
        
        scheduleEvents.forEach((event) => {
          if (event.title.toLowerCase().includes(query) || event.description.toLowerCase().includes(query)) {
            results.push({
              type: 'event',
              id: event.id,
              title: event.title,
              description: event.description || 'No description',
              date: event.startTime,
              relevance: event.title.toLowerCase().includes(query) ? 10 : 5,
            });
          }
        });
        
        courses.forEach((course) => {
          if (course.name.toLowerCase().includes(query) || course.code.toLowerCase().includes(query)) {
            results.push({
              type: 'course',
              id: course.id,
              title: course.name,
              description: `${course.code} • ${course.instructor}`,
              date: course.createdAt,
              relevance: course.name.toLowerCase().includes(query) ? 10 : 5,
            });
          }
        });
        
        results.sort((a, b) => b.relevance - a.relevance);
        set({ searchResults: results.slice(0, 20) });
      },

      exportData: async () => {
        return storage.exportData();
      },

      importData: async (json) => {
        await storage.importData(json);
        await get().loadAllData();
      },

      clearAllData: async () => {
        await storage.clearAllData();
        set({
          tasks: [],
          courses: [],
          notes: [],
          folders: [],
          studySessions: [],
          focusSessions: [],
          scheduleEvents: [],
          currentFocusSession: null,
          searchResults: [],
        });
      },

      getTasksByCourse: (courseId) => get().tasks.filter((t) => t.courseId === courseId),
      getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
      getNotesByFolder: (folderId) => get().notes.filter((n) => n.folderId === folderId),
      getUpcomingTasks: (days = 7) => {
        const now = new Date();
        const future = new Date(now.getTime() + days * 86400000);
        return get().tasks
          .filter((t) => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= future && t.status !== 'completed')
          .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
      },
      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed');
      },
      getTodaysSchedule: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return get().scheduleEvents
          .filter((e) => new Date(e.startTime) >= today && new Date(e.startTime) < tomorrow)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      },
      getWeeklyStats: () => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        const sessions = get().studySessions.filter(
          (s) => new Date(s.startedAt) >= weekStart && new Date(s.startedAt) < weekEnd
        );
        const focusSessions = get().focusSessions.filter(
          (s) => new Date(s.startedAt) >= weekStart && new Date(s.startedAt) < weekEnd
        );
        const completedTasks = get().tasks.filter(
          (t) => t.completedAt && new Date(t.completedAt) >= weekStart && new Date(t.completedAt) < weekEnd
        );
        
        return {
          focusMinutes: [...sessions, ...focusSessions].reduce((sum, s) => sum + s.actualDuration, 0),
          sessions: sessions.length + focusSessions.length,
          tasksCompleted: completedTasks.length,
        };
      },
    }),
    {
      name: 'studyos-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        searchQuery: state.searchQuery,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  useAppStore.getState().loadAllData();
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    const prefs = useAppStore.getState().preferences;
    if (prefs.theme === 'system') {
      document.documentElement.classList.toggle('dark', e.matches);
    }
  };
  mediaQuery.addEventListener('change', handleChange);
}