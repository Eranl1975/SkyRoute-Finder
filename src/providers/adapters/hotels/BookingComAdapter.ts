/**
 * Booking.com Adapter
 *
 * Booking.com Demand API requires free partner signup.
 * Apply at: https://www.booking.com/affiliate-program
 * Once approved, add BOOKING_COM_API_KEY to .env.local and replace the
 * stub below with a real fetch to:
 *   https://distribution-xml.booking.com/2.0/json/searchHotels?...
 *
 * Until then, this adapter produces a search deep-link result (isMock=true).
 */
import type { IHotelProvider } from '@/providers/interfaces/HotelProvider';
import type { HotelSearchParams, RawHotel } from '@/types/hotel';

export class BookingComAdapter implements IHotelProvider {
  readonly id = 'booking_com';
  readonly name = 'Booking.com';
  readonly trustLevel = 'trusted_partner' as const;
  readonly isEnabled = true;
  readonly isMock = false;

  async search(_params: HotelSearchParams): Promise<RawHotel[]> {
    // No API key configured — return empty so mock provider serves as fallback.
    // To enable: add BOOKING_COM_API_KEY to Vercel env vars and implement
    // the live fetch to https://distribution-xml.booking.com/2.0/json/searchHotels
    return [];
  }
}
