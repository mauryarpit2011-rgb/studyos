import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/utils/helpers';
import { Plus, ChevronLeft, ChevronRight, Today, Calendar, MoreHorizontal, Trash2, Edit, Clock, MapPin, RotateCcw } from 'lucide-react';
import { Button, Input, Select, Badge, Dropdown, Modal, Card } from '@/components/ui';
import { useAppStore } from '@/store';
import { formatDate, formatTime, getWeekStart, getWeekEnd, isDueToday } from '@/utils/helpers';
import type { ScheduleEvent, Course } from '@/types';

const viewOptions = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'day', label: 'Day' },
] as const;

export function PlannerPage() {
  const { scheduleEvents, courses, addScheduleEvent, updateScheduleEvent, deleteScheduleEvent, addCourse } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month' | 'day'>('week');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<ScheduleEvent | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  const weekStart = getWeekStart(currentDate);
  const weekEnd = getWeekEnd(currentDate);
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const eventsInView = useMemo(() => {
    let start: Date, end: Date;
    if (view === 'day') {
      start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      start = weekStart;
      end = weekEnd;
    } else {
      start = monthStart;
      end = monthEnd;
    }
    return scheduleEvents.filter(e => {
      const eventStart = new Date(e.startTime);
      return eventStart >= start && eventStart <= end;
    });
  }, [scheduleEvents, view, currentDate, weekStart, weekEnd, monthStart, monthEnd]);

  const handleCreateEvent = (data: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    addScheduleEvent(data);
    setShowCreateModal(false);
  };

  const handleUpdateEvent = (data: Partial<ScheduleEvent>) => {
    if (editingEvent) {
      updateScheduleEvent(editingEvent.id, data);
      setEditingEvent(null);
    }
  };

  const eventMenuItems = (event: ScheduleEvent) => [
    { label: 'Edit', onClick: () => setEditingEvent(event), icon: <Edit className="w-4 h-4" /> },
    { label: 'Delete', onClick: () => setDeletingEvent(event), icon: <Trash2 className="w-4 h-4" />, dangerous: true },
  ];

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      if (view === 'day') next.setDate(next.getDate() + (direction === 'next' ? 1 : -1));
      else if (view === 'week') next.setDate(next.getDate() + (direction === 'next' ? 7 : -7));
      else next.setMonth(next.getMonth() + (direction === 'next' ? 1 : -1));
      return next;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('prev')} aria-label="Previous">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="w-48 text-center">
              <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                {view === 'day' ? formatDate(currentDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) :
                 view === 'week' ? `${formatDate(weekStart, { month: 'short', day: 'numeric' })} - ${formatDate(weekEnd, { month: 'short', day: 'numeric', year: 'numeric' })}` :
                 formatDate(currentDate, { month: 'long', year: 'numeric' })}
              </h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('next')} aria-label="Next">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={goToToday} className="hidden sm:flex items-center gap-2">
            <Today className="w-4 h-4" />
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={view} onChange={setView} options={viewOptions.map(o => ({ value: o.value, label: o.label }))} className="w-32" />
          <Button asChild>
            <a href="#new-event">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </a>
          </Button>
        </div>
      </div>

      {view === 'day' && <DayView date={currentDate} events={eventsInView} onEdit={setEditingEvent} onDelete={setDeletingEvent} />}
      {view === 'week' && <WeekView weekStart={weekStart} events={eventsInView} onEdit={setEditingEvent} onDelete={setDeletingEvent} />}
      {view === 'month' && <MonthView monthStart={monthStart} events={eventsInView} onEdit={setEditingEvent} onDelete={setDeletingEvent} />}

      <EventFormModal
        isOpen={showCreateModal || !!editingEvent}
        onClose={() => { setShowCreateModal(false); setEditingEvent(null); }}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        initialData={editingEvent}
        courses={courses}
        defaultDate={currentDate}
      />

      <Modal
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        title="Delete Event"
        message={`Are you sure you want to delete "${deletingEvent?.title}"?`}
        onConfirm={() => { deletingEvent && deleteScheduleEvent(deletingEvent.id); setDeletingEvent(null); }}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function DayView({ date, events, onEdit, onDelete }: any) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter(e => !e.allDay);
  const allDayEvents = events.filter(e => e.allDay);

  return (
    <div className="card overflow-hidden">
      {allDayEvents.length > 0 && (
        <div className="p-3 bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-800">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">All Day</p>
          <div className="flex flex-wrap gap-2">
            {allDayEvents.map(event => (
              <EventBlock key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} allDay />
            ))}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="w-20 p-2 text-right text-xs text-surface-500 dark:text-surface-400 font-medium border-r border-surface-200 dark:border-surface-800">
                  {hour.toString().padStart(2, '0')}:00
                </td>
                <td className="relative h-20 border-b border-surface-200 dark:border-surface-800">
                  {dayEvents.filter(e => {
                    const start = new Date(e.startTime).getHours();
                    const end = new Date(e.endTime).getHours();
                    return start <= hour && end > hour;
                  }).map(event => (
                    <EventBlock key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} hour={hour} />
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WeekView({ weekStart, events, onEdit, onDelete }: any) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr>
              <th className="w-20 p-2 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider border-b border-surface-200 dark:border-surface-800">Time</th>
              {days.map(day => (
                <th key={day.toISOString()} className={cn('p-2 text-center border-b border-surface-200 dark:border-surface-800', isDueToday(day.toISOString()) && 'bg-brand-50 dark:bg-brand-900/10')}>
                  <p className="text-xs text-surface-500 dark:text-surface-400 uppercase">{day.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                  <p className={cn('font-medium text-surface-900 dark:text-surface-50', isDueToday(day.toISOString()) && 'text-brand-600 dark:text-brand-400')}>
                    {day.getDate()}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 24 }, (_, hour) => (
              <tr key={hour}>
                <td className="w-20 p-1 text-right text-xs text-surface-500 dark:text-surface-400 font-medium border-r border-surface-200 dark:border-surface-800 sticky left-0 bg-white dark:bg-surface-900 z-10">
                  {hour.toString().padStart(2, '0')}:00
                </td>
                {days.map(day => (
                  <td key={day.toISOString()} className="relative h-16 border-b border-surface-200 dark:border-surface-800 border-r border-surface-200 dark:border-surface-800">
                    {events.filter(e => {
                      if (e.allDay) return false;
                      const start = new Date(e.startTime);
                      const end = new Date(e.endTime);
                      return start.getDay() === day.getDay() && start.getHours() <= hour && end.getHours() > hour;
                    }).map(event => (
                      <EventBlock key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} hour={hour} />
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthView({ monthStart, events, onEdit, onDelete }: any) {
  const firstDay = monthStart.getDay();
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((firstDay + daysInMonth) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNum);
    return d;
  });

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} className="p-2 text-center text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider border-b border-surface-200 dark:border-surface-800">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: weeks }, (_, week) => (
              <tr key={week}>
                {Array.from({ length: 7 }, (_, day) => {
                  const date = days[week * 7 + day];
                  if (!date) return <td key={day} className="h-24 border-r border-surface-200 dark:border-surface-800" />;
                  const dayEvents = events.filter(e => {
                    if (e.allDay) return new Date(e.startTime).toDateString() === date.toDateString();
                    return new Date(e.startTime).toDateString() === date.toDateString();
                  });
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <td key={day} className={cn('relative h-24 p-1 border-r border-surface-200 dark:border-surface-800 vertical-align-top', isToday && 'bg-brand-50 dark:bg-brand-900/10')}>
                      <span className={cn('text-sm font-medium', isToday && 'text-brand-600 dark:text-brand-400')}>
                        {date.getDate()}
                      </span>
                      <div className="mt-1 space-y-1 max-h-[160px] overflow-hidden">
                        {dayEvents.slice(0, 4).map(event => (
                          <EventBlock key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} compact />
                        ))}
                        {dayEvents.length > 4 && (
                          <div className="text-xs text-surface-400 dark:text-surface-500 text-center">
                            +{dayEvents.length - 4} more
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EventBlock({ event, onEdit, onDelete, hour, allDay, compact }: any) {
  const course = event.courseId ? 'Course' : null;
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const top = hour ? ((start.getMinutes() / 60) * 48) : 0;
  const height = hour ? Math.max(48, ((end.getTime() - start.getTime()) / 3600000) * 48) : 'auto';

  return (
    <div
      className={cn(
        'absolute left-1 right-1 rounded bg-white dark:bg-surface-800 border shadow-sm z-10 cursor-pointer transition-all',
        'hover:shadow-md hover:z-20',
        compact ? 'text-xs p-1.5' : 'text-xs p-2',
        allDay ? 'h-auto' : ''
      )}
      style={{ 
        top: hour ? `${top}px` : 0, 
        height: hour ? `${height}px` : 'auto',
        borderLeft: `3px solid ${event.color}`
      }}
      onClick={() => onEdit(event)}
    >
      <div className="font-medium text-surface-900 dark:text-surface-50 truncate">{event.title}</div>
      {!allDay && !compact && (
        <div className="flex items-center gap-1 text-surface-500 dark:text-surface-400 mt-1">
          <Clock className="w-3 h-3" />
          <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
        </div>
      )}
      {event.location && !compact && (
        <div className="flex items-center gap-1 text-surface-500 dark:text-surface-400 mt-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{event.location}</span>
        </div>
      )}
    </div>
  );
}

function EventFormModal({ isOpen, onClose, onSubmit, initialData, courses, defaultDate }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    allDay: false,
    courseId: '',
    location: '',
    color: '#0c8ce9',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        startTime: initialData.startTime.slice(0, 16),
        endTime: initialData.endTime.slice(0, 16),
        allDay: initialData.allDay,
        courseId: initialData.courseId || '',
        location: initialData.location,
        color: initialData.color,
      });
    } else {
      const start = new Date(defaultDate);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start);
      end.setHours(10, 0, 0, 0);
      setFormData({
        title: '',
        description: '',
        startTime: start.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16),
        allDay: false,
        courseId: '',
        location: '',
        color: '#0c8ce9',
      });
    }
  }, [initialData, defaultDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      courseId: formData.courseId || null,
    };
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Event' : 'New Event'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Event title" />
        <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Details..." rows={3} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start" type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
          <Input label="End" type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allDay}
              onChange={(e) => setFormData({...formData, allDay: e.target.checked})}
              className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-700 dark:text-surface-300">All day</span>
          </label>
          <Input label="Color" type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-10 h-10 p-1" />
        </div>
        <Select label="Course" value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} options={[
          { value: '', label: 'No Course' },
          ...courses.map((c: any) => ({ value: c.id, label: `${c.code} - ${c.name}` }))
        ]} />
        <Input label="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Room, building, or online link" />
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initialData ? 'Save Changes' : 'Create Event'}</Button>
        </div>
      </form>
    </Modal>
  );
}

