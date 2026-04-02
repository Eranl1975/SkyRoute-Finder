import type { FlightSearchParams, RawFlight } from '@/types/flight';
import type { TrustLevel } from '@/types/trust';

export interface IFlightProvider {
  readonly id: string;
  readonly name: string;
  readonly trustLevel: TrustLevel;
  readonly isEnabled: boolean;
  readonly isMock: boolean;
  search(params: FlightSearchParams): Promise<RawFlight[]>;
}
