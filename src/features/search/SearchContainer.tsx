'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { SearchForm } from '@/components/forms/SearchForm';
import { ResultsList } from '@/components/results/ResultsList';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { AirplaneAnimated } from '@/components/icons/AirplaneAnimated';
import { PriceAlertsPanel } from '@/features/search/PriceAlerts';
import { FlexibleDateView } from '@/features/search/FlexibleDateView';
import { useI18n } from '@/i18n';
import { featureFlags } from '@/config/feature-flags';
import {
  getFavoriteIds, addFavorite, removeFavorite,
  saveSearch,
} from '@/lib/storage';
import type { SearchResult, SearchStatus } from '@/types/search';
import type { SearchParamsInput } from '@/schemas/searchSchema';
import type { NormalizedFlight } from '@/types/flight';
import type { NormalizedHotel } from '@/types/hotel';
import { MAX_RECENT_SEARCHES } from '@/lib/constants';

const STATUS_LABELS: Record<SearchStatus, string> = {
  idle: '',
  validating: 'Validating…',
  trust_check: 'Checking sources…',
  searching_flights: 'Searching flights…',
  searching_hotel: 'Searching hotels…',
  normalizing: 'Preparing results…',
  done: 'Done',
  error: 'Error',
};

/** Shift saved dates to today keeping the same trip duration in days. */
function shiftDatesToToday(params: SearchParamsInput): SearchParamsInput {
  const origStart = new Date(params.startDate + 'T00:00:00Z');
  const origEnd = new Date(params.endDate + 'T00:00:00Z');
  const durationDays = Math.max(1, Math.round((origEnd.getTime() - origStart.getTime()) / 86400000));
  const today = new Date();
  const newStart = today.toISOString().slice(0, 10);
  const newEnd = new Date(today.getTime() + durationDays * 86400000).toISOString().slice(0, 10);
  return { ...params, startDate: newStart, endDate: newEnd };
}

