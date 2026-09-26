import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/helpers';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  dangerous?: boolean;
  shortcut?: string;
  checked?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  offset?: number;
}

export function Dropdown({ trigger, items, align = 'right', offset = 4 }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick();
    setIsOpen(false);
  };

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute z-50 mt-2 w-56 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-elevated py-1.5 animate-fade-in animate-slide-down',
        align === 'right' ? 'right-0' : 'left-0'
      )}
      style={{ marginTop: offset }}
      role="menu"
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors',
            'hover:bg-surface-100 dark:hover:bg-surface-800',
            item.dangerous ? 'text-red-600 dark:text-red-400' : 'text-surface-700 dark:text-surface-300',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
          role="menuitem"
        >
          {item.icon && <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>}
          <span className="flex-1">{item.label}</span>
          {item.checked && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />}
          {item.shortcut && (
            <kbd className="px-1.5 py-0.5 text-xs bg-surface-100 dark:bg-surface-800 rounded text-surface-500 dark:text-surface-400 font-mono">
              {item.shortcut}
            </kbd>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectDropdownProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export function SelectDropdown({
  value,
  options,
  onChange,
  placeholder,
  className,
  disabled,
  searchable = false,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
      setSearchQuery('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, searchable]);

  const filteredOptions = options.filter(
    (opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none',
          disabled ? 'opacity-50 cursor-not-allowed' : 'border-surface-300 dark:border-surface-600 hover:border-surface-400 dark:hover:border-surface-500',
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={cn('truncate', value ? 'text-surface-900 dark:text-surface-50' : 'text-surface-400 dark:text-surface-500')}>
          {selectedOption?.label || placeholder || 'Select...'}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-surface-400 flex-shrink-0 ml-2 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full max-h-60 overflow-auto bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-elevated py-1.5 animate-fade-in animate-slide-down"
          role="listbox"
        >
          {searchable && (
            <div className="px-2 py-1.5 border-b border-surface-200 dark:border-surface-800">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-1.5 text-sm bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div className="px-3.5 py-3 text-sm text-surface-500 dark:text-surface-400 text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                disabled={option.disabled}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors',
                  'hover:bg-surface-100 dark:hover:bg-surface-800',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  value === option.value && 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                )}
                role="option"
                aria-selected={value === option.value}
              >
                {option.icon && <span className="flex-shrink-0 w-5 h-5">{option.icon}</span>}
                <span className="flex-1">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}