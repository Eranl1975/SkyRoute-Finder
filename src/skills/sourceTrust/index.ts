/**
 * Skill 1 — Source Trust & Discovery
 * Filters and classifies sources before any search begins.
 * Returns only approved, active, non-blocked sources.
 */
import { sourceRegistry } from './registry';
import { isUsable } from './scoring';
import type { SourceMetadata, TrustCheckResult } from '@/types/trust';
import type { SearchLog } from '@/types/search';
import { nowISO } from '@/lib/utils';
import { featureFlags } from '@/config/feature-flags';

export interface SourceTrustInput {
  types?: SourceMetadata['type'][];
  officialOnly?: boolean;
}

export interface SourceTrustOutput {
  approved: SourceMetadata[];
  blocked: SourceMetadata[];
  limited: SourceMetadata[];
  log: SearchLog;
}

export function runSourceTrustSkill(input: SourceTrustInput): SourceTrustOutput {
  const start = Date.now();
  const officialOnly = input.officialOnly ?? featureFlags.officialSitesOnlyMode;

  const all = sourceRegistry.getAll();
  const approved: SourceMetadata[] = [];
  const blocked: SourceMetadata[] = [];
  const limited: SourceMetadata[] = [];

  for (const source of all) {
    if (input.types && !input.types.includes(source.type)) continue;

    if (!source.isActive || source.trustLevel === 'blocked') {
      blocked.push(source);
      continue;
    }
    if (!isUsable(source.trustLevel)) {
      blocked.push(source);
      continue;
    }
    if (officialOnly && !source.isOfficial) {
      limited.push(source);
      continue;
    }
    if (source.trustLevel === 'limited') {
      limited.push(source);
    } else {
      approved.push(source);
    }
  }

  return {
    approved,
    blocked,
    limited,
    log: {
      timestamp: nowISO(),
      level: 'info',
      skill: 'sourceTrust',
      message: `Trust check: ${approved.length} approved, ${limited.length} limited, ${blocked.length} blocked`,
      durationMs: Date.now() - start,
    },
  };
}

export { sourceRegistry } from './registry';
export { trustScore, badgeColor } from './scoring';
export type { TrustCheckResult };
