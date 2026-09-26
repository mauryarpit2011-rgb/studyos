import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { Search, X, Filter, ChevronRight, FileText, CheckSquare, Calendar, BookOpen, Clock } from 'lucide-react';
import { Input, Button, Badge, Card } from '@/components/ui';
import { useAppStore } from '@/store';
import { formatDate, formatRelativeTime, truncate } from '@/utils/helpers';
import type { Task, Note, ScheduleEvent, Course } from '@/types';

const filterOptions = [
  { value: 'all', label: 'All', icon: null },
  { value: 'tasks', label: 'Tasks', icon: CheckSquare },
  { value: 'notes', label: 'Notes', icon: FileText },
  { value: 'events', label: 'Events', icon: Calendar },
  { value: 'courses', label: 'Courses', icon: BookOpen },
] as const;

export function SearchPage() {
  const { tasks, notes, scheduleEvents, courses, searchQuery, setSearchQuery, performSearch, searchResults } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<'all' | 'tasks' | 'notes' | 'events' | 'courses'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos-recent-searches') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    const saved = localStorage.getItem('studyos-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      performSearch();
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
        localStorage.setItem('studyos-recent-searches', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const filteredResults = useMemo(() => {
    if (activeFilter === 'all') return searchResults;
    return searchResults.filter(r => r.type === activeFilter);
  }, [searchResults, activeFilter]);

  const getResultComponent = (result: any) => {
    switch (result.type) {
      case 'task':
        const task = tasks.find(t => t.id === result.id);
        return task ? (
          <Link to={`/tasks/${task.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-surface-900 dark:text-surface-50 truncate">{task.title}</p>
              <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mt-1">
                {task.dueDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(task.dueDate)}</span>}
                <Badge variant="outline" className="text-xs">{task.priority}</Badge>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-surface-400" />
          </Link>
        ) : null;
      case 'note':
        const note = notes.find(n => n.id === result.id);
        return note ? (
          <Link to={`/notes/${note.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-surface-900 dark:text-surface-50 truncate">{note.title || 'Untitled'}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400 truncate mt-1">{truncate(note.content.replace(/[#*`\[\]]/g, ''), 100)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-surface-400" />
          </Link>
        ) : null;
      case 'event':
        const event = scheduleEvents.find(e => e.id === result.id);
        return event ? (
          <Link to={`/planner?event=${event.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-surface-900 dark:text-surface-50 truncate">{event.title}</p>
              <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mt-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(event.startTime)}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-surface-400" />
          </Link>
        ) : null;
      case 'course':
        const course = courses.find(c => c.id === result.id);
        return course ? (
          <Link to={`/tasks?course=${course.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-surface-900 dark:text-surface-50 truncate">{course.name}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400 truncate mt-1">{course.code} • {course.instructor}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-surface-400" />
          </Link>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Search</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Find tasks, notes, events, and courses instantly</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <Input
            placeholder="Search everything... (⌘K)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 pr-12 text-lg py-3"
            autoFocus
          />
          {searchQuery && (
            <Button variant="ghost" size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => handleSearch('')}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
          {filterOptions.map(filter => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? 'primary' : 'secondary'}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveFilter(filter.value as any)}
            >
              {filter.icon && <filter.icon className="w-4 h-4 mr-1.5" />}
              {filter.label}
            </Button>
          ))}
        </div>
      </Card>

      {searchQuery.trim() === '' && recentSearches.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300">Recent Searches</h3>
            <Button variant="ghost" size="sm" onClick={() => { setRecentSearches([]); localStorage.removeItem('studyos-recent-searches'); }}>
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((query, i) => (
              <Button key={i} variant="ghost" size="sm" onClick={() => handleSearch(query)} className="whitespace-nowrap">
                <Search className="w-3 h-3 mr-1.5" />
                {query}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {searchQuery.trim() && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
              {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </h3>
          </div>
          
          {filteredResults.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-surface-300 dark:text-surface-600" />
              <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-1">No results found</h3>
              <p className="text-surface-500 dark:text-surface-400">Try different keywords or filters</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((result, index) => (
                <div key={`${result.type}-${result.id}-${index}`}>
                  {getResultComponent(result)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {searchQuery.trim() === '' && recentSearches.length === 0 && (
        <Card className="p-8 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-surface-300 dark:text-surface-600" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-2">Start searching</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Press <kbd className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded text-sm font-mono">⌘K</kbd> to open search from anywhere</p>
          <div className="grid grid-cols-2 gap-4 text-left max-w-xs mx-auto">
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <p className="font-medium text-surface-900 dark:text-surface-50">Tasks</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Find assignments by title, course, or tags</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <p className="font-medium text-surface-900 dark:text-surface-50">Notes</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Search note content and titles</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <p className="font-medium text-surface-900 dark:text-surface-50">Events</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Find scheduled items</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <p className="font-medium text-surface-900 dark:text-surface-50">Courses</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Browse your courses</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}