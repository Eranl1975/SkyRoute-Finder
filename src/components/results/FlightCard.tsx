'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookingLink } from './BookingLink';
import { BookingApprovalModal } from '@/features/booking/BookingApprovalModal';
import { useI18n } from '@/i18n';
import { cn, formatDuration } from '@/lib/utils';
import { featureFlags } from '@/config/feature-flags';
import type { NormalizedFlight } from '@/types/flight';

interface FlightCardProps {
  flight: NormalizedFlight;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export function FlightCard({ flight, onFavorite, isFavorited }: FlightCardProps) {
  const { t } = useI18n();
  const [showApproval, setShowApproval] = useState(false);

  return (
    <>
    {showApproval && (
      <BookingApprovalModal
        booking={{ type: 'flight', item: flight }}
        onConfirm={() => setShowApproval(false)}
        onCancel={() => setShowApproval(false)}
      />
    )}
    <Card highlighted={flight.isCheapest} hover className="relative">
      {/* Cheapest badge */}
      {flight.isCheapest && (
        <div className="absolute -top-3 start-4">
          <Badge variant="cheapest">⭐ {t.results.cheapest}</Badge>
        </div>
      )}

      {/* Mock badge */}
      {flight.isMock && featureFlags.showMockBadge && (
        <div className="absolute top-3 end-3">
          <Badge variant="mock">[MOCK]</Badge>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Airline + route */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="font-semibold text-slate-900 text-base">{flight.airline}</span>
            <Badge variant={flight.isDirect ? 'direct' : 'stopover'}>
              {flight.isDirect ? t.results.direct : flight.stopSummary}
            </Badge>
            <Badge variant={flight.providerTrust}>{flight.trustBadge}</Badge>
          </div>

          {/* Route timeline */}
          <div className="flex items-center gap-3 mb-3">
            <div className="text-center">
              <p className="font-bold text-lg text-slate-900">{flight.origin}</p>
              <p className="text-sm text-slate-500">{flight.formattedDeparture}</p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
              <p className="text-xs text-slate-400">{formatDuration(flight.durationMinutes)}</p>
              <div className="w-full flex items-center gap-1">
                <div className="h-px flex-1 bg-slate-200" />
                {!flight.isDirect && (
                  <div className="h-2 w-2 rounded-full bg-orange-400 shrink-0" title={flight.stopSummary} />
                )}
                <svg className="h-4 w-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              {!flight.isDirect && (
                <p className="text-xs text-orange-500 font-medium">{flight.stopSummary}</p>
              )}
            </div>

            <div className="text-center">
              <p className="font-bold text-lg text-slate-900">{flight.destination}</p>
              <p className="text-sm text-slate-500">{flight.formattedArrival}</p>
            </div>
          </div>

          {/* Baggage */}
          <p className="text-xs text-slate-500">
            🧳 {flight.baggageSummary}
          </p>
        </div>

        {/* Price + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 sm:w-36 shrink-0">
          <div className="text-end">
            <p className={cn('text-2xl font-bold', flight.isCheapest ? 'text-orange-500' : 'text-slate-900')}>
              {flight.formattedPrice}
            </p>
            <p className="text-xs text-slate-400">{flight.providerSource}</p>
          </div>
          <div className="flex gap-2 sm:flex-col sm:w-full">
            <button
              onClick={() => setShowApproval(true)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors min-h-[44px]"
            >
              {featureFlags.bookingEnabled ? t.results.bookNow : 'Review & Book'}
            </button>
            <BookingLink url={flight.bookingUrl} />
            {onFavorite && (
              <button
                onClick={() => onFavorite(flight.id)}
                aria-label={isFavorited ? t.saved.removeFavorite : t.saved.addFavorite}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-orange-400 hover:border-orange-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {isFavorited ? '❤️' : '🤍'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
    </>
  );
}
