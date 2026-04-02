import { NextRequest, NextResponse } from 'next/server';
import { executeSearch } from '@/services/searchService';
import { logSearchEvent } from '@/services/analyticsService';
import type { SearchParams } from '@/types/search';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error, fromCache } = await executeSearch(body);

    if (error || !data) {
      return NextResponse.json({ error: error ?? 'Search failed' }, { status: 400 });
    }

    // Fire-and-forget analytics — never blocks response
    if (!fromCache) {
      logSearchEvent(body as SearchParams, data);
    }

    return NextResponse.json(data, {
      headers: fromCache ? { 'X-Cache': 'HIT' } : { 'X-Cache': 'MISS' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
