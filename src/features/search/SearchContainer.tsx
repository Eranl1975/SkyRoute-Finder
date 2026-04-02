'use client';

import { useState, useCallback } from 'react';
import { SearchForm } from '@/components/forms/SearchForm';
import { ResultsList } from '@/components/results/ResultsList';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { AirplaneAnimated } from '@/components/icons/AirplaneAnimated';
import { PriceAlertsPanel } from '@/features/search/PriceAlerts';
import { FlexibleDateView } from '@/features/search/FlexibleDateView';
import { useI18n } from '@/i18n';
import { featureFlags } from '@/config/feature-flags';
import type { SearchResult, SearchStatus } from '@/types/search';
import type { SearchParamsInput } from '@/schemas/searchSchema';
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

  const handleSearch = useCallback(async (params: SearchParamsInput) => {
    setError(null);
    setResult(null);

    // Simulate progressive status updates for better UX
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

      // Save to recent searches (client-side only, no server call needed)
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

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
