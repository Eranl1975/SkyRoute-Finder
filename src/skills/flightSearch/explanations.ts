import type { FlightSearchParams } from '@/types/flight';

export type NotFoundReason =
  | 'route_not_found'
  | 'date_range_not_found'
  | 'airline_not_found'
  | 'baggage_condition_not_found'
  | 'stopover_preference_not_found'
  | 'source_unavailable'
  | 'no_results';

export interface NotFoundExplanation {
  reasons: NotFoundReason[];
  messages: string[];
}

export function buildNotFoundExplanation(
  params: FlightSearchParams,
  reasons: NotFoundReason[]
): NotFoundExplanation {
  const messages: string[] = reasons.map((r) => {
    switch (r) {
      case 'route_not_found':
        return `Route not found: ${params.origin} → ${params.destination}`;
      case 'date_range_not_found':
        return `No flights available between ${params.startDate} and ${params.endDate}`;
      case 'airline_not_found':
        return params.airlineId
          ? `Airline "${params.airlineId}" does not operate this route`
          : 'No airline found for this route';
      case 'baggage_condition_not_found':
        return `No flights matching your baggage requirements (${params.baggage.checkedBags}×${params.baggage.checkedBagWeightKg}kg checked)`;
      case 'stopover_preference_not_found':
        return `No flights matching stopover preference: ${params.stopoverPreference.replace(/_/g, ' ')}`;
      case 'source_unavailable':
        return 'One or more search sources are currently unavailable';
      case 'no_results':
        return 'No flights found for the given criteria';
    }
  });

  return { reasons, messages };
}
