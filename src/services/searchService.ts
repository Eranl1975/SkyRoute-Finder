import type { SearchParams, SearchResult } from '@/types/search';
import { searchParamsSchema } from '@/schemas/searchSchema';
import { runOrchestrator } from '@/skills/orchestrator';
import { searchCache } from './cacheService';

export interface SearchServiceResult {
  data: SearchResult | null;
  error: string | null;
  fromCache: boolean;
}

export async function executeSearch(rawParams: unknown): Promise<SearchServiceResult> {
  // Validate input
  const parsed = searchParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(', ');
    return { data: null, error: msg, fromCache: false };
  }

  const params = parsed.data as SearchParams;

  // Check cache
  const cached = searchCache.get(params);
  if (cached) {
    return { data: cached, error: null, fromCache: true };
  }

  try {
    const result = await runOrchestrator({ params });
    searchCache.set(params, result);
    return { data: result, error: null, fromCache: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, error: msg, fromCache: false };
  }
}
