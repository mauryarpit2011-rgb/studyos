import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { AppState, Task, Course, Note, Folder, StudySession, FocusSession, ScheduleEvent, UserPreferences } from '@/types';

interface StudyOSDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-course': string; 'by-status': string; 'by-due-date': string };
  };
  courses: {
    key: string;
    value: Course;
  };
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-folder': string; 'by-tag': string };
  };
  folders: {
    key: string;
    value: Folder;
  };
  studySessions: {
    key: string;
    value: StudySession;
    indexes: { 'by-date': string; 'by-task': string };
  };
  focusSessions: {
    key: string;
    value: FocusSession;
  };
  scheduleEvents: {
    key: string;
    value: ScheduleEvent;
    indexes: { 'by-date': string; 'by-course': string };
  };
  preferences: {
    key: string;
    value: UserPreferences;
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = 'studyos-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<StudyOSDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<StudyOSDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<StudyOSDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('by-course', 'courseId');
      taskStore.createIndex('by-status', 'status');
      taskStore.createIndex('by-due-date', 'dueDate');

      const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
      noteStore.createIndex('by-folder', 'folderId');
      noteStore.createIndex('by-tag', 'tags', { multiEntry: true });

      db.createObjectStore('courses', { keyPath: 'id' });
      db.createObjectStore('folders', { keyPath: 'id' });

      const sessionStore = db.createObjectStore('studySessions', { keyPath: 'id' });
      sessionStore.createIndex('by-date', 'startedAt');
      sessionStore.createIndex('by-task', 'taskId');

      db.createObjectStore('focusSessions', { keyPath: 'id' });

      const eventStore = db.createObjectStore('scheduleEvents', { keyPath: 'id' });
      eventStore.createIndex('by-date', 'startTime');
      eventStore.createIndex('by-course', 'courseId');

      db.createObjectStore('preferences', { keyPath: 'id' });
      db.createObjectStore('meta', { keyPath: 'key' });
    },
  });

  return dbInstance;
}

const DEFAULT_PREFERENCES: UserPreferences = {
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
};

export async function initStorage(): Promise<void> {
  const db = await getDB();
  const prefs = await db.get('preferences', 'user-preferences');
  if (!prefs) {
    await db.put('preferences', { ...DEFAULT_PREFERENCES, id: 'user-preferences' });
  }
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function getTask(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

export async function saveTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put('tasks', { ...task, updatedAt: new Date().toISOString() });
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

export async function getTasksByCourse(courseId: string): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex('tasks', 'by-course', courseId);
}

export async function getTasksByStatus(status: string): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex('tasks', 'by-status', status);
}

export async function getAllCourses(): Promise<Course[]> {
  const db = await getDB();
  return db.getAll('courses');
}

export async function saveCourse(course: Course): Promise<void> {
  const db = await getDB();
  await db.put('courses', { ...course, updatedAt: new Date().toISOString() });
}

export async function deleteCourse(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('courses', id);
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  return db.getAll('notes');
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await getDB();
  return db.get('notes', id);
}

export async function saveNote(note: Note): Promise<void> {
  const db = await getDB();
  await db.put('notes', { ...note, updatedAt: new Date().toISOString() });
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
}

export async function getNotesByFolder(folderId: string | null): Promise<Note[]> {
  const db = await getDB();
  if (folderId === null) {
    const all = await db.getAll('notes');
    return all.filter(n => n.folderId === null);
  }
  return db.getAllFromIndex('notes', 'by-folder', folderId);
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB();
  return db.getAll('folders');
}

export async function saveFolder(folder: Folder): Promise<void> {
  const db = await getDB();
  await db.put('folders', { ...folder, updatedAt: new Date().toISOString() });
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('folders', id);
}

export async function getAllStudySessions(): Promise<StudySession[]> {
  const db = await getDB();
  return db.getAll('studySessions');
}

export async function saveStudySession(session: StudySession): Promise<void> {
  const db = await getDB();
  await db.put('studySessions', { ...session, updatedAt: new Date().toISOString() });
}

