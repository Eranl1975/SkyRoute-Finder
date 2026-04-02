import { z } from 'zod';
import { trustLevelSchema } from './providerSchema';

export const flightStopSchema = z.object({
  airport: z.string(),
  city: z.string(),
  durationMinutes: z.number().int().min(0),
});

export const rawFlightSchema = z.object({
  id: z.string(),
  airline: z.string(),
  airlineCode: z.string(),
  origin: z.string(),
  destination: z.string(),
  departureAt: z.string().datetime(),
  arrivalAt: z.string().datetime(),
  price: z.number().positive(),
  currency: z.string().length(3),
  isDirect: z.boolean(),
  stops: z.array(flightStopSchema),
  baggage: z.object({
    checkedBags: z.number().int().min(0),
    checkedBagWeightKg: z.number().min(0),
    trolley: z.boolean(),
    trolleyCount: z.number().int().min(0),
  }),
  bookingUrl: z.string().url(),
  providerSource: z.string(),
  providerTrust: trustLevelSchema,
  isMock: z.boolean(),
  fetchedAt: z.string().datetime(),
});

export type RawFlightSchema = z.infer<typeof rawFlightSchema>;
