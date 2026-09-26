import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/helpers';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  dotColor?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', dot, dotColor, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      neutral: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
      outline: 'bg-transparent border border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-400',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor && `bg-[${dotColor}]`)} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'archived' | 'active' | 'inactive';
  size?: 'sm' | 'md';
}

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = {
    pending: { label: 'Pending', variant: 'neutral' as const, dotColor: '#9ca3af' },
    in_progress: { label: 'In Progress', variant: 'primary' as const, dotColor: '#0c8ce9' },
    completed: { label: 'Completed', variant: 'success' as const, dotColor: '#22c55e' },
    archived: { label: 'Archived', variant: 'neutral' as const, dotColor: '#6b7280' },
    active: { label: 'Active', variant: 'success' as const, dotColor: '#22c55e' },
    inactive: { label: 'Inactive', variant: 'neutral' as const, dotColor: '#9ca3af' },
  }[status];

  return <Badge variant={config.variant} size={size} dot dotColor={config.dotColor}>{config.label}</Badge>;
};

export interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const PriorityBadge = ({ priority, size = 'md', showIcon = false }: PriorityBadgeProps) => {
  const config = {
    low: { label: 'Low', variant: 'success' as const, icon: '🔽' },
    medium: { label: 'Medium', variant: 'warning' as const, icon: '➖' },
    high: { label: 'High', variant: 'danger' as const, icon: '🔼' },
  }[priority];

  return (
    <Badge variant={config.variant} size={size}>
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </Badge>
  );
};