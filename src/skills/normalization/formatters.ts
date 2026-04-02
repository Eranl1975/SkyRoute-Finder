import { parseISO } from 'date-fns';
import type { SupportedLocale } from '@/lib/constants';

const LOCALE_MAP: Record<SupportedLocale, string> = {
  en: 'en-US',
  he: 'he-IL',
  es: 'es-ES',
};

export function formatPriceLocale(amount: number, currency: string, locale: SupportedLocale): string {
  return new Intl.NumberFormat(LOCALE_MAP[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTimeLocale(iso: string, locale: SupportedLocale): string {
  try {
    const d = parseISO(iso);
    return new Intl.DateTimeFormat(LOCALE_MAP[locale], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
}

export function formatStops(count: number, locale: SupportedLocale): string {
  if (count === 0) {
    const labels: Record<SupportedLocale, string> = { en: 'Direct', he: 'ישיר', es: 'Directo' };
    return labels[locale];
  }
  const labels: Record<SupportedLocale, (n: number) => string> = {
    en: (n) => `${n} stop${n !== 1 ? 's' : ''}`,
    he: (n) => `${n} עצירות`,
    es: (n) => `${n} escala${n !== 1 ? 's' : ''}`,
  };
  return labels[locale](count);
}
