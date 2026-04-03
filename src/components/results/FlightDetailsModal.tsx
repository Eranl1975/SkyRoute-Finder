'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDuration } from '@/lib/utils';
import type { NormalizedFlight } from '@/types/flight';

interface FlightDetailsModalProps {
  flight: NormalizedFlight;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className="text-sm text-slate-900 font-semibold text-end">{value}</span>
    </div>
  );
}

export function FlightDetailsModal({ flight, onClose }: FlightDetailsModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flight-details-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4" padding="lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="flight-details-title" className="text-lg font-bold text-slate-900">
              ✈ Flight Details
            </h2>
            <p className="text-sm text-slate-500">{flight.airline} · {flight.origin} → {flight.destination}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Route timeline */}
        <div className="flex items-center gap-4 bg-sky-50 rounded-xl p-4 mb-4">
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-slate-900">{flight.origin}</p>
            <p className="text-sm font-semibold text-sky-700">{flight.formattedDeparture}</p>
          </div>

          <div className="flex flex-col items-center gap-1 flex-1">
            <p className="text-xs text-slate-400">{formatDuration(flight.durationMinutes)}</p>
            <div className="flex items-center gap-1 w-full">
              <div className="h-px flex-1 bg-slate-300" />
              <svg className="h-5 w-5 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <div className="h-px flex-1 bg-slate-300" />
            </div>
            {flight.isDirect
              ? <span className="text-xs text-emerald-600 font-medium">Direct</span>
              : <span className="text-xs text-orange-500 font-medium">{flight.stopSummary}</span>
            }
          </div>

          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-slate-900">{flight.destination}</p>
            <p className="text-sm font-semibold text-sky-700">{flight.formattedArrival}</p>
          </div>
        </div>

        {/* Details rows */}
        <div className="mb-4">
          <Row label="Airline" value={<span className="flex items-center gap-2">{flight.airline} <Badge variant={flight.providerTrust}>{flight.trustBadge}</Badge></span>} />
          <Row label="Flight type" value={flight.isDirect ? '✅ Direct' : `🔄 ${flight.stopSummary}`} />
          <Row label="Duration" value={formatDuration(flight.durationMinutes)} />
          <Row label="Baggage" value={`🧳 ${flight.baggageSummary}`} />
          <Row label="Source" value={flight.providerSource} />
          {flight.isMock && <Row label="Data" value={<Badge variant="mock">SAMPLE DATA</Badge>} />}
        </div>

        {/* Stops detail */}
        {flight.stops.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-3 mb-4">
            <p className="text-xs font-semibold text-orange-700 mb-2">Stopovers</p>
            {flight.stops.map((stop, i) => (
              <div key={i} className="text-sm text-orange-800">
                {stop.airport} ({stop.city}) — {formatDuration(stop.durationMinutes)} layover
              </div>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-3xl font-bold text-slate-900">{flight.formattedPrice}</p>
            <p className="text-xs text-slate-400">per person</p>
          </div>
          <a
            href={flight.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors min-h-[48px] flex items-center gap-2"
          >
            Book on {flight.airline} ↗
          </a>
        </div>
      </Card>
    </div>
  );
}
