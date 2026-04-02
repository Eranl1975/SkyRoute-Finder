import { z } from 'zod';
import { trustLevelSchema } from './providerSchema';

export const rawHotelSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  touristArea: z.string(),
  stars: z.number().int().min(0).max(5),
  rating: z.number().min(0).max(10),
  reviewCount: z.number().int().min(0),
  pricePerNight: z.number().positive(),
  currency: z.string().length(3),
  bookingUrl: z.string().url(),
  imageUrl: z.string().url().optional(),
  amenities: z.array(z.string()),
  providerSource: z.string(),
  providerTrust: trustLevelSchema,
  isMock: z.boolean(),
  fetchedAt: z.string().datetime(),
});

export type RawHotelSchema = z.infer<typeof rawHotelSchema>;
