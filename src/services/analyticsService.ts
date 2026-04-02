/**
 * Analytics Service — Supabase-backed, free tier.
 * Logs search events to search_analytics table.
 * All operations are fire-and-forget (never block the user flow).
 */
import type { SearchParams, SearchResult } from '@/types/search';
import { env } from '@/lib/env';

export interface SearchAnalyticsEvent {
  origin: string;
  destination: string;
  passengers: number;
  stopover_preference: string;
  airline_id: string | null;
  flights_returned: number;
  hotel_returned: boolean;
  is_mock_data: boolean;
  duration_ms: number;
  status: 'success' | 'partial' | 'error';
  searched_at: string;
}

async function post(event: SearchAnalyticsEvent): Promise<void> {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return;
  try {
    await fetch(`${env.supabaseUrl}/rest/v1/search_analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${env.supabaseAnonKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(event),
    });
  } catch {
    // Analytics errors must never surface to the user
  }
}

export function logSearchEvent(params: SearchParams, result: SearchResult): void {
  const event: SearchAnalyticsEvent = {
    origin: params.origin,
    destination: params.destination,
    passengers: params.passengers,
    stopover_preference: params.stopoverPreference,
    airline_id: params.airlineId ?? null,
    flights_returned: result.flights.returnedCount,
    hotel_returned: !!result.hotel.recommended,
    is_mock_data: result.flights.isMockData,
    duration_ms: result.totalDurationMs,
    status: result.status,
    searched_at: result.completedAt,
  };
  void post(event);
}

export async function fetchAnalyticsSummary(): Promise<{
  totalSearches: number;
  avgFlightsReturned: number;
  topRoutes: { origin: string; destination: string; count: number }[];
  errorRate: number;
} | null> {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  try {
    const res = await fetch(
      `${env.supabaseUrl}/rest/v1/search_analytics?select=origin,destination,flights_returned,status&limit=1000`,
      {
        headers: {
          apikey: env.supabaseAnonKey,
          Authorization: `Bearer ${env.supabaseAnonKey}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows: SearchAnalyticsEvent[] = await res.json();

    const totalSearches = rows.length;
    const avgFlightsReturned = rows.length
      ? rows.reduce((s, r) => s + r.flights_returned, 0) / rows.length
      : 0;
    const errorCount = rows.filter((r) => r.status === 'error').length;
    const errorRate = totalSearches ? errorCount / totalSearches : 0;

    // Top routes
    const routeCounts: Record<string, number> = {};
    rows.forEach((r) => {
      const key = `${r.origin}→${r.destination}`;
      routeCounts[key] = (routeCounts[key] ?? 0) + 1;
    });
    const topRoutes = Object.entries(routeCounts)
      .map(([k, count]) => {
        const [origin, destination] = k.split('→');
        return { origin, destination, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalSearches, avgFlightsReturned: Math.round(avgFlightsReturned * 10) / 10, topRoutes, errorRate };
  } catch {
    return null;
  }
}
