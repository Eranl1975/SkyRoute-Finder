import type { RawFlight, NormalizedFlight } from '@/types/flight';
import { MAX_FLIGHT_RESULTS } from '@/lib/constants';
import { trustScore } from '@/skills/sourceTrust/scoring';
import { formatPrice, formatDateTime, formatDuration, flightDuration } from '@/lib/utils';
import { TRUST_BADGE_LABELS } from '@/lib/constants';

/** Rank: price ASC → trust DESC → stops ASC */
export function rankFlights(flights: RawFlight[]): RawFlight[] {
  return [...flights].sort((a, b) => {
    // 1. Price ascending
    if (a.price !== b.price) return a.price - b.price;
    // 2. Trust descending
    const td = trustScore(b.providerTrust) - trustScore(a.providerTrust);
    if (td !== 0) return td;
    // 3. Fewer stops preferred
    return a.stops.length - b.stops.length;
  });
}

export function normalizeFlights(flights: RawFlight[]): NormalizedFlight[] {
  const ranked = rankFlights(flights).slice(0, MAX_FLIGHT_RESULTS);

  return ranked.map((f, idx) => {
    const duration = flightDuration(f.departureAt, f.arrivalAt);
    const stopCount = f.stops.length;
    const stopSummary = f.isDirect
      ? 'Direct'
      : `${stopCount} stop${stopCount !== 1 ? 's' : ''}${
          f.stops[0] ? ` via ${f.stops[0].city}` : ''
        }`;

    const baggageParts: string[] = [];
    if (f.baggage.checkedBags > 0)
      baggageParts.push(`${f.baggage.checkedBags}×${f.baggage.checkedBagWeightKg}kg`);
    if (f.baggage.trolley)
      baggageParts.push(`${f.baggage.trolleyCount} trolley`);

    return {
      ...f,
      rank: idx + 1,
      isCheapest: idx === 0,
      formattedPrice: formatPrice(f.price, f.currency),
      formattedDeparture: formatDateTime(f.departureAt),
      formattedArrival: formatDateTime(f.arrivalAt),
      stopSummary,
      baggageSummary: baggageParts.join(', ') || 'No checked baggage',
      trustBadge: TRUST_BADGE_LABELS[f.providerTrust] ?? f.providerTrust,
      durationMinutes: duration,
    } satisfies NormalizedFlight;
  });
}
