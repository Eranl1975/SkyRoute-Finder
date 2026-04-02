import type { SearchParams, SearchResult, SearchStatus, SearchLog } from '@/types/search';

export interface OrchestratorInput {
  params: SearchParams;
  locale?: string;
}

export interface OrchestratorOutput extends SearchResult {
  status: 'success' | 'partial' | 'error';
}

export interface OrchestratorState {
  requestId: string;
  status: SearchStatus;
  logs: SearchLog[];
  startedAt: string;
}
