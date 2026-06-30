import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchableSelectProps {
  options: Array<{ value: string; label: string; subtitle?: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  /** Optional extra content to show below the search input (e.g. SKU hint) */
  header?: React.ReactNode;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Type to search...',
  className,
  disabled = false,
  header,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.subtitle?.toLowerCase().includes(q)
    );
  }, [options, search]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen(!open); setSearch(''); }}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          open && 'ring-2 ring-ring ring-offset-2'
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? (
            <span>
              {selected.label}
              {selected.subtitle && <span className="ml-1.5 text-xs text-muted-foreground">({selected.subtitle})</span>}
            </span>
          ) : placeholder}
        </span>
        <FiSearch className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          {/* Search input */}
          <div className="border-b p-2">
            <div className="relative">
              <FiSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full rounded-md border bg-muted/30 pl-8 pr-7 text-sm focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
                >
                  <FiX className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Optional header content (e.g. SKU hint) */}
          {header && <div className="border-b px-3 py-2">{header}</div>}

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">No results found</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    value === option.value && 'bg-accent font-medium'
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.subtitle && (
                    <span className="flex-shrink-0 text-xs text-muted-foreground">{option.subtitle}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
