import { cn } from '@/lib/utils';
import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ms-1" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={cn(
          'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900',
          'bg-white appearance-none cursor-pointer',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
          'min-h-[44px]',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-slate-200 hover:border-slate-300',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
