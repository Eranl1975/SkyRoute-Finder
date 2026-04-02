/**
 * Skill 5 — Agent Orchestrator
 * Coordinates all skills in a deterministic flow.
 * Low-token design: each skill receives only what it needs.
 */
import type { OrchestratorInput, OrchestratorOutput } from './types';
import type { SearchLog } from '@/types/search';
import { runSourceTrustSkill } from '@/skills/sourceTrust';
import { runFlightSearchSkill } from '@/skills/flightSearch';
import { runHotelSearchSkill } from '@/skills/hotelSearch';
import { getProviderRegistry } from '@/providers/registry';
import { generateId, nowISO } from '@/lib/utils';

export async function runOrchestrator(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const requestId = generateId();
  const startedAt = Date.now();
  const logs: SearchLog[] = [];

  const log = (level: SearchLog['level'], skill: string, message: string, durationMs?: number) => {
    logs.push({ timestamp: nowISO(), level, skill, message, durationMs });
  };

  try {
    log('info', 'orchestrator', `Request ${requestId} started`);

    // Step 1: Source trust check
    const trustResult = runSourceTrustSkill({ types: ['airline', 'hotel'] });
    logs.push(trustResult.log);
    log('info', 'orchestrator', `Approved sources: ${trustResult.approved.map((s) => s.id).join(', ')}`);

    // Step 2: Get adapters from registry
    const registry = getProviderRegistry();

    // Step 3: Flight search (always)
    const flightResult = await runFlightSearchSkill({
      params: input.params,
      approvedSources: trustResult.approved,
      adapters: registry.flightAdapters,
    });
    logs.push(...flightResult.logs);

    // Step 4: Hotel search (optional)
    let hotelResult;
    if (input.params.includeHotel) {
      const hotelResult_ = await runHotelSearchSkill({
        params: {
          destination: input.params.destination,
          checkIn: input.params.startDate,
          checkOut: input.params.endDate,
          guests: input.params.passengers,
          attractionKeyword: input.params.attractionKeyword,
        },
        approvedSources: trustResult.approved,
        adapters: registry.hotelAdapters,
      });
      logs.push(...hotelResult_.logs);
      hotelResult = hotelResult_.result;
    } else {
      hotelResult = { recommended: null, alternatives: [], notFoundReasons: [], searchedAt: nowISO(), isMockData: false };
    }

    const totalDurationMs = Date.now() - startedAt;
    log('info', 'orchestrator', `Done in ${totalDurationMs}ms`, totalDurationMs);

    const hasFlights = flightResult.result.flights.length > 0;
    const status = hasFlights ? 'success' : flightResult.result.notFoundReasons.length > 0 ? 'partial' : 'error';

    return {
      requestId,
      params: input.params,
      flights: flightResult.result,
      hotel: hotelResult,
      logs,
      status,
      completedAt: nowISO(),
      totalDurationMs,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log('error', 'orchestrator', `Unhandled error: ${msg}`);
    return {
      requestId,
      params: input.params,
      flights: { flights: [], totalFound: 0, returnedCount: 0, notFoundReasons: [msg], searchedAt: nowISO(), isMockData: false },
      hotel: { recommended: null, alternatives: [], notFoundReasons: [], searchedAt: nowISO(), isMockData: false },
      logs,
      status: 'error',
      errorMessage: msg,
      completedAt: nowISO(),
      totalDurationMs: Date.now() - startedAt,
    };
  }
}
