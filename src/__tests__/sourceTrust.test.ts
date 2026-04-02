import { describe, it, expect, beforeEach } from 'vitest';
import { SourceRegistry } from '@/skills/sourceTrust/registry';
import { runSourceTrustSkill } from '@/skills/sourceTrust';
import { trustScore, isUsable } from '@/skills/sourceTrust/scoring';

describe('trustScore', () => {
  it('returns 100 for official', () => expect(trustScore('official')).toBe(100));
  it('returns 0 for blocked', () => expect(trustScore('blocked')).toBe(0));
  it('orders trust levels correctly', () => {
    expect(trustScore('official')).toBeGreaterThan(trustScore('trusted_partner'));
    expect(trustScore('trusted_partner')).toBeGreaterThan(trustScore('limited'));
    expect(trustScore('limited')).toBeGreaterThan(trustScore('unverified'));
  });
});

describe('isUsable', () => {
  it('marks official/trusted_partner/limited as usable', () => {
    expect(isUsable('official')).toBe(true);
    expect(isUsable('trusted_partner')).toBe(true);
    expect(isUsable('limited')).toBe(true);
  });
  it('marks blocked/unverified as not usable', () => {
    expect(isUsable('blocked')).toBe(false);
    expect(isUsable('unverified')).toBe(false);
  });
});

describe('SourceRegistry', () => {
  let registry: SourceRegistry;

  beforeEach(() => { registry = new SourceRegistry(); });

  it('returns approved sources (no blocked)', () => {
    const approved = registry.getApproved();
    expect(approved.every((s) => s.trustLevel !== 'blocked')).toBe(true);
  });

  it('filters by type', () => {
    const airlines = registry.getApproved(['airline']);
    expect(airlines.every((s) => s.type === 'airline')).toBe(true);
  });

  it('can update a source', () => {
    registry.updateSource('elal', { isActive: false });
    expect(registry.getById('elal')?.isActive).toBe(false);
  });

  it('isApproved returns false for blocked domain', () => {
    registry.blockDomain('scam.com');
    expect(registry.isApproved('scam.com')).toBe(false);
  });
});

describe('runSourceTrustSkill', () => {
  it('returns log with approved/blocked counts', () => {
    const result = runSourceTrustSkill({ types: ['airline'] });
    expect(result.approved.length).toBeGreaterThan(0);
    expect(result.log.skill).toBe('sourceTrust');
  });

  it('officialOnly mode excludes non-official sources', () => {
    const result = runSourceTrustSkill({ officialOnly: true });
    expect(result.approved.every((s) => s.isOfficial)).toBe(true);
  });
});
