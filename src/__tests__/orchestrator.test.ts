import { describe, it, expect, vi } from 'vitest';
import { buildNotFoundExplanation } from '@/skills/flightSearch/explanations';
import { assertBookingEnabled } from '@/skills/bookingScaffold';
import type { FlightSearchParams } from '@/types/flight';

const baseParams: FlightSearchParams = {
  origin: 'TLV',
  destination: 'LHR',
  startDate: '2099-06-01',
  endDate: '2099-06-10',
  passengers: 2,
  stopoverPreference: 'include_stopovers',
  baggage: { checkedBags: 1, checkedBagWeightKg: 20, trolley: true, trolleyCount: 1 },
};

describe('buildNotFoundExplanation', () => {
  it('builds route not found message', () => {
    const result = buildNotFoundExplanation(baseParams, ['route_not_found']);
    expect(result.messages[0]).toContain('TLV');
    expect(result.messages[0]).toContain('LHR');
  });

  it('builds airline not found with airlineId', () => {
    const result = buildNotFoundExplanation({ ...baseParams, airlineId: 'elal' }, ['airline_not_found']);
    expect(result.messages[0]).toContain('elal');
  });

  it('handles multiple reasons', () => {
    const result = buildNotFoundExplanation(baseParams, ['route_not_found', 'source_unavailable']);
    expect(result.messages.length).toBe(2);
  });
});

describe('bookingScaffold', () => {
  it('throws when booking is disabled', () => {
    expect(() => assertBookingEnabled()).toThrow('Booking automation is disabled');
  });
});
