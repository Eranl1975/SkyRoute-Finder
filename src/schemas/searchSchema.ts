import { z } from 'zod';

const today = () => new Date().toISOString().split('T')[0];

export const baggageSchema = z.object({
  checkedBags: z.number().int().min(0).max(10),
  checkedBagWeightKg: z.number().int().min(0).max(32),
  trolley: z.boolean(),
  trolleyCount: z.number().int().min(0).max(4),
});

// Base object — kept separate so .extend() can be called before refinements
const flightSearchParamsBase = z.object({
  origin: z.string().min(2, 'Origin required').max(100),
  destination: z.string().min(2, 'Destination required').max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  passengers: z.number().int().min(1, 'At least 1 passenger').max(9, 'Max 9 passengers'),
  airlineId: z.string().optional(),
  stopoverPreference: z.enum(['direct_only', 'include_stopovers', 'stopovers_only']),
  baggage: baggageSchema,
});

// Shared date refinements helper
function withDateRefinements<T extends typeof flightSearchParamsBase>(schema: T) {
  return schema
    .refine((d) => d.startDate >= today(), {
      message: 'Departure date cannot be in the past',
      path: ['startDate'],
    })
    .refine((d) => d.endDate >= d.startDate, {
      message: 'Return date must be after departure date',
      path: ['endDate'],
    });
}

export const flightSearchParamsSchema = withDateRefinements(flightSearchParamsBase);

export const searchParamsSchema = withDateRefinements(
  flightSearchParamsBase.extend({
    includeHotel: z.boolean().default(true),
    attractionKeyword: z.string().max(80).optional(),
  })
);

export type SearchParamsInput = z.input<typeof searchParamsSchema>;
export type SearchParamsOutput = z.output<typeof searchParamsSchema>;
