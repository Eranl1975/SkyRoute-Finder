/**
 * Mock Flight Provider — returns realistic-looking data for development.
 * [MOCK] label is always set. Replace with live adapter for production.
 */
import type { IFlightProvider } from '@/providers/interfaces/FlightProvider';
import type { FlightSearchParams, RawFlight } from '@/types/flight';
import { generateId, nowISO } from '@/lib/utils';
import { addHours, addDays, parseISO } from 'date-fns';

const MOCK_FLIGHTS: Omit<RawFlight, 'origin' | 'destination' | 'departureAt' | 'arrivalAt' | 'id' | 'fetchedAt' | 'isMock'>[] = [
  {
    airline: 'Turkish Airlines',
    airlineCode: 'TK',
    price: 489,
    currency: 'USD',
    isDirect: false,
    stops: [{ airport: 'IST', city: 'Istanbul', durationMinutes: 90 }],
    baggage: { checkedBags: 1, checkedBagWeightKg: 23, trolley: true, trolleyCount: 1 },
    bookingUrl: 'https://www.turkishairlines.com',
    providerSource: 'turkishairlines.com',
    providerTrust: 'official',
  },
  {
    airline: 'easyJet',
    airlineCode: 'U2',
    price: 541,
    currency: 'USD',
    isDirect: false,
    stops: [{ airport: 'AMS', city: 'Amsterdam', durationMinutes: 75 }],
    baggage: { checkedBags: 0, checkedBagWeightKg: 0, trolley: true, trolleyCount: 1 },
    bookingUrl: 'https://www.easyjet.com',
    providerSource: 'easyjet.com',
    providerTrust: 'official',
  },
  {
    airline: 'Ryanair',
    airlineCode: 'FR',
    price: 598,
    currency: 'USD',
    isDirect: false,
    stops: [{ airport: 'CDG', city: 'Paris', durationMinutes: 80 }],
    baggage: { checkedBags: 0, checkedBagWeightKg: 0, trolley: false, trolleyCount: 0 },
    bookingUrl: 'https://www.ryanair.com',
    providerSource: 'ryanair.com',
    providerTrust: 'official',
  },
  {
    airline: 'British Airways',
    airlineCode: 'BA',
    price: 872,
    currency: 'USD',
    isDirect: true,
    stops: [],
    baggage: { checkedBags: 1, checkedBagWeightKg: 23, trolley: true, trolleyCount: 1 },
    bookingUrl: 'https://www.britishairways.com',
    providerSource: 'britishairways.com',
    providerTrust: 'official',
  },
  {
    airline: 'El Al',
    airlineCode: 'LY',
    price: 940,
    currency: 'USD',
    isDirect: true,
    stops: [],
    baggage: { checkedBags: 1, checkedBagWeightKg: 23, trolley: true, trolleyCount: 1 },
    bookingUrl: 'https://www.elal.com',
    providerSource: 'elal.com',
    providerTrust: 'official',
  },
];

export class MockFlightProvider implements IFlightProvider {
  readonly id = 'mock_flights';
  readonly name = 'Mock Flights [DEV]';
  readonly trustLevel = 'official' as const;
  readonly isEnabled = true;
  readonly isMock = true;

  async search(params: FlightSearchParams): Promise<RawFlight[]> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

    const departureBase = parseISO(params.startDate + 'T07:00:00.000Z');

    return MOCK_FLIGHTS.map((tpl, i): RawFlight => {
      const dep = addHours(addDays(departureBase, i % 3), i * 2);
      const arrHours = tpl.isDirect ? 4 : 7 + tpl.stops[0].durationMinutes / 60;
      const arr = addHours(dep, arrHours);

      return {
        ...tpl,
        id: generateId(),
        origin: params.origin,
        destination: params.destination,
        departureAt: dep.toISOString(),
        arrivalAt: arr.toISOString(),
        isMock: true,
        fetchedAt: nowISO(),
      };
    });
  }
}
