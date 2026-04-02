/**
 * Provider Registry — returns the correct set of adapters based on provider mode.
 * In mock mode (default), only mock adapters are active.
 * In live mode, live adapters are used (when implemented).
 */
import type { IFlightProvider } from './interfaces/FlightProvider';
import type { IHotelProvider } from './interfaces/HotelProvider';
import { MockFlightProvider } from './adapters/mock/MockFlightProvider';
import { MockHotelProvider } from './adapters/mock/MockHotelProvider';
import { ElAlAdapter } from './adapters/airlines/ElAlAdapter';
import { RyanairAdapter } from './adapters/airlines/RyanairAdapter';
import { BookingComAdapter } from './adapters/hotels/BookingComAdapter';
import { env } from '@/lib/env';

export interface ProviderRegistry {
  flightAdapters: IFlightProvider[];
  hotelAdapters: IHotelProvider[];
}

let registryInstance: ProviderRegistry | null = null;

export function getProviderRegistry(): ProviderRegistry {
  if (registryInstance) return registryInstance;

  const isMock = env.isMockMode;

  // In live mode, include live adapters first + mock as fallback so results
  // are never empty when live APIs return nothing (e.g. routes with no fares).
  const flightAdapters: IFlightProvider[] = isMock
    ? [new MockFlightProvider()]
    : [new ElAlAdapter(), new RyanairAdapter(), new MockFlightProvider()];

  const hotelAdapters: IHotelProvider[] = isMock
    ? [new MockHotelProvider()]
    : [new BookingComAdapter(), new MockHotelProvider()];

  registryInstance = { flightAdapters, hotelAdapters };
  return registryInstance;
}

// For testing / admin override
export function resetProviderRegistry(): void {
  registryInstance = null;
}
