import type { TrustLevel } from './trust';

export interface HotelSearchParams {
  destination: string;
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  /** Optional: filter/boost hotels near this landmark name or keyword */
  attractionKeyword?: string;
}

export interface RawHotel {
  id: string;
  name: string;
  address: string;
  city: string;
  touristArea: string;
  stars: number;
  rating: number;    // 0-10
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  bookingUrl: string;
  imageUrl?: string;
  amenities: string[];
  providerSource: string;
  providerTrust: TrustLevel;
  isMock: boolean;
  fetchedAt: string;
}

export interface NormalizedHotel extends RawHotel {
  formattedPrice: string;
  formattedRating: string;
  trustBadge: string;
  touristAreaNote: string;
  /** Human-readable proximity note, e.g. "Near Eiffel Tower" */
  attractionNote?: string;
}

export interface HotelSearchResult {
  recommended: NormalizedHotel | null;
  alternatives: NormalizedHotel[];
  notFoundReasons: string[];
  searchedAt: string;
  isMockData: boolean;
}
