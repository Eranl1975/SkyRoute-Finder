import type { RawFlight } from '@/types/flight';
import { trustScore } from '@/skills/sourceTrust/scoring';

/** Dedup flights with same airline+route+departure time.
 *  Keep the one with the highest trust score (prefer official source). */
export function deduplicateFlights(flights: RawFlight[]): RawFlight[] {
  const seen = new Map<string, RawFlight>();

  for (const flight of flights) {
    // Canonical key: airline + origin + destination + departure time (hour precision)
    const key = [
      flight.airlineCode,
      flight.origin,
      flight.destination,
      flight.departureAt.slice(0, 13), // YYYY-MM-DDTHH
    ].join('|');

    const existing = seen.get(key);
    if (!existing || trustScore(flight.providerTrust) > trustScore(existing.providerTrust)) {
      seen.set(key, flight);
    }
  }

  return [...seen.values()];
}
