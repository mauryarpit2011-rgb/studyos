import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { Plus, Search, Filter, MoreHorizontal, Trash2, Edit, Copy, Bookmark, Pin, Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { Button, Input, Select, Badge, Dropdown, Modal, Card, Avatar } from '@/components/ui';
import { useAppStore } from '@/store';
import { formatRelativeTime, truncate } from '@/utils/helpers';
import type { Note, Folder as FolderType } from '@/types';

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'text', label: 'Text' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'checklist', label: 'Checklist' },
] as const;

const sortOptions = [
  { value: 'updatedAt', label: 'Recently Updated' },
  { value: 'createdAt', label: 'Created' },
  { value: 'title', label: 'Title' },
] as const;

export function NotesPage() {
  const { notes, folders, addNote, updateNote, deleteNote, togglePinNote, addFolder } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'text' | 'markdown' | 'checklist'>('all');
  const [folderFilter, setFolderFilter] = useState<string | null>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q) ||
        n.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(n => n.type === typeFilter);
    }

    if (folderFilter && folderFilter !== 'all') {
      result = result.filter(n => n.folderId === folderFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });

    return result;
  }, [notes, searchQuery, typeFilter, folderFilter, sortBy]);

  const noteMenuItems = (note: Note) => [
    { label: 'Edit', onClick: () => setEditingNote(note), icon: <Edit className="w-4 h-4" /> },
    { label: 'Duplicate', onClick: () => addNote({ ...note, id: '', createdAt: '', updatedAt: '', title: note.title + ' (copy)', wordCount: 0 }), icon: <Copy className="w-4 h-4" /> },
    { label: note.isPinned ? 'Unpin' : 'Pin', onClick: () => togglePinNote(note.id), icon: note.isPinned ? <Pin className="w-4 h-4 fill-none" /> : <Pin className="w-4 h-4" /> },
    { label: 'Delete', onClick: () => setDeletingNote(note), icon: <Trash2 className="w-4 h-4" />, dangerous: true },
  ];

  const handleBulkDelete = () => {
    selectedNotes.forEach(id => deleteNote(id));
    setSelectedNotes([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Notes</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">Capture and organize your thoughts</p>
          </div>
          <div className="flex items-center gap-2 border-l border-surface-200 dark:border-surface-800 pl-4">
            <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-surface-100 dark:bg-surface-800' : ''}>
              <span className="w-5 h-5">☰</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-surface-100 dark:bg-surface-800' : ''}>
              <span className="w-5 h-5">⧉</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link to="/notes/new">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Link>
          </Button>
          <Dropdown
            trigger={
              <Button variant="secondary">
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            }
            items={[
              { label: 'Create Folder', onClick: () => setShowFolderModal(true), icon: <Plus className="w-4 h-4" /> },
            ]}
          />
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={folderFilter}
              onChange={setFolderFilter}
              options={[
                { value: 'all', label: 'All Folders' },
                { value: 'null', label: 'No Folder' },
                ...folders.map(f => ({ value: f.id, label: f.name }))
              ]}
              className="w-44"
            />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={typeOptions.map(o => ({ value: o.value, label: o.label }))}
              className="w-40"
            />
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions.map(o => ({ value: o.value, label: o.label }))}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {selectedNotes.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800">
          <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
            {selectedNotes.length} note{selectedNotes.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { selectedNotes.forEach(id => togglePinNote(id)); setSelectedNotes([]); }}>
              <Pin className="w-4 h-4 mr-1" /> Pin
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBulkDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedNotes([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="card">
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-surface-400" />
              </div>
              <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-1">No notes found</h3>
              <p className="text-surface-500 dark:text-surface-400 mb-4">
                {searchQuery || typeFilter !== 'all' || folderFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first note to get started'}
              </p>
              {!searchQuery && typeFilter === 'all' && folderFilter === 'all' && (
                <Button asChild>
                  <Link to="/notes/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Note
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {filteredNotes.map((note) => (
                <NoteRowList
                  key={note.id}
                  note={note}
                  selected={selectedNotes.includes(note.id)}
                  onSelect={(selected) => setSelectedNotes(prev => selected ? [...prev, note.id] : prev.filter(id => id !== note.id))}
                  onEdit={setEditingNote}
                  onDelete={setDeletingNote}
                  menuItems={noteMenuItems(note)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-surface-400" />
              </div>
              <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-1">No notes found</h3>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteCardGrid
                key={note.id}
                note={note}
                selected={selectedNotes.includes(note.id)}
                onSelect={(selected) => setSelectedNotes(prev => selected ? [...prev, note.id] : prev.filter(id => id !== note.id))}
                onEdit={setEditingNote}
                onDelete={setDeletingNote}
                menuItems={noteMenuItems(note)}
              />
            ))
          )}
        </div>
      )}

      <NoteFormModal
        isOpen={showCreateModal || !!editingNote}
        onClose={() => { setShowCreateModal(false); setEditingNote(null); }}
        onSubmit={(data) => {
          if (editingNote) updateNote(editingNote.id, data);
          else addNote(data);
        }}
        initialData={editingNote}
        folders={folders}
      />

      <FolderFormModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSubmit={(data) => { addFolder(data); }}
        folders={folders}
      />

      <Modal
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        title="Delete Note"
        message={`Are you sure you want to delete "${deletingNote?.title || 'Untitled'}"? This action cannot be undone.`}
        onConfirm={() => { deletingNote && deleteNote(deletingNote.id); setDeletingNote(null); }}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function NoteRowList({ note, selected, onSelect, onEdit, onDelete, menuItems }: any) {
  const folder = note.folderId ? 'In folder' : 'No folder';
  
  return (
    <label className={cn('p-4 flex items-center gap-3 transition-colors cursor-pointer', 'hover:bg-surface-50 dark:hover:bg-surface-800/50', note.isPinned && 'bg-brand-50/50 dark:bg-brand-900/10')}>
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onSelect(e.target.checked)}
        className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-brand-600 focus:ring-brand-500"
      />
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', note.isPinned ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-500')}>
        {note.isPinned ? <Bookmark className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0" onClick={() => onEdit(note)}>
        <div className="flex items-start justify-between gap-2">
          <p className={cn('font-medium text-surface-900 dark:text-surface-50 truncate', note.isPinned && 'pr-6')}>
            {note.title || 'Untitled'}
          </p>
          <Dropdown
            trigger={
              <button className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" aria-label="More options">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            items={menuItems}
          />
        </div>
        {note.content && (
          <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400 line-clamp-1">
            {truncate(note.content.replace(/[#*`\[\]]/g, ''), 150)}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-surface-400 dark:text-surface-500">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: note.type === 'markdown' ? '#0c8ce9' : note.type === 'checklist' ? '#22c55e' : '#6b7280' }} />
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
    </label>
  );
}

function NoteCardGrid({ note, selected, onSelect, onEdit, onDelete, menuItems }: any) {
  return (
    <label className={cn('card p-4 flex flex-col h-full cursor-pointer transition-all', 'hover:shadow-elevated', selected && 'ring-2 ring-brand-500', note.isPinned && 'ring-1 ring-amber-500')}>
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => { e.stopPropagation(); onSelect(e.target.checked); }}
        className="sr-only peer"
      />
      <div className={cn('flex items-start justify-between gap-2 mb-3', note.isPinned && 'bg-amber-100 dark:bg-amber-900/30')}>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', note.isPinned ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-500')}>
          {note.isPinned ? <Bookmark className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        </div>
        <Dropdown
          trigger={
            <button className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" aria-label="More options">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          }
          items={menuItems}
        />
      </div>
      <div className="flex-1" onClick={() => onEdit(note)}>
        <p className={cn('font-medium text-surface-900 dark:text-surface-50 line-clamp-1 mb-2', note.isPinned && 'pr-6')}>
          {note.title || 'Untitled'}
        </p>
        {note.content && (
          <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-3 mb-3">
            {truncate(note.content.replace(/[#*`\[\]]/g, ''), 200)}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-surface-400 dark:text-surface-500">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800">
          {note.type === 'markdown' && <span className="w-2 h-2 rounded-full bg-brand-500" />}
          {note.type === 'checklist' && <span className="w-2 h-2 rounded-full bg-green-500" />}
          {note.type === 'text' && <span className="w-2 h-2 rounded-full bg-surface-400" />}
          {note.type}
        </span>
        <span>{formatRelativeTime(note.updatedAt)}</span>
      </div>
    </label>
  );
}

function NoteFormModal({ isOpen, onClose, onSubmit, initialData, folders }: any) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text' as 'text' | 'markdown' | 'checklist',
    folderId: '',
    tags: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        type: initialData.type,
        folderId: initialData.folderId || '',
        tags: initialData.tags.join(', '),
      });
    } else {
      setFormData({ title: '', content: '', type: 'text', folderId: '', tags: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      folderId: formData.folderId || null,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    onSubmit(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Note' : 'New Note'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Note title" />
        <Select label="Type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})} options={[
          { value: 'text', label: 'Plain Text' },
          { value: 'markdown', label: 'Markdown' },
          { value: 'checklist', label: 'Checklist' },
        ]} />
        <Select label="Folder" value={formData.folderId} onChange={(e) => setFormData({...formData, folderId: e.target.value})} options={[
          { value: '', label: 'No Folder' },
          ...folders.map((f: any) => ({ value: f.id, label: f.name }))
        ]} />
        <Textarea label="Content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Start writing..." rows={10} />
        <Input label="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="important, lecture, review" />
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initialData ? 'Save Changes' : 'Create Note'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function FolderFormModal({ isOpen, onClose, onSubmit, folders }: any) {
  const [formData, setFormData] = useState({ name: '', parentId: '', color: '#0c8ce9', icon: 'Folder' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, parentId: formData.parentId || null });
    onClose();
    setFormData({ name: '', parentId: '', color: '#0c8ce9', icon: 'Folder' });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Folder" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Folder Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Folder name" />
        <Select label="Parent Folder" value={formData.parentId} onChange={(e) => setFormData({...formData, parentId: e.target.value})} options={[
          { value: '', label: 'No Parent (Root)' },
          ...folders.map((f: any) => ({ value: f.id, label: f.name }))
        ]} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Color" type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="h-10 p-1" />
          <Select label="Icon" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} options={[
            { value: 'Folder', label: 'Folder' },
            { value: 'BookOpen', label: 'Book' },
            { value: 'Tag', label: 'Tag' },
            { value: 'Archive', label: 'Archive' },
            { value: 'Star', label: 'Star' },
          ]} />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Folder</Button>
        </div>
      </form>
    </Modal>
  );
}

