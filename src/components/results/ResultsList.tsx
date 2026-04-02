'use client';

import { useState } from 'react';
import { FlightCard } from './FlightCard';
import { HotelCard } from './HotelCard';
import { EmptyState } from './EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { SearchResult, SortOption } from '@/types/search';
import type { NormalizedFlight } from '@/types/flight';

interface ResultsListProps {
  result: SearchResult;
  favorites?: Set<string>;
  onFavorite?: (id: string) => void;
}

function sortFlights(flights: NormalizedFlight[], sort: SortOption): NormalizedFlight[] {
  if (sort === 'cheapest') return [...flights].sort((a, b) => a.price - b.price);
  if (sort === 'earliest') return [...flights].sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  return flights; // recommended = default ranking
}

export function ResultsList({ result, favorites = new Set(), onFavorite }: ResultsListProps) {
  const { t } = useI18n();
  const [sortBy, setSortBy] = useState<SortOption>('cheapest');

  const { flights, hotel } = result;
  const sorted = sortFlights(flights.flights, sortBy);
  const hasFlights = sorted.length > 0;
  const hasHotel = !!hotel.recommended;

  return (
    <div className="space-y-8">
      {/* Flight results */}
      <section aria-labelledby="flights-heading">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 id="flights-heading" className="text-xl font-bold text-slate-900">
              ✈ {t.nav.search}
            </h2>
            {hasFlights && (
              <Badge variant="default">
                {flights.returnedCount} / {flights.totalFound}
              </Badge>
            )}
            {flights.isMockData && (
              <Badge variant="mock">[MOCK DATA]</Badge>
            )}
          </div>

          {hasFlights && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-slate-500 me-1">{t.results.sortBy}:</span>
              {(['cheapest', 'earliest', 'recommended'] as SortOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px]',
                    sortBy === opt
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {t.results[`sort${opt.charAt(0).toUpperCase() + opt.slice(1)}` as keyof typeof t.results] as string}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasFlights ? (
          <div className="space-y-4">
            {sorted.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onFavorite={onFavorite}
                isFavorited={favorites.has(flight.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState type="flights" reasons={flights.notFoundReasons} />
        )}
      </section>

      {/* Hotel result */}
      {result.params.includeHotel && (
        <section aria-labelledby="hotel-heading">
          <h2 id="hotel-heading" className="text-xl font-bold text-slate-900 mb-4">
            🏨 {t.hotel.recommended}
          </h2>
          {hasHotel ? (
            <HotelCard
              hotel={hotel.recommended!}
              onFavorite={onFavorite}
              isFavorited={favorites.has(hotel.recommended!.id)}
            />
          ) : (
            <EmptyState type="hotel" reasons={hotel.notFoundReasons} />
          )}
        </section>
      )}
    </div>
  );
}
