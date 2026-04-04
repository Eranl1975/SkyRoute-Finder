'use client';

import { cn } from '@/lib/utils';

interface DateInputProps {
  label?: string;
  value: string;    // YYYY-MM-DD
  min?: string;     // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

/** Convert YYYY-MM-DD → DD/MM/YYYY for display */
function toDisplay(iso: string): string {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

/**
 * DateInput — shows dates in DD/MM/YYYY format.
 * Uses a hidden native <input type="date"> for the picker so it works
 * on all browsers and mobile devices without a library.
 */
export function DateInput({ label, value, min, onChange, error, required, className }: DateInputProps) {
  const inputId = label?.toLowerCase().replace(/\s+/g, '-') ?? 'date-input';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ms-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Visible display — DD/MM/YYYY format */}
        <div
          className={cn(
            'w-full rounded-xl border px-3.5 py-2.5 text-sm',
            'bg-white flex items-center justify-between',
            'transition-colors min-h-[44px] pointer-events-none',
            error ? 'border-red-400' : 'border-slate-200',
          )}
          aria-hidden="true"
        >
          <span className={value ? 'text-slate-900' : 'text-slate-400'}>
            {value ? toDisplay(value) : 'DD/MM/YYYY'}
          </span>
          {/* Calendar icon */}
          <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        {/* Native date input sits on top — invisible but captures all clicks */}
        <input
          id={inputId}
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-label={label}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}