export async function getStudySessionsByDateRange(start: Date, end: Date): Promise<StudySession[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('studySessions', 'by-date', IDBKeyRange.bound(start.toISOString(), end.toISOString()));
  return all;
}

export async function getAllFocusSessions(): Promise<FocusSession[]> {
  const db = await getDB();
  return db.getAll('focusSessions');
}

export async function saveFocusSession(session: FocusSession): Promise<void> {
  const db = await getDB();
  await db.put('focusSessions', { ...session, updatedAt: new Date().toISOString() });
}

export async function getAllScheduleEvents(): Promise<ScheduleEvent[]> {
  const db = await getDB();
  return db.getAll('scheduleEvents');
}

export async function saveScheduleEvent(event: ScheduleEvent): Promise<void> {
  const db = await getDB();
  await db.put('scheduleEvents', { ...event, updatedAt: new Date().toISOString() });
}

export async function deleteScheduleEvent(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('scheduleEvents', id);
}

export async function getScheduleEventsByDateRange(start: Date, end: Date): Promise<ScheduleEvent[]> {
  const db = await getDB();
  return db.getAllFromIndex('scheduleEvents', 'by-date', IDBKeyRange.bound(start.toISOString(), end.toISOString()));
}

export async function getPreferences(): Promise<UserPreferences> {
  const db = await getDB();
  const prefs = await db.get('preferences', 'user-preferences');
  return prefs || DEFAULT_PREFERENCES;
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
  const db = await getDB();
  const current = await getPreferences();
  const updated = { ...current, ...prefs, id: 'user-preferences' };
  await db.put('preferences', updated);
  return updated;
}

export async function exportData(): Promise<string> {
  const db = await getDB();
  const data = {
    tasks: await db.getAll('tasks'),
    courses: await db.getAll('courses'),
    notes: await db.getAll('notes'),
    folders: await db.getAll('folders'),
    studySessions: await db.getAll('studySessions'),
    focusSessions: await db.getAll('focusSessions'),
    scheduleEvents: await db.getAll('scheduleEvents'),
    preferences: await db.get('preferences', 'user-preferences'),
    exportedAt: new Date().toISOString(),
    version: DB_VERSION,
  };
  return JSON.stringify(data, null, 2);
}

export async function importData(json: string): Promise<void> {
  const db = await getDB();
  const data = JSON.parse(json);
  
  const tx = db.transaction(['tasks', 'courses', 'notes', 'folders', 'studySessions', 'focusSessions', 'scheduleEvents', 'preferences'], 'readwrite');
  
  if (data.tasks) {
    for (const task of data.tasks) await tx.objectStore('tasks').put(task);
  }
  if (data.courses) {
    for (const course of data.courses) await tx.objectStore('courses').put(course);
  }
  if (data.notes) {
    for (const note of data.notes) await tx.objectStore('notes').put(note);
  }
  if (data.folders) {
    for (const folder of data.folders) await tx.objectStore('folders').put(folder);
  }
  if (data.studySessions) {
    for (const session of data.studySessions) await tx.objectStore('studySessions').put(session);
  }
  if (data.focusSessions) {
    for (const session of data.focusSessions) await tx.objectStore('focusSessions').put(session);
  }
  if (data.scheduleEvents) {
    for (const event of data.scheduleEvents) await tx.objectStore('scheduleEvents').put(event);
  }
  if (data.preferences) {
    await tx.objectStore('preferences').put(data.preferences);
  }
  
  await tx.done;
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['tasks', 'courses', 'notes', 'folders', 'studySessions', 'focusSessions', 'scheduleEvents'], 'readwrite');
  await Promise.all([
    tx.objectStore('tasks').clear(),
    tx.objectStore('courses').clear(),
    tx.objectStore('notes').clear(),
    tx.objectStore('folders').clear(),
    tx.objectStore('studySessions').clear(),
    tx.objectStore('focusSessions').clear(),
    tx.objectStore('scheduleEvents').clear(),
  ]);
  await tx.done;
}