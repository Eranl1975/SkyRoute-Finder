'use client';

import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface BookingLinkProps {
  url: string;
  label?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function BookingLink({ url, label, variant = 'primary', className }: BookingLinkProps) {
  const { t } = useI18n();
  const text = label ?? t.results.bookNow;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} — opens booking site in new tab`}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-xl transition-all min-h-[44px] px-4 py-2.5 text-sm',
        variant === 'primary'
          ? 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-sm'
          : 'border border-sky-200 text-sky-700 hover:bg-sky-50',
        className
      )}
    >
      {text}
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h6M15 3h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
