/**
 * Skill 3 — Hotel Search
 * Finds highest-rated hotel in tourist area for destination.
 */
import type { HotelSearchParams, RawHotel, HotelSearchResult, NormalizedHotel } from '@/types/hotel';
import type { SourceMetadata } from '@/types/trust';
import type { IHotelProvider } from '@/providers/interfaces/HotelProvider';
import type { SearchLog } from '@/types/search';
import { rankHotels } from './scoring';
import { attractionNote } from './attractionScoring';
import { formatPrice } from '@/lib/utils';
import { TRUST_BADGE_LABELS } from '@/lib/constants';
import { nowISO } from '@/lib/utils';

export interface HotelSearchInput {
  params: HotelSearchParams;
  approvedSources: SourceMetadata[];
  adapters: IHotelProvider[];
}

export interface HotelSearchSkillOutput {
  result: HotelSearchResult;
  logs: SearchLog[];
}

function normalizeHotel(h: RawHotel, kw?: string): NormalizedHotel {
  const note = kw ? attractionNote(h.city, h.touristArea, kw) : undefined;
  return {
    ...h,
    formattedPrice: formatPrice(h.pricePerNight, h.currency),
    formattedRating: `${h.rating.toFixed(1)} / 10`,
    trustBadge: TRUST_BADGE_LABELS[h.providerTrust] ?? h.providerTrust,
    touristAreaNote: `Located in ${h.touristArea}, ${h.city}`,
    attractionNote: note || undefined,
  };
}

export async function runHotelSearchSkill(input: HotelSearchInput): Promise<HotelSearchSkillOutput> {
  const start = Date.now();
  const logs: SearchLog[] = [];

  const activeAdapters = input.adapters.filter((a) => {
    const source = input.approvedSources.find((s) => s.id === a.id);
    return source && a.isEnabled;
  });

  if (activeAdapters.length === 0) {
    logs.push({ timestamp: nowISO(), level: 'warn', skill: 'hotelSearch', message: 'No active hotel adapters' });
    return {
      result: { recommended: null, alternatives: [], notFoundReasons: ['No hotel sources available'], searchedAt: nowISO(), isMockData: false },
      logs,
    };
  }

  const rawResults = await Promise.allSettled(
    activeAdapters.map((a) =>
      a.search(input.params).catch((err) => {
        logs.push({ timestamp: nowISO(), level: 'error', skill: 'hotelSearch', message: `${a.id} failed: ${String(err)}` });
        return [] as RawHotel[];
      })
    )
  );

  const allRaw: RawHotel[] = rawResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  if (allRaw.length === 0) {
    logs.push({ timestamp: nowISO(), level: 'warn', skill: 'hotelSearch', message: 'No hotels returned', durationMs: Date.now() - start });
    return {
      result: { recommended: null, alternatives: [], notFoundReasons: [`No hotels found in ${input.params.destination}`], searchedAt: nowISO(), isMockData: false },
      logs,
    };
  }

  const kw = input.params.attractionKeyword;
  const ranked = rankHotels(allRaw, kw);
  const [best, ...rest] = ranked;
  const isMock = allRaw.some((h) => h.isMock);

  const kwNote = kw ? ` (attraction: ${kw})` : '';
  logs.push({ timestamp: nowISO(), level: 'info', skill: 'hotelSearch', message: `${allRaw.length} hotels → recommended: ${best.name}${kwNote}`, durationMs: Date.now() - start });

  return {
    result: {
      recommended: normalizeHotel(best, kw),
      alternatives: rest.slice(0, 2).map((h) => normalizeHotel(h, kw)),
      notFoundReasons: [],
      searchedAt: nowISO(),
      isMockData: isMock,
    },
    logs,
  };
}
