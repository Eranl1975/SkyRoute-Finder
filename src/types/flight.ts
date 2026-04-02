import type { TrustLevel } from './trust';

export type StopoverPreference = 'direct_only' | 'include_stopovers' | 'stopovers_only';

export interface BaggageInfo {
  checkedBags: number;
  checkedBagWeightKg: number;
  trolley: boolean;
  trolleyCount: number;
}

export interface FlightStop {
  airport: string;
  city: string;
  durationMinutes: number;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  passengers: number;
  airlineId?: string; // undefined = all
  stopoverPreference: StopoverPreference;
  baggage: BaggageInfo;
}

export interface RawFlight {
  id: string;
  airline: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departureAt: string; // ISO
  arrivalAt: string;   // ISO
  price: number;
  currency: string;
  isDirect: boolean;
  stops: FlightStop[];
  baggage: BaggageInfo;
  bookingUrl: string;
  providerSource: string;
  providerTrust: TrustLevel;
  isMock: boolean;
  fetchedAt: string; // ISO
}

export interface NormalizedFlight extends RawFlight {
  rank: number;
  isCheapest: boolean;
  formattedPrice: string;
  formattedDeparture: string;
  formattedArrival: string;
  stopSummary: string;
  baggageSummary: string;
  trustBadge: string;
  durationMinutes: number;
}

export interface FlightSearchResult {
  flights: NormalizedFlight[];
  totalFound: number;
  returnedCount: number;
  notFoundReasons: string[];
  searchedAt: string;
  isMockData: boolean;
}
