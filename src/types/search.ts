import type { FlightSearchParams, FlightSearchResult } from './flight';
import type { HotelSearchResult } from './hotel';

export interface SearchParams extends FlightSearchParams {
  includeHotel: boolean;
  attractionKeyword?: string;
}

export type SearchStatus =
  | 'idle'
  | 'validating'
  | 'trust_check'
  | 'searching_flights'
  | 'searching_hotel'
  | 'normalizing'
  | 'done'
  | 'error';

export interface SearchLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  skill: string;
  message: string;
  durationMs?: number;
}

export interface SearchResult {
  requestId: string;
  params: SearchParams;
  flights: FlightSearchResult;
  hotel: HotelSearchResult;
  logs: SearchLog[];
  status: 'success' | 'partial' | 'error';
  errorMessage?: string;
  completedAt: string;
  totalDurationMs: number;
}

export type SortOption = 'cheapest' | 'earliest' | 'recommended';

export interface SavedSearch {
  id: string;
  userId?: string;
  params: SearchParams;
  name?: string;
  savedAt: string;
}

export interface RecentSearch extends SavedSearch {
  result?: Pick<SearchResult, 'flights' | 'hotel'>;
}
