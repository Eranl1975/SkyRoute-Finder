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

  // Lookup map so we can persist full items when favoriting
  const itemMapRef = useRef<Map<string, { type: 'flight' | 'hotel'; item: NormalizedFlight | NormalizedHotel }>>(new Map());

  // Load favorites from localStorage on mount
  useEffect(() => {
    setFavorites(getFavoriteIds());
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

  return (
    <div className="space-y-8">
      {/* Search form */}
      <Card padding="lg" className="shadow-md">
        <SearchForm onSearch={handleSearch} loading={searchStatus !== 'idle' && searchStatus !== 'done' && searchStatus !== 'error'} />
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

          {/* Save / Favorites action bar */}
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

            <a
              href="/user/saved"
              className="text-sm text-sky-600 hover:text-sky-800 font-medium underline underline-offset-2 transition-colors"
            >
              Open Saved Searches →
            </a>
            <a
              href="/user/favorites"
              className="text-sm text-sky-600 hover:text-sky-800 font-medium underline underline-offset-2 transition-colors"
            >
              Open Favorites →
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
