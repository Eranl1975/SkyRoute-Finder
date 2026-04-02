import { z } from 'zod';

export const trustLevelSchema = z.enum([
  'official',
  'trusted_partner',
  'limited',
  'unverified',
  'blocked',
]);

export const sourceMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  trustLevel: trustLevelSchema,
  type: z.enum(['airline', 'hotel', 'aggregator']),
  country: z.string().optional(),
  isActive: z.boolean(),
  isOfficial: z.boolean(),
  notes: z.string().optional(),
  addedAt: z.string().datetime(),
});

export type SourceMetadataSchema = z.infer<typeof sourceMetadataSchema>;
export type TrustLevelSchema = z.infer<typeof trustLevelSchema>;
