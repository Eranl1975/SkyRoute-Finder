/**
 * Booking.com via RapidAPI (apidojo/booking)
 *
 * Free-tier signup at: https://rapidapi.com/apidojo/api/booking
 * Add RAPIDAPI_BOOKING_KEY to Vercel env vars (server-side only, no NEXT_PUBLIC_).
 *
 * Flow:
 *   1. POST /v1/hotels/locations → resolve city dest_id + dest_type
 *   2. GET  /v2/hotels/search   → fetch top hotels for those dates
 */
import type { IHotelProvider } from '@/providers/interfaces/HotelProvider';
import type { HotelSearchParams, RawHotel } from '@/types/hotel';
import { generateId, nowISO } from '@/lib/utils';

const HOST = 'booking-com.p.rapidapi.com';
const BASE = `https://${HOST}`;

interface RapidLocation {
  dest_id: string;
  dest_type: string;
  label?: string;
  city_name?: string;
}

interface RapidHotel {
  hotel_id?: number;
  hotel_name?: string;
  name?: string;
  address?: string;
  city?: string;
  district?: string;
  review_score?: number;
  review_nr?: number;
  stars?: number;
  min_total_price?: number;
  price_breakdown?: { gross_price?: number; currency?: string };
  url?: string;
  top_ufi_benefits?: Array<{ translated_name: string }>;
  checkin?: { from?: string };
  checkout?: { until?: string };
}

export class BookingComRapidAdapter implements IHotelProvider {
  readonly id = 'booking_com_rapid';
  readonly name = 'Booking.com (Live)';
  readonly trustLevel = 'trusted_partner' as const;
  readonly isEnabled = Boolean(process.env.RAPIDAPI_BOOKING_KEY);
  readonly isMock = false;

  private get headers() {
    return {
      'x-rapidapi-key': process.env.RAPIDAPI_BOOKING_KEY ?? '',
      'x-rapidapi-host': HOST,
    };
  }

  async search(params: HotelSearchParams): Promise<RawHotel[]> {
    const apiKey = process.env.RAPIDAPI_BOOKING_KEY;
    if (!apiKey) return [];

    try {
      // Step 1: resolve destination → dest_id
      const locUrl = `${BASE}/v1/hotels/locations?name=${encodeURIComponent(params.destination)}&locale=en-gb`;
      const locRes = await fetch(locUrl, { headers: this.headers, signal: AbortSignal.timeout(8000) });
      if (!locRes.ok) return [];

      const locations: RapidLocation[] = await locRes.json().catch(() => []);
      const loc = locations.find((l) => l.dest_type === 'city' || l.dest_type === 'district') ?? locations[0];
      if (!loc?.dest_id) return [];

      // Step 2: search hotels
      const nights = Math.max(1, Math.round(
        (new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / 86400000
      ));

      const qs = new URLSearchParams({
        dest_id: loc.dest_id,
        dest_type: loc.dest_type,
        checkin_date: params.checkIn,
        checkout_date: params.checkOut,
        adults_number: String(params.guests),
        room_number: '1',
        order_by: 'popularity',
        filter_by_currency: 'USD',
        locale: 'en-gb',
        units: 'metric',
        page_number: '0',
      });

      const searchRes = await fetch(`${BASE}/v2/hotels/search?${qs}`, {
        headers: this.headers,
        signal: AbortSignal.timeout(12000),
      });
      if (!searchRes.ok) return [];

      const body = await searchRes.json().catch(() => null);
      const hotels: RapidHotel[] = Array.isArray(body?.result) ? body.result : [];

      return hotels.slice(0, 5).map((h): RawHotel => {
        const name = h.hotel_name ?? h.name ?? 'Unknown Hotel';
        const pricePerNight = h.min_total_price
          ? h.min_total_price / nights
          : (h.price_breakdown?.gross_price ?? 0) / nights;

        // Pre-filled Booking.com URL — hotel_id selects specific hotel in search
        const bookingUrl = h.hotel_id
          ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(params.destination)}&checkin=${params.checkIn}&checkout=${params.checkOut}&group_adults=${params.guests}&no_rooms=1&selected_hotel_id=${h.hotel_id}`
          : `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(params.destination)}&checkin=${params.checkIn}&checkout=${params.checkOut}&group_adults=${params.guests}&no_rooms=1`;

        const amenities = (h.top_ufi_benefits ?? [])
          .slice(0, 5)
          .map((b) => b.translated_name)
          .filter(Boolean);

        return {
          id: generateId(),
          name,
          address: h.address ?? '',
          city: h.city ?? params.destination,
          touristArea: h.district ?? h.city ?? params.destination,
          stars: Math.min(5, Math.max(0, Math.round(h.stars ?? 0))),
          rating: h.review_score ?? 0,
          reviewCount: h.review_nr ?? 0,
          pricePerNight: Math.round(pricePerNight * 100) / 100,
          currency: 'USD',
          bookingUrl,
          imageUrl: undefined,
          amenities: amenities.length ? amenities : ['Free WiFi'],
          providerSource: 'booking.com',
          providerTrust: 'trusted_partner',
          isMock: false,
          fetchedAt: nowISO(),
        };
      });
    } catch {
      return []; // fall through to mock provider
    }
  }
}
