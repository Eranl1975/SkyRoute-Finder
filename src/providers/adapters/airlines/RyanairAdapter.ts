/**
 * Ryanair Live Adapter
 *
 * Uses Ryanair's publicly accessible fares API — no API key required.
 * Same endpoint Ryanair.com uses. Falls back silently on error.
 * Routes not operated by Ryanair return empty (not an error).
 *
 * Rate guidance: ≤ 1 req/sec to avoid throttling.
 */
import type { IFlightProvider } from '@/providers/interfaces/FlightProvider';
import type { FlightSearchParams, RawFlight } from '@/types/flight';
import { generateId, nowISO } from '@/lib/utils';

const FARES_API = 'https://services-api.ryanair.com/farfnd/v4/oneWayFares';
const BOOKING_BASE = 'https://www.ryanair.com/gb/en/booking/new-booking';

interface RyanairFare {
  outbound: {
    departureAirport: { iataCode: string };
    arrivalAirport: { iataCode: string };
    departureDate: string;
    arrivalDate: string;
    price: { value: number; currencyCode: string };
  };
}

function bookingUrl(params: FlightSearchParams, depDate: string): string {
  const u = new URL(BOOKING_BASE);
  u.searchParams.set('ADT', String(params.passengers));
  u.searchParams.set('CHD', '0');
  u.searchParams.set('DateOut', depDate.split('T')[0]);
  u.searchParams.set('Destination', params.destination.toUpperCase());
  u.searchParams.set('Origin', params.origin.toUpperCase());
  u.searchParams.set('RoundTrip', 'false');
  return u.toString();
}

export class RyanairAdapter implements IFlightProvider {
  readonly id = 'ryanair';
  readonly name = 'Ryanair';
  readonly trustLevel = 'official' as const;
  readonly isEnabled = true;
  readonly isMock = false;

  async search(params: FlightSearchParams): Promise<RawFlight[]> {
    try {
      const url = new URL(FARES_API);
      url.searchParams.set('departureAirportIataCode', params.origin.toUpperCase());
      url.searchParams.set('arrivalAirportIataCode', params.destination.toUpperCase());
      url.searchParams.set('outboundDepartureDateFrom', params.startDate);
      url.searchParams.set('outboundDepartureDateTo', params.endDate);
      url.searchParams.set('market', 'en-gb');
      url.searchParams.set('offset', '0');
      url.searchParams.set('limit', '10');
      url.searchParams.set('priceValueTo', '99999');

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);

      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (!res.ok) return [];

      const data: { fares?: RyanairFare[] } = await res.json();

      return (data.fares ?? []).map((fare): RawFlight => ({
        id: generateId(),
        airline: 'Ryanair',
        airlineCode: 'FR',
        origin: fare.outbound.departureAirport.iataCode,
        destination: fare.outbound.arrivalAirport.iataCode,
        departureAt: fare.outbound.departureDate,
        arrivalAt: fare.outbound.arrivalDate,
        price: fare.outbound.price.value,
        currency: fare.outbound.price.currencyCode,
        isDirect: true,
        stops: [],
        baggage: {
          checkedBags: params.baggage.checkedBags,
          checkedBagWeightKg: 20,
          trolley: params.baggage.trolley,
          trolleyCount: params.baggage.trolleyCount,
        },
        bookingUrl: bookingUrl(params, fare.outbound.departureDate),
        providerSource: 'ryanair.com',
        providerTrust: 'official',
        isMock: false,
        fetchedAt: nowISO(),
      }));
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.warn('[RyanairAdapter]', (err as Error)?.message);
      }
      return [];
    }
  }
}
