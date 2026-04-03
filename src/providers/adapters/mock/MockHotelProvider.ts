/**
 * Mock Hotel Provider — returns realistic hotel data for development.
 * [MOCK] Replace with live Booking.com / Hotels.com adapter for production.
 */
import type { IHotelProvider } from '@/providers/interfaces/HotelProvider';
import type { HotelSearchParams, RawHotel } from '@/types/hotel';
import { generateId, nowISO } from '@/lib/utils';

const MOCK_HOTELS: Omit<RawHotel, 'id' | 'fetchedAt' | 'isMock' | 'city'>[] = [
  {
    name: 'The Grand Central Hotel',
    address: '99 Gordon Street',
    touristArea: 'City Centre',
    stars: 5,
    rating: 9.1,
    reviewCount: 14_200,
    pricePerNight: 220,
    currency: 'USD',
    bookingUrl: 'https://www.booking.com',
    imageUrl: undefined,
    amenities: ['Free WiFi', 'Breakfast included', 'Gym', 'Spa', 'Concierge'],
    providerSource: 'booking.com',
    providerTrust: 'trusted_partner',
  },
  {
    name: 'Boutique Inn Old Town',
    address: '14 Heritage Lane',
    touristArea: 'Old Town',
    stars: 4,
    rating: 8.7,
    reviewCount: 5_400,
    pricePerNight: 145,
    currency: 'USD',
    bookingUrl: 'https://www.booking.com',
    imageUrl: undefined,
    amenities: ['Free WiFi', 'Continental breakfast', 'Bar'],
    providerSource: 'booking.com',
    providerTrust: 'trusted_partner',
  },
  {
    name: 'Airport Express Suites',
    address: '2 Terminal Road',
    touristArea: 'Airport District',
    stars: 3,
    rating: 7.8,
    reviewCount: 3_100,
    pricePerNight: 89,
    currency: 'USD',
    bookingUrl: 'https://www.booking.com',
    imageUrl: undefined,
    amenities: ['Free WiFi', 'Shuttle', 'Parking'],
    providerSource: 'booking.com',
    providerTrust: 'trusted_partner',
  },
];

export class MockHotelProvider implements IHotelProvider {
  readonly id = 'mock_hotels';
  readonly name = 'Mock Hotels [DEV]';
  readonly trustLevel = 'trusted_partner' as const;
  readonly isEnabled = true;
  readonly isMock = true;

  async search(params: HotelSearchParams): Promise<RawHotel[]> {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 150));

    // Generate a destination-specific Booking.com deep-link so the "Book" button
    // opens a real search for the user's destination with their dates.
    const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(params.destination)}&checkin=${params.checkIn}&checkout=${params.checkOut}&group_adults=${params.guests}&no_rooms=1`;

    return MOCK_HOTELS.map((tpl): RawHotel => ({
      ...tpl,
      bookingUrl,
      id: generateId(),
      city: params.destination,
      isMock: true,
      fetchedAt: nowISO(),
    }));
  }
}
