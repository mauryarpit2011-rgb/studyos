import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: options?.year ? 'numeric' : undefined,
    ...options,
  });
}

export function formatTime(date: Date | string, timeFormat: '12h' | '24h' = '24h'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  });
}

export function formatDateTime(date: Date | string, timeFormat: '12h' | '24h' = '24h'): string {
  return `${formatDate(date)} at ${formatTime(date, timeFormat)}`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMins) < 1) return 'Just now';
  if (Math.abs(diffMins) < 60) return `${diffMins > 0 ? 'In ' : ''}${Math.abs(diffMins)}m${diffMins > 0 ? '' : ' ago'}`;
  if (Math.abs(diffHours) < 24) return `${diffHours > 0 ? 'In ' : ''}${Math.abs(diffHours)}h${diffHours > 0 ? '' : ' ago'}`;
  if (Math.abs(diffDays) < 7) return `${diffDays > 0 ? 'In ' : ''}${Math.abs(diffDays)}d${diffDays > 0 ? '' : ' ago'}`;
  return formatDate(d);
}

export function isOverdue(date: string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export function isDueToday(date: string | null): boolean {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isDueThisWeek(date: string | null): boolean {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return d >= weekStart && d <= weekEnd;
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
    case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300';
    case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
  }
}

export function getPriorityLabel(priority: 'low' | 'medium' | 'high'): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
    case 'pending': return 'text-surface-600 bg-surface-100 dark:bg-surface-800 dark:text-surface-400';
    case 'archived': return 'text-surface-500 bg-surface-200 dark:bg-surface-700 dark:text-surface-500';
    default: return 'text-surface-600 bg-surface-100 dark:bg-surface-800 dark:text-surface-400';
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function groupBy<T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T | ((item: T) => unknown), order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sortedDates = [...dates].sort().reverse();
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - date.getTime()) / 86400000);
    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }
  return streak;
}

export function getWeekStart(date: Date, weekStartsOn: 0 | 1 | 6 = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(date: Date, weekStartsOn: 0 | 1 | 6 = 0): Date {
  const start = getWeekStart(date, weekStartsOn);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function parseColorString(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (match) return { r: +match[1], g: +match[2], b: +match[3] };
  return null;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}