import type { SearchParams, SearchResult } from '@/types/search';
import { appConfig } from '@/config/app';

interface CacheEntry {
  result: SearchResult;
  expiresAt: number;
}

// In-memory cache (per process). For production, use Redis or Supabase.
const cache = new Map<string, CacheEntry>();

function cacheKey(params: SearchParams): string {
  return JSON.stringify({
    o: params.origin,
    d: params.destination,
    s: params.startDate,
    e: params.endDate,
    p: params.passengers,
    a: params.airlineId ?? 'all',
    sp: params.stopoverPreference,
    b: params.baggage.checkedBags,
    bw: params.baggage.checkedBagWeightKg,
    t: params.baggage.trolley,
  });
}

export const searchCache = {
  get(params: SearchParams): SearchResult | null {
    const key = cacheKey(params);
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    return entry.result;
  },

  set(params: SearchParams, result: SearchResult): void {
    const key = cacheKey(params);
    cache.set(key, {
      result,
      expiresAt: Date.now() + appConfig.cacheFlightsTtlMs,
    });
  },

  clear(): void {
    cache.clear();
  },

  size(): number {
    return cache.size;
  },
};
