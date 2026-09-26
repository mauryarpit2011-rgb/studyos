import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/store';

export function useTheme() {
  const { preferences, updatePreferences } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = preferences.theme === 'system' ? (prefersDark ? 'dark' : 'light') : preferences.theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [preferences.theme]);

  const toggleTheme = useCallback(() => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(preferences.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updatePreferences({ theme: nextTheme });
  }, [preferences.theme, updatePreferences]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme });
  }, [updatePreferences]);

  return { theme: preferences.theme, toggleTheme, setTheme, mounted };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
  return useMediaQuery('(max-width: 1024px)');
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export function useKeyboardShortcut(key: string, callback: () => void, modifiers: ('ctrl' | 'shift' | 'alt' | 'meta')[] = []) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (modifiers.includes('ctrl') && !event.ctrlKey) return;
      if (modifiers.includes('shift') && !event.shiftKey) return;
      if (modifiers.includes('alt') && !event.altKey) return;
      if (modifiers.includes('meta') && !event.metaKey) return;
      
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
        return;
      }
      
      event.preventDefault();
      callbackRef.current();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, modifiers]);
}

export function useFocusTimer() {
  const { currentFocusSession, updateFocusSession, endFocusSession, completeFocusSession } = useAppStore();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!currentFocusSession?.isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const updateTimer = () => {
      const endTime = new Date(currentFocusSession.currentSessionEndTime).getTime();
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const total = currentFocusSession.plannedMinutes * 60000;
      
      setTimeRemaining(remaining);
      setProgress(1 - remaining / total);

      if (remaining === 0) {
        if (currentFocusSession.currentSessionType === 'focus') {
          completeFocusSession();
        } else {
          endFocusSession();
        }
      }
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentFocusSession, completeFocusSession, endFocusSession]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    session: currentFocusSession,
    timeRemaining,
    progress,
    formattedTime: formatTime(timeRemaining),
    isActive: currentFocusSession?.isActive ?? false,
    sessionType: currentFocusSession?.currentSessionType,
  };
}

export function useAnimationFrame(callback: (time: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      callback(time - previousTimeRef.current);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);
}

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('studyos-onboarding-complete');
    if (!hasSeen) {
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('studyos-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}