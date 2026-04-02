import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ms-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={cn(
          'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900',
          'bg-white placeholder:text-slate-400',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
          'min-h-[44px]',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-slate-200 hover:border-slate-300',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
