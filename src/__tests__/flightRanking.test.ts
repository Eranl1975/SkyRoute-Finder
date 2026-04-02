import { describe, it, expect } from 'vitest';
import { rankFlights, normalizeFlights } from '@/skills/flightSearch/ranking';
import { deduplicateFlights } from '@/skills/flightSearch/dedup';
import type { RawFlight } from '@/types/flight';

function makeFlight(overrides: Partial<RawFlight> = {}): RawFlight {
  return {
    id: Math.random().toString(36).slice(2),
    airline: 'Test Air',
    airlineCode: 'TX',
    origin: 'TLV',
    destination: 'LHR',
    departureAt: '2099-06-01T10:00:00.000Z',
    arrivalAt: '2099-06-01T14:00:00.000Z',
    price: 500,
    currency: 'USD',
    isDirect: true,
    stops: [],
    baggage: { checkedBags: 1, checkedBagWeightKg: 20, trolley: true, trolleyCount: 1 },
    bookingUrl: 'https://example.com',
    providerSource: 'example.com',
    providerTrust: 'official',
    isMock: true,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('rankFlights', () => {
  it('sorts by price ascending', () => {
    const flights = [makeFlight({ price: 900 }), makeFlight({ price: 400 }), makeFlight({ price: 700 })];
    const ranked = rankFlights(flights);
    expect(ranked[0].price).toBe(400);
    expect(ranked[1].price).toBe(700);
    expect(ranked[2].price).toBe(900);
  });

  it('prefers higher trust when prices equal', () => {
    const a = makeFlight({ price: 500, providerTrust: 'limited' });
    const b = makeFlight({ price: 500, providerTrust: 'official' });
    const ranked = rankFlights([a, b]);
    expect(ranked[0].providerTrust).toBe('official');
  });

  it('prefers fewer stops when price and trust equal', () => {
    const direct = makeFlight({ price: 500, isDirect: true, stops: [] });
    const withStop = makeFlight({ price: 500, isDirect: false, stops: [{ airport: 'IST', city: 'Istanbul', durationMinutes: 90 }] });
    const ranked = rankFlights([withStop, direct]);
    expect(ranked[0].isDirect).toBe(true);
  });
});

describe('normalizeFlights', () => {
  it('marks first as cheapest', () => {
    const flights = [makeFlight({ price: 600 }), makeFlight({ price: 400 }), makeFlight({ price: 800 })];
    const normalized = normalizeFlights(flights);
    expect(normalized[0].isCheapest).toBe(true);
    expect(normalized[1].isCheapest).toBe(false);
  });

  it('returns at most 5 results', () => {
    const flights = Array.from({ length: 10 }, (_, i) => makeFlight({ price: 300 + i * 50 }));
    expect(normalizeFlights(flights).length).toBeLessThanOrEqual(5);
  });

  it('assigns sequential ranks', () => {
    const flights = [makeFlight({ price: 500 }), makeFlight({ price: 600 })];
    const normalized = normalizeFlights(flights);
    expect(normalized[0].rank).toBe(1);
    expect(normalized[1].rank).toBe(2);
  });
});

describe('deduplicateFlights', () => {
  it('deduplicates same airline + route + hour', () => {
    const base = makeFlight({ airlineCode: 'LY', price: 500, providerTrust: 'limited' });
    const better = makeFlight({ airlineCode: 'LY', price: 500, providerTrust: 'official' });
    const deduped = deduplicateFlights([base, better]);
    expect(deduped.length).toBe(1);
    expect(deduped[0].providerTrust).toBe('official');
  });

  it('keeps distinct airlines', () => {
    const f1 = makeFlight({ airlineCode: 'LY' });
    const f2 = makeFlight({ airlineCode: 'BA' });
    expect(deduplicateFlights([f1, f2]).length).toBe(2);
  });
});
