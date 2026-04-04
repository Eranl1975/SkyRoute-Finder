/**
 * localStorage helpers for saved searches and favorites.
 * Versioned keys prevent stale data after schema changes.
 */
import type { SearchParamsInput } from '@/schemas/searchSchema';
import type { NormalizedFlight } from '@/types/flight';
import type { NormalizedHotel } from '@/types/hotel';
import { generateId, nowISO } from '@/lib/utils';

export interface StoredSearch {
  id: string;
  name: string;
  params: SearchParamsInput;
  summary: {
    flightCount: number;
    bestPrice?: number;
    bestPriceCurrency?: string;
    hotelName?: string;
  };
  savedAt: string;
}

export type FavoriteItem =
  | { id: string; type: 'flight'; item: NormalizedFlight; savedAt: string }
  | { id: string; type: 'hotel'; item: NormalizedHotel; savedAt: string };

const SAVED_KEY = 'skyroute_saved_v1';
const FAV_KEY = 'skyroute_favorites_v1';

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch { return []; }
}

function write(key: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota exceeded */ }
}

// ─── Saved Searches ──────────────────────────────────────────────────────────

export function getSavedSearches(): StoredSearch[] {
  return read<StoredSearch>(SAVED_KEY);
}

export function saveSearch(
  params: SearchParamsInput,
  name: string,
  summary: StoredSearch['summary'],
): StoredSearch {
  const entry: StoredSearch = { id: generateId(), name: name.trim() || `${params.origin} → ${params.destination}`, params, summary, savedAt: nowISO() };
  write(SAVED_KEY, [entry, ...getSavedSearches()]);
  return entry;
}

export function deleteSavedSearch(id: string): void {
  write(SAVED_KEY, getSavedSearches().filter((x) => x.id !== id));
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export function getFavorites(): FavoriteItem[] {
  return read<FavoriteItem>(FAV_KEY);
}

export function getFavoriteIds(): Set<string> {
  return new Set(getFavorites().map((f) => f.id));
}

export function addFavorite(item: Omit<FavoriteItem, 'savedAt'>): void {
  const entry = { ...item, savedAt: nowISO() } as FavoriteItem;
  write(FAV_KEY, [entry, ...getFavorites().filter((x) => x.id !== item.id)]);
}

export function removeFavorite(id: string): void {
  write(FAV_KEY, getFavorites().filter((x) => x.id !== id));
}
