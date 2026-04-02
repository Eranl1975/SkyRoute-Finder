import type { RawHotel } from '@/types/hotel';
import { attractionProximityBoost, blendAttractionScore } from './attractionScoring';

/** Base score = rating (0-10) × 0.6 + review volume factor × 0.4
 *  Prefer hotels in tourist areas with meaningful review counts. */
export function hotelScore(hotel: RawHotel): number {
  const ratingScore = hotel.rating * 0.6;
  // log scale for reviews: 100 reviews → 0.4, 10k → ~1.6, capped at 4
  const reviewScore = Math.min(Math.log10(hotel.reviewCount + 1) / 2, 2) * 0.4;
  return ratingScore + reviewScore;
}

/** Final score with optional attraction proximity boost. */
export function hotelScoreWithAttraction(hotel: RawHotel, attractionKeyword?: string): number {
  const base = hotelScore(hotel);
  if (!attractionKeyword) return base;
  const boost = attractionProximityBoost(hotel.city, hotel.touristArea, attractionKeyword);
  return blendAttractionScore(base, boost);
}

export function rankHotels(hotels: RawHotel[], attractionKeyword?: string): RawHotel[] {
  return [...hotels].sort(
    (a, b) => hotelScoreWithAttraction(b, attractionKeyword) - hotelScoreWithAttraction(a, attractionKeyword)
  );
}
