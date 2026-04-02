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
import { generateId, nowISO } from '@/lib/utils';

const BOOKING_SEARCH = 'https://www.booking.com/searchresults.html';

function buildBookingUrl(params: HotelSearchParams): string {
  const u = new URL(BOOKING_SEARCH);
  u.searchParams.set('ss', params.destination);
  u.searchParams.set('checkin', params.checkIn);
  u.searchParams.set('checkout', params.checkOut);
  u.searchParams.set('no_rooms', '1');
  u.searchParams.set('group_adults', String(params.guests));
  u.searchParams.set('order', 'score');
  return u.toString();
}

export class BookingComAdapter implements IHotelProvider {
  readonly id = 'booking_com';
  readonly name = 'Booking.com';
  readonly trustLevel = 'trusted_partner' as const;
  readonly isEnabled = true;
  readonly isMock = false;

  async search(params: HotelSearchParams): Promise<RawHotel[]> {
    // TODO: replace with live Demand API call once API key available
    return [{
      id: generateId(),
      name: `Hotels in ${params.destination}`,
      address: params.destination,
      city: params.destination,
      touristArea: 'City Centre',
      stars: 0,
      rating: 0,
      reviewCount: 0,
      pricePerNight: 0,
      currency: 'USD',
      bookingUrl: buildBookingUrl(params),
      amenities: [],
      providerSource: 'booking.com',
      providerTrust: 'trusted_partner',
      isMock: true,
      fetchedAt: nowISO(),
    }];
  }
}
