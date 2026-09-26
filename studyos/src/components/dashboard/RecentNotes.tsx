import { Link } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { FileText, Plus, ChevronRight, MoreHorizontal, Bookmark, Pin } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { useAppStore } from '@/store';
import { formatRelativeTime, truncate } from '@/utils/helpers';
import type { Note } from '@/types';

export function RecentNotes() {
  const { notes, togglePinNote, deleteNote } = useAppStore();
  
  const recentNotes = notes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  if (recentNotes.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-1">No notes yet</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4">Capture your thoughts and ideas</p>
          <Button asChild>
            <Link to="/notes?new=true">
              <Plus className="w-4 h-4 mr-2" />
              Create Note
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Recent Notes
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/notes">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      
      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        {recentNotes.map((note) => (
          <Link
            key={note.id}
            to={`/notes/${note.id}`}
            className={cn(
              'p-4 flex items-start gap-3 transition-colors',
              'hover:bg-surface-50 dark:hover:bg-surface-800/50',
              note.isPinned && 'bg-brand-50/50 dark:bg-brand-900/10'
            )}
            onClick={(e) => {
              if (e.target.closest('button')) e.preventDefault();
            }}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              note.isPinned 
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
            )}>
              {note.isPinned ? (
                <Pin className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={cn(
                  'font-medium text-surface-900 dark:text-surface-50 truncate',
                  note.isPinned && 'pr-6'
                )}>
                  {note.title || 'Untitled'}
                </p>
                <div className="flex items-center gap-1">
                  {note.isPinned && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePinNote(note.id); }}
                      className="p-1 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                      aria-label="Unpin note"
                    >
                      <Pin className="w-4 h-4 fill-current" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {note.content && (
                <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
                  {truncate(note.content.replace(/[#*`\[\]]/g, ''), 120)}
                </p>
              )}
              
              <div className="mt-2 flex items-center gap-3 text-xs text-surface-400 dark:text-surface-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  {note.type}
                </span>
                <span>{formatRelativeTime(note.updatedAt)}</span>
                {note.tags.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {note.tags.slice(0, 2).join(', ')}
                      {note.tags.length > 2 && ` +${note.tags.length - 2}`}
                    </Badge>
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}