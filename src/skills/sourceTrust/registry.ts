import { TRUSTED_SOURCES, BLOCKED_DOMAINS } from '@/config/trusted-sources';
import type { SourceMetadata, TrustLevel } from '@/types/trust';

export class SourceRegistry {
  private sources: Map<string, SourceMetadata>;
  private blockedDomains: Set<string>;

  constructor() {
    this.sources = new Map(TRUSTED_SOURCES.map((s) => [s.id, s]));
    this.blockedDomains = new Set(BLOCKED_DOMAINS);
  }

  getAll(): SourceMetadata[] {
    return [...this.sources.values()];
  }

  getById(id: string): SourceMetadata | undefined {
    return this.sources.get(id);
  }

  getByType(type: SourceMetadata['type']): SourceMetadata[] {
    return this.getAll().filter((s) => s.type === type);
  }

  getApproved(types?: SourceMetadata['type'][]): SourceMetadata[] {
    return this.getAll().filter((s) => {
      if (!s.isActive) return false;
      if (s.trustLevel === 'blocked') return false;
      if (this.blockedDomains.has(s.domain)) return false;
      if (types && !types.includes(s.type)) return false;
      return true;
    });
  }

  isApproved(idOrDomain: string): boolean {
    // Check by domain first
    if (this.blockedDomains.has(idOrDomain)) return false;
    const byId = this.sources.get(idOrDomain);
    if (byId) return byId.isActive && byId.trustLevel !== 'blocked';
    const byDomain = [...this.sources.values()].find((s) => s.domain === idOrDomain);
    if (byDomain) return byDomain.isActive && byDomain.trustLevel !== 'blocked';
    return false;
  }

  updateSource(id: string, patch: Partial<SourceMetadata>): void {
    const existing = this.sources.get(id);
    if (existing) {
      this.sources.set(id, { ...existing, ...patch });
    }
  }

  addSource(source: SourceMetadata): void {
    this.sources.set(source.id, source);
  }

  blockDomain(domain: string): void {
    this.blockedDomains.add(domain);
  }

  getTrustLevel(id: string): TrustLevel {
    return this.sources.get(id)?.trustLevel ?? 'unverified';
  }
}

// Singleton instance
export const sourceRegistry = new SourceRegistry();
