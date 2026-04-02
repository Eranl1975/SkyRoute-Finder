'use client';

import { useI18n } from '@/i18n';
import { AirplaneAnimated } from '@/components/icons/AirplaneAnimated';

interface EmptyStateProps {
  title?: string;
  reasons?: string[];
  type?: 'flights' | 'hotel' | 'general';
}

export function EmptyState({ title, reasons, type = 'general' }: EmptyStateProps) {
  const { t } = useI18n();

  const defaultTitle =
    type === 'flights' ? t.notFound.noFlights :
    type === 'hotel'   ? 'No hotel found' :
    t.notFound.title;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center" role="status">
      {/* Illustration placeholder */}
      <div className="mb-6 opacity-60">
        <AirplaneAnimated size={72} animate="hover" />
      </div>

      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {title ?? defaultTitle}
      </h3>

      {reasons && reasons.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-left max-w-sm" aria-label="Reasons">
          {reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-500">
              <span className="text-amber-500 shrink-0">⚠</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-sm text-slate-400">{t.notFound.tryAdjusting}</p>
    </div>
  );
}