export function SearchContainer() {
  const { t } = useI18n();
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<SearchParamsInput[]>([]);
  const [lastSearch, setLastSearch] = useState<SearchParamsInput | null>(null);
  const [showFlexDates, setShowFlexDates] = useState(false);

  // Save search panel state
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  // Re-run from saved/favorites: pre-populate form + auto-search with shifted dates
  const [rerunParams, setRerunParams] = useState<SearchParamsInput | null>(null);
  const [formKey, setFormKey] = useState(0);

  // Lookup map so we can persist full items when favoriting
  const itemMapRef = useRef<Map<string, { type: 'flight' | 'hotel'; item: NormalizedFlight | NormalizedHotel }>>(new Map());

  // Load favorites from localStorage on mount
  useEffect(() => {
    setFavorites(getFavoriteIds());
  }, []);

  // Read re-run params from sessionStorage on mount (set by Saved/Favorites pages)
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('skyroute_rerun') : null;
    if (!raw) return;
    sessionStorage.removeItem('skyroute_rerun');
    try {
      const stored: SearchParamsInput = JSON.parse(raw);
      const shifted = shiftDatesToToday(stored);
      setRerunParams(shifted);
      setFormKey((k) => k + 1); // force SearchForm remount with new initialValues
    } catch { /* ignore malformed data */ }
  }, []);

  // Rebuild item map whenever result changes
  useEffect(() => {
    if (!result) return;
    const map = new Map<string, { type: 'flight' | 'hotel'; item: NormalizedFlight | NormalizedHotel }>();
    result.flights.flights.forEach((f) => map.set(f.id, { type: 'flight', item: f }));
    if (result.hotel.recommended) map.set(result.hotel.recommended.id, { type: 'hotel', item: result.hotel.recommended });
    result.hotel.alternatives.forEach((h) => map.set(h.id, { type: 'hotel', item: h }));
    itemMapRef.current = map;
  }, [result]);

  const handleSearch = useCallback(async (params: SearchParamsInput) => {
    setError(null);
    setResult(null);
    setShowSavePanel(false);
    setSaveConfirmed(false);

    const statuses: SearchStatus[] = ['validating', 'trust_check', 'searching_flights', 'searching_hotel', 'normalizing'];
    for (let i = 0; i < statuses.length; i++) {
      setSearchStatus(statuses[i]);
      await new Promise((r) => setTimeout(r, 250 + i * 100));
    }

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data: SearchResult = await res.json();
      setResult(data);
      setSearchStatus('done');
      setLastSearch(params);

      setRecentSearches((prev) => {
        const updated = [params, ...prev.filter((p) => JSON.stringify(p) !== JSON.stringify(params))];
        return updated.slice(0, MAX_RECENT_SEARCHES);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.error.searchFailed;
      setError(msg);
      setSearchStatus('error');
    }
  }, [t]);

  // Auto-trigger search when re-run params are ready (after form remount)
  useEffect(() => {
    if (rerunParams) {
      handleSearch(rerunParams);
      setRerunParams(null);
    }
  }, [rerunParams, handleSearch]);

  const toggleFavorite = useCallback((id: string) => {
    const mapped = itemMapRef.current.get(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        removeFavorite(id);
      } else {
        next.add(id);
        if (mapped) {
          addFavorite({ id, type: mapped.type, item: mapped.item });
        }
      }
      return next;
    });
  }, []);

  // Save best flight + hotel to favorites in one click
  const handleSaveAllToFavorites = useCallback(() => {
    if (!result) return;
    const map = itemMapRef.current;
    const newFavs = new Set(favorites);

    const bestFlight = result.flights.flights[0];
    if (bestFlight && !newFavs.has(bestFlight.id)) {
      addFavorite({ id: bestFlight.id, type: 'flight', item: bestFlight });
      map.set(bestFlight.id, { type: 'flight', item: bestFlight });
      newFavs.add(bestFlight.id);
    }
    const hotel = result.hotel.recommended;
    if (hotel && !newFavs.has(hotel.id)) {
      addFavorite({ id: hotel.id, type: 'hotel', item: hotel });
      map.set(hotel.id, { type: 'hotel', item: hotel });
      newFavs.add(hotel.id);
    }

    setFavorites(newFavs);
  }, [result, favorites]);

  const handleSaveSearch = () => {
    if (!lastSearch || !result) return;
    const name = saveName.trim() || `${lastSearch.origin} → ${lastSearch.destination}`;
    saveSearch(lastSearch, name, {
      flightCount: result.flights.returnedCount,
      bestPrice: result.flights.flights[0]?.price,
      bestPriceCurrency: result.flights.flights[0]?.currency,
      hotelName: result.hotel.recommended?.name,
    });
    setSaveConfirmed(true);
    setShowSavePanel(false);
    setSaveName('');
  };

  const bestFlightFavorited = result?.flights.flights[0] ? favorites.has(result.flights.flights[0].id) : false;
  const hotelFavorited = result?.hotel.recommended ? favorites.has(result.hotel.recommended.id) : false;
  const allFavorited = bestFlightFavorited && (result?.hotel.recommended ? hotelFavorited : true);

  return (
    <div className="space-y-8">
      {/* Search form */}
      <Card padding="lg" className="shadow-md">
        <SearchForm
          key={formKey}
          onSearch={handleSearch}
          loading={searchStatus !== 'idle' && searchStatus !== 'done' && searchStatus !== 'error'}
          initialValues={rerunParams ?? undefined}
        />
      </Card>

      {/* Status indicator */}
      {searchStatus !== 'idle' && searchStatus !== 'done' && searchStatus !== 'error' && (
        <div className="flex items-center justify-center gap-3 py-8" role="status" aria-live="polite">
          <AirplaneAnimated size={40} animate="fly" />
          <div className="text-center">
            <Spinner size="md" />
            <p className="mt-2 text-sm text-slate-500">{STATUS_LABELS[searchStatus]}</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {result && searchStatus === 'done' && (
        <>
          <ResultsList result={result} favorites={favorites} onFavorite={toggleFavorite} />

          {/* Action bar */}
          <div className="flex flex-wrap gap-3 items-center pt-2">
            {saveConfirmed ? (
              <span className="text-sm text-emerald-600 font-medium">✅ Search saved!</span>
            ) : showSavePanel ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder={`${lastSearch?.origin} → ${lastSearch?.destination}`}
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
                  autoFocus
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[40px] min-w-[200px] focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={handleSaveSearch}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors min-h-[40px]"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSavePanel(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 min-h-[40px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSavePanel(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-600 font-medium transition-colors min-h-[40px]"
              >
                💾 Save this search
              </button>
            )}

            {/* Save best flight + hotel to favorites in one click */}
            <button
              onClick={handleSaveAllToFavorites}
              disabled={allFavorited}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-colors min-h-[40px] disabled:opacity-50 disabled:cursor-not-allowed border-orange-200 hover:bg-orange-50 text-orange-600"
            >
              {allFavorited ? '❤️ Saved to Favorites' : '🤍 Save to Favorites'}
            </button>

            <a
              href="/user/saved"
              className="text-sm text-sky-600 hover:text-sky-800 font-medium underline underline-offset-2 transition-colors"
            >
              Open Saved Searches →
            </a>
          </div>

          {/* Price alerts */}
          {featureFlags.priceAlertsEnabled && (
            <Card padding="md" className="mt-4">
              <PriceAlertsPanel
                currentSearch={lastSearch ?? undefined}
                currentBestPrice={result.flights?.flights?.[0]?.price ?? undefined}
              />
            </Card>
          )}

          {/* Flexible date calendar */}
          {featureFlags.flexibleDatesEnabled && lastSearch && (
            <div className="mt-2">
              <button
                onClick={() => setShowFlexDates((v) => !v)}
                className="text-sm text-sky-600 hover:underline font-medium"
              >
                {showFlexDates ? 'Hide flexible dates' : 'Show cheapest dates nearby ▾'}
              </button>
              {showFlexDates && (
                <div className="mt-3">
                  <FlexibleDateView
                    origin={lastSearch.origin}
                    destination={lastSearch.destination}
                    baseDate={lastSearch.startDate}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Recent searches */}
      {recentSearches.length > 0 && searchStatus === 'idle' && (
        <section aria-label={t.saved.recentSearches}>
          <h3 className="text-sm font-medium text-slate-500 mb-2">{t.saved.recentSearches}</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.slice(0, 5).map((s, i) => (
              <button
                key={i}
                onClick={() => handleSearch(s)}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-sky-50 hover:border-sky-200 transition-colors"
              >
                {s.origin} → {s.destination} · {s.startDate}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
