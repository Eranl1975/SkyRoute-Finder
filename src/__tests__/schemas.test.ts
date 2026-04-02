import { describe, it, expect } from 'vitest';
import { searchParamsSchema, baggageSchema } from '@/schemas/searchSchema';

const validParams = {
  origin: 'TLV',
  destination: 'LHR',
  startDate: '2099-06-01', // far future to avoid "past date" errors
  endDate: '2099-06-10',
  passengers: 2,
  stopoverPreference: 'direct_only' as const,
  baggage: { checkedBags: 1, checkedBagWeightKg: 20, trolley: true, trolleyCount: 1 },
  includeHotel: true,
};

describe('searchParamsSchema', () => {
  it('accepts valid params', () => {
    const result = searchParamsSchema.safeParse(validParams);
    expect(result.success).toBe(true);
  });

  it('rejects empty origin', () => {
    const result = searchParamsSchema.safeParse({ ...validParams, origin: '' });
    expect(result.success).toBe(false);
  });

  it('rejects end date before start date', () => {
    const result = searchParamsSchema.safeParse({ ...validParams, endDate: '2099-05-01' });
    expect(result.success).toBe(false);
  });

  it('rejects more than 9 passengers', () => {
    const result = searchParamsSchema.safeParse({ ...validParams, passengers: 10 });
    expect(result.success).toBe(false);
  });

  it('accepts 0 checked bags', () => {
    const result = searchParamsSchema.safeParse({
      ...validParams,
      baggage: { ...validParams.baggage, checkedBags: 0 },
    });
    expect(result.success).toBe(true);
  });
});

describe('baggageSchema', () => {
  it('rejects negative bags', () => {
    const result = baggageSchema.safeParse({ checkedBags: -1, checkedBagWeightKg: 20, trolley: true, trolleyCount: 1 });
    expect(result.success).toBe(false);
  });
});
