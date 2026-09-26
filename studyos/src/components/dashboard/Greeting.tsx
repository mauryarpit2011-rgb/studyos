import { cn } from '@/utils/helpers';
import { Sunrise, Sun, Moon } from 'lucide-react';

export function Greeting() {
  const hour = new Date().getHours();
  const isMorning = hour < 12;
  const isAfternoon = hour < 17;
  const isEvening = hour < 21;

  const greetings = [
    { condition: isMorning, text: 'Good morning', sub: 'Ready to crush your goals today?', icon: Sunrise },
    { condition: isAfternoon, text: 'Good afternoon', sub: 'Stay focused, you\'re doing great!', icon: Sun },
    { condition: isEvening, text: 'Good evening', sub: 'Wrap up strong, then relax.', icon: Sun },
    { condition: true, text: 'Good night', sub: 'Time to recharge for tomorrow.', icon: Moon },
  ];

  const current = greetings.find(g => g.condition)!;
  const Icon = current.icon;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  const dateStr = `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="mb-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-surface-500 dark:text-surface-400">{dateStr}</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-50">
            {current.text}{', '}
            <span className="text-brand-600 dark:text-brand-400">Student</span>
          </h1>
          <p className="mt-1 text-surface-600 dark:text-surface-400">{current.sub}</p>
        </div>
        <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', 'bg-brand-100 dark:bg-brand-900/30')}>
          <Icon className="w-7 h-7 text-brand-600 dark:text-brand-400" />
        </div>
      </div>
    </div>
  );
}