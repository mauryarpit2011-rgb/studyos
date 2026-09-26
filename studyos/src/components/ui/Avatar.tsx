import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', shape = 'circle', status, ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };

    const statusSizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-surface-400',
      busy: 'bg-red-500',
      away: 'bg-amber-500',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const getColorFromName = (name: string) => {
      const colors = [
        'bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
        'bg-violet-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center font-medium overflow-hidden', sizes[size], shape === 'circle' ? 'rounded-full' : 'rounded-xl', className)}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : name ? (
          <div className={cn('w-full h-full flex items-center justify-center', getColorFromName(name), 'text-white')}>
            {getInitials(name)}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
            <svg className="w-1/2 h-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 border-2 border-white dark:border-surface-950 rounded-full',
              statusSizes[size],
              statusColors[status]
            )}
            aria-label={status}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarGroup({ children, max = 5, size = 'md', className }: AvatarGroupProps) {
  const kids = Array.isArray(children) ? children : [children];
  const visible = kids.slice(0, max);
  const remaining = kids.length - max;

  return (
    <div className={cn('flex -space-x-2', className)} aria-label={remaining > 0 ? `${kids.length} people` : undefined}>
      {visible.map((child, index) => (
        <div key={index} className="relative z-10">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'relative z-0 flex items-center justify-center font-medium border-2 border-white dark:border-surface-950',
            size === 'xs' && 'w-6 h-6 text-xs',
            size === 'sm' && 'w-8 h-8 text-sm',
            size === 'md' && 'w-10 h-10 text-base',
            size === 'lg' && 'w-12 h-12 text-lg',
            size === 'xl' && 'w-16 h-16 text-xl',
            'rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}