/**
 * Price Alert Service — purely client-side, localStorage-backed.
 * No paid service required.
 *
 * Extension points:
 *   - Persist alerts to Supabase: replace localStorage with DB calls
 *   - Push notifications: integrate Web Push API + service worker
 *   - Email alerts: add server-side cron that calls /api/price-alerts/check
 */
import type { SearchParamsInput } from '@/schemas/searchSchema';

export interface PriceAlert {
  id: string;
  params: SearchParamsInput;
  targetPrice: number;
  currency: string;
  label: string;           // "{origin} → {destination}"
  createdAt: string;       // ISO
  lastCheckedAt?: string;
  triggeredAt?: string;
  isActive: boolean;
  bestPriceSeen?: number;
}

const STORAGE_KEY = 'skyroute_price_alerts';

function load(): PriceAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as PriceAlert[];
  } catch {
    return [];
  }
}

function save(alerts: PriceAlert[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export const priceAlertService = {
  getAll(): PriceAlert[] {
    return load();
  },

  getActive(): PriceAlert[] {
    return load().filter((a) => a.isActive);
  },

  add(params: SearchParamsInput, targetPrice: number, currency = 'USD'): PriceAlert {
    const alert: PriceAlert = {
      id: Math.random().toString(36).slice(2),
      params,
      targetPrice,
      currency,
      label: `${params.origin} → ${params.destination}`,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    const alerts = load();
    alerts.unshift(alert);
    save(alerts);
    return alert;
  },

  remove(id: string): void {
    save(load().filter((a) => a.id !== id));
  },

  disable(id: string): void {
    save(load().map((a) => (a.id === id ? { ...a, isActive: false } : a)));
  },

  /** Check a freshly found price against all active alerts. Returns triggered alerts. */
  checkPrice(origin: string, destination: string, foundPrice: number, currency: string): PriceAlert[] {
    const now = new Date().toISOString();
    const alerts = load();
    const triggered: PriceAlert[] = [];

    const updated = alerts.map((alert) => {
      if (!alert.isActive) return alert;
      if (
        alert.params.origin.toLowerCase() === origin.toLowerCase() &&
        alert.params.destination.toLowerCase() === destination.toLowerCase() &&
        alert.currency === currency &&
        foundPrice <= alert.targetPrice
      ) {
        const t = { ...alert, triggeredAt: now, lastCheckedAt: now, bestPriceSeen: foundPrice };
        triggered.push(t);
        return t;
      }
      return { ...alert, lastCheckedAt: now, bestPriceSeen: Math.min(alert.bestPriceSeen ?? Infinity, foundPrice) };
    });

    save(updated);
    return triggered;
  },
};
