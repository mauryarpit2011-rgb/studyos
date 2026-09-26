import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { Plus, Search, Filter, ChevronDown, MoreHorizontal, Trash2, Edit, Copy, Flag, Calendar, Tag } from 'lucide-react';
import { Button, Input, Select, Badge, PriorityBadge, StatusBadge, Dropdown, Modal, Card, Textarea } from '@/components/ui';
import { useAppStore } from '@/store';
import { formatDate, isOverdue, isDueToday, getPriorityColor } from '@/utils/helpers';
import type { Task, Priority, TaskStatus } from '@/types';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const;

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

const sortOptions = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
] as const;

export function TasksPage() {
  const { tasks, courses, updateTask, deleteTask, toggleTaskStatus, addTask } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'updatedAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    result.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'dueDate':
          aVal = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bVal = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aVal = priorityOrder[a.priority];
          bVal = priorityOrder[b.priority];
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aVal = new Date(a.updatedAt).getTime();
          bVal = new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  const handleCreateTask = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask(data);
    setShowCreateModal(false);
  };

  const handleUpdateTask = (data: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = () => {
    if (deletingTask) {
      deleteTask(deletingTask.id);
      setDeletingTask(null);
    }
  };

  const taskMenuItems = (task: Task) => [
    { label: 'Edit', onClick: () => setEditingTask(task), icon: <Edit className="w-4 h-4" /> },
    { label: 'Duplicate', onClick: () => addTask({ ...task, id: '', createdAt: '', updatedAt: '', title: task.title + ' (copy)' }), icon: <Copy className="w-4 h-4" /> },
    { label: task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete', onClick: () => toggleTaskStatus(task.id), icon: <Flag className="w-4 h-4" /> },
    { label: 'Delete', onClick: () => setDeletingTask(task), icon: <Trash2 className="w-4 h-4" />, dangerous: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Tasks</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your assignments and to-dos</p>
        </div>
        <Button asChild>
          <Link to="/tasks/new">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions.map(o => ({ value: o.value, label: o.label }))}
              className="w-40"
            />
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={priorityOptions.map(o => ({ value: o.value, label: o.label }))}
              className="w-40"
            />
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions.map(o => ({ value: o.value, label: o.label }))}
              className="w-40"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
            >
              <ChevronDown className={cn('w-4 h-4', sortOrder === 'desc' && 'rotate-180')} />
            </Button>
          </div>
        </div>
      </Card>

      <div className="card">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
              <Search className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-1">No tasks found</h3>
            <p className="text-surface-500 dark:text-surface-400 mb-4">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
              <Button asChild>
                <Link to="/tasks/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-200 dark:divide-surface-800">
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                courses={courses}
                onEdit={setEditingTask}
                onDelete={setDeletingTask}
                menuItems={taskMenuItems(task)}
              />
            ))}
          </div>
        )}
      </div>

      <TaskFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        courses={courses}
      />

      <TaskFormModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        initialData={editingTask}
        courses={courses}
      />

      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTask}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function TaskRow({ task, courses, onEdit, onDelete, menuItems }: { 
  task: Task; 
  courses: any[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  menuItems: any[];
}) {
  const course = courses.find(c => c.id === task.courseId);
  const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'completed';
  const dueToday = task.dueDate && isDueToday(task.dueDate);

  return (
    <div className={cn(
      'p-4 flex items-center gap-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50',
      task.status === 'completed' && 'opacity-60'
    )}>
      <button
        onClick={() => toggleTaskStatus(task.id)}
        className={cn(
          'w-5 h-5 rounded border-2 flex-shrink-0 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          task.status === 'completed'
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-surface-300 dark:border-surface-600 hover:border-brand-500'
        )}
        aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.status === 'completed' && (
          <svg className="w-3 h-3 mx-auto my-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-surface-900 dark:text-surface-50 truncate',
          task.status === 'completed' && 'line-through text-surface-400 dark:text-surface-500'
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400 line-clamp-1">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {course && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color }} />
              {course.code}
            </span>
          )}
          {task.dueDate && (
            <span className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full',
              overdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
              dueToday ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' :
              'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
            )}>
              <Calendar className="w-3 h-3" />
              {overdue ? 'Overdue' : dueToday ? 'Today' : formatDate(task.dueDate)}
            </span>
          )}
          <PriorityBadge priority={task.priority} size="sm" />
          <StatusBadge status={task.status} size="sm" />
          {task.tags.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400">
              <Tag className="w-3 h-3" />
              {task.tags.slice(0, 3).join(', ')}
              {task.tags.length > 3 && ` +${task.tags.length - 3}`}
            </span>
          )}
        </div>
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
  );
}

function TaskFormModal({ isOpen, onClose, onSubmit, initialData, courses }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as Priority,
    status: 'pending' as TaskStatus,
    courseId: '',
    estimatedMinutes: 0,
    tags: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        priority: initialData.priority,
        status: initialData.status,
        courseId: initialData.courseId || '',
        estimatedMinutes: initialData.estimatedMinutes,
        tags: initialData.tags.join(', '),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending',
        courseId: '',
        estimatedMinutes: 0,
        tags: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      estimatedMinutes: Number(formData.estimatedMinutes),
    };
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Task' : 'New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Task title" />
        <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Add details..." rows={3} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Due Date" type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
          <Select label="Priority" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value as Priority})} options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Course" value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} options={[
            { value: '', label: 'No Course' },
            ...courses.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }))
          ]} />
          <Input label="Estimated Minutes" type="number" value={formData.estimatedMinutes} onChange={(e) => setFormData({...formData, estimatedMinutes: Number(e.target.value)})} placeholder="0" />
        </div>
        <Input label="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="study, urgent, math" />
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initialData ? 'Save Changes' : 'Create Task'}</Button>
        </div>
      </form>
    </Modal>
  );
}