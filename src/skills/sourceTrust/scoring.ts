import { TRUST_SCORE } from '@/lib/constants';
import type { TrustLevel } from '@/types/trust';

export function trustScore(level: TrustLevel): number {
  return TRUST_SCORE[level] ?? 0;
}

export function isUsable(level: TrustLevel): boolean {
  return level !== 'blocked' && level !== 'unverified';
}

export function sortByTrust<T extends { providerTrust: TrustLevel }>(items: T[]): T[] {
  return [...items].sort((a, b) => trustScore(b.providerTrust) - trustScore(a.providerTrust));
}

export function preferHighestTrust<T extends { providerTrust: TrustLevel }>(
  items: T[]
): T | undefined {
  return sortByTrust(items)[0];
}

export function badgeColor(level: TrustLevel): string {
  switch (level) {
    case 'official':       return 'bg-green-100 text-green-800';
    case 'trusted_partner':return 'bg-blue-100 text-blue-800';
    case 'limited':        return 'bg-yellow-100 text-yellow-800';
    case 'unverified':     return 'bg-gray-100 text-gray-700';
    case 'blocked':        return 'bg-red-100 text-red-800';
  }
}
