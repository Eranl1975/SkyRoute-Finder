/**
 * Skill 4 — Result Normalization & Presentation
 * Converts raw skill outputs to clean, locale-aware UI-ready results.
 */
import type { NormalizedFlight } from '@/types/flight';
import type { NormalizedHotel } from '@/types/hotel';
import type { SupportedLocale } from '@/lib/constants';
import { formatPriceLocale, formatDateTimeLocale, formatStops } from './formatters';

export function relocalizeFlights(
  flights: NormalizedFlight[],
  locale: SupportedLocale
): NormalizedFlight[] {
  return flights.map((f) => ({
    ...f,
    formattedPrice: formatPriceLocale(f.price, f.currency, locale),
    formattedDeparture: formatDateTimeLocale(f.departureAt, locale),
    formattedArrival: formatDateTimeLocale(f.arrivalAt, locale),
    stopSummary: f.isDirect
      ? formatStops(0, locale)
      : `${formatStops(f.stops.length, locale)}${f.stops[0] ? ` via ${f.stops[0].city}` : ''}`,
  }));
}

export function relocalizeHotel(
  hotel: NormalizedHotel,
  locale: SupportedLocale
): NormalizedHotel {
  return {
    ...hotel,
    formattedPrice: formatPriceLocale(hotel.pricePerNight, hotel.currency, locale),
  };
}

export { formatPriceLocale, formatDateTimeLocale, formatStops } from './formatters';
export { renderTemplate, getTemplate } from './templates';
