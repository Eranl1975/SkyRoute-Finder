export type TrustLevel = 'official' | 'trusted_partner' | 'limited' | 'unverified' | 'blocked';

export interface SourceMetadata {
  id: string;
  name: string;
  domain: string;
  trustLevel: TrustLevel;
  type: 'airline' | 'hotel' | 'aggregator';
  country?: string;
  isActive: boolean;
  isOfficial: boolean;
  notes?: string;
  addedAt: string; // ISO
}

export interface TrustCheckResult {
  approved: SourceMetadata[];
  blocked: SourceMetadata[];
  limited: SourceMetadata[];
}
