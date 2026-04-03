/**
 * Skill 2 — Flight Search
 * Accepts validated params, queries approved adapters, deduplicates,
 * ranks, selects top-5 cheapest, and returns structured result.
 */
import type { FlightSearchParams, RawFlight, FlightSearchResult } from '@/types/flight';
import type { SourceMetadata } from '@/types/trust';
import type { IFlightProvider } from '@/providers/interfaces/FlightProvider';
import type { SearchLog } from '@/types/search';
import { deduplicateFlights } from './dedup';
import { normalizeFlights } from './ranking';
import { buildNotFoundExplanation, type NotFoundReason } from './explanations';
import { nowISO } from '@/lib/utils';

export interface FlightSearchInput {
  params: FlightSearchParams;
  approvedSources: SourceMetadata[];
  adapters: IFlightProvider[];
}

export interface FlightSearchSkillOutput {
  result: FlightSearchResult;
  logs: SearchLog[];
}

export async function runFlightSearchSkill(input: FlightSearchInput): Promise<FlightSearchSkillOutput> {
  const start = Date.now();
  const logs: SearchLog[] = [];
  const { params, adapters } = input;

  // Filter adapters to only approved ones
  const activeAdapters = adapters.filter((a) => {
    const source = input.approvedSources.find((s) => s.id === a.id);
    return source && a.isEnabled;
  });

  if (activeAdapters.length === 0) {
    const exp = buildNotFoundExplanation(params, ['source_unavailable']);
    logs.push({ timestamp: nowISO(), level: 'warn', skill: 'flightSearch', message: 'No active adapters' });
    return {
      result: { flights: [], totalFound: 0, returnedCount: 0, notFoundReasons: exp.messages, searchedAt: nowISO(), isMockData: false },
      logs,
    };
  }

  // Run all adapters (parallel)
  const rawResults = await Promise.allSettled(
    activeAdapters.map((adapter) =>
      adapter.search(params).catch((err) => {
        logs.push({
          timestamp: nowISO(),
          level: 'error',
          skill: 'flightSearch',
          message: `Adapter ${adapter.id} failed: ${String(err)}`,
        });
        return [] as RawFlight[];
      })
    )
  );

  const allRaw: RawFlight[] = rawResults.flatMap((r) =>
    r.status === 'fulfilled' ? r.value : []
  ).filter((f) => f.price > 0); // exclude deep-link placeholders (price=0)

  logs.push({
    timestamp: nowISO(),
    level: 'info',
    skill: 'flightSearch',
    message: `Raw results: ${allRaw.length} from ${activeAdapters.length} adapter(s)`,
  });

  // Apply stopover filter
  const filtered = allRaw.filter((f) => {
    if (params.stopoverPreference === 'direct_only') return f.isDirect;
    if (params.stopoverPreference === 'stopovers_only') return !f.isDirect;
    return true;
  });

  // Apply airline filter
  const airlineFiltered = params.airlineId
    ? filtered.filter((f) => f.airlineCode.toLowerCase() === params.airlineId!.toLowerCase())
    : filtered;

  const deduped = deduplicateFlights(airlineFiltered);
  const normalized = normalizeFlights(deduped);
  const isMock = normalized.some((f) => f.isMock);

  // Build not-found reasons
  const reasons: NotFoundReason[] = [];
  if (allRaw.length === 0) reasons.push('source_unavailable');
  if (allRaw.length > 0 && filtered.length === 0) reasons.push('stopover_preference_not_found');
  if (filtered.length > 0 && airlineFiltered.length === 0) reasons.push('airline_not_found');
  if (airlineFiltered.length > 0 && deduped.length === 0) reasons.push('no_results');

  const exp = reasons.length > 0 ? buildNotFoundExplanation(params, reasons) : null;

  logs.push({
    timestamp: nowISO(),
    level: 'info',
    skill: 'flightSearch',
    message: `Returning ${normalized.length} flights`,
    durationMs: Date.now() - start,
  });

  return {
    result: {
      flights: normalized,
      totalFound: deduped.length,
      returnedCount: normalized.length,
      notFoundReasons: exp?.messages ?? [],
      searchedAt: nowISO(),
      isMockData: isMock,
    },
    logs,
  };
}
