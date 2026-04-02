import { type ClassValue, clsx } from 'clsx';
import { differenceInMinutes, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: number, currency: string, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(iso: string): string {
  try {
    const d = parseISO(iso);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    const d = parseISO(iso);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  } catch {
    return iso;
  }
}

export function flightDuration(departureIso: string, arrivalIso: string): number {
  try {
    return differenceInMinutes(parseISO(arrivalIso), parseISO(departureIso));
  } catch {
    return 0;
  }
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function isoDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str;
}
