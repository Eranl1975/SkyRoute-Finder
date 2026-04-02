/**
 * El Al Adapter
 *
 * El Al has no free public data API.
 * This adapter constructs a direct booking search URL so users land on El Al
 * with origin/destination/dates pre-filled.
 *
 * For live pricing, options are:
 *   A) El Al official API partnership (developer@elal.co.il)
 *   B) GDS integration (Amadeus / Sabre) — requires commercial agreement
 *   C) Use mock provider for development (NEXT_PUBLIC_PROVIDER_MODE=mock)
 *
 * Price is marked as 0 and isMock=true so the UI shows "check site" rather
 * than displaying a false price.
 */
import type { IFlightProvider } from '@/providers/interfaces/FlightProvider';
import type { FlightSearchParams, RawFlight } from '@/types/flight';
import { generateId, nowISO } from '@/lib/utils';
import { parseISO, addHours } from 'date-fns';

const ELAL_SEARCH = 'https://www.elal.com/en/Flights-and-Destinations/pages/flight-search.aspx';

function buildElAlUrl(params: FlightSearchParams): string {
  const u = new URL(ELAL_SEARCH);
  u.searchParams.set('origin', params.origin.toUpperCase());
  u.searchParams.set('destination', params.destination.toUpperCase());
  u.searchParams.set('departDate', params.startDate);
  u.searchParams.set('returnDate', params.endDate);
  u.searchParams.set('adults', String(params.passengers));
  u.searchParams.set('tripType', 'R');
  return u.toString();
}

export class ElAlAdapter implements IFlightProvider {
  readonly id = 'elal';
  readonly name = 'El Al';
  readonly trustLevel = 'official' as const;
  readonly isEnabled = true;
  readonly isMock = false;

  async search(params: FlightSearchParams): Promise<RawFlight[]> {
    if (new Date(params.startDate) < new Date()) return [];

    const dep = parseISO(params.startDate + 'T07:00:00.000Z');
    const arr = addHours(dep, 5);

    return [{
      id: generateId(),
      airline: 'El Al',
      airlineCode: 'LY',
      origin: params.origin,
      destination: params.destination,
      departureAt: dep.toISOString(),
      arrivalAt: arr.toISOString(),
      price: 0,           // no live price — see bookingUrl
      currency: 'USD',
      isDirect: true,
      stops: [],
      baggage: { checkedBags: 1, checkedBagWeightKg: 23, trolley: true, trolleyCount: 1 },
      bookingUrl: buildElAlUrl(params),
      providerSource: 'elal.com',
      providerTrust: 'official',
      isMock: true,       // price not live
      fetchedAt: nowISO(),
    }];
  }
}
