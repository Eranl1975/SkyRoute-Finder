import { describe, it, expect } from 'vitest';
import { formatPriceLocale, formatStops } from '@/skills/normalization';
import { renderTemplate } from '@/skills/normalization/templates';
import { hotelScore, rankHotels } from '@/skills/hotelSearch/scoring';
import type { RawHotel } from '@/types/hotel';

describe('formatPriceLocale', () => {
  it('formats USD for English', () => {
    const result = formatPriceLocale(489, 'USD', 'en');
    expect(result).toContain('489');
  });

  it('formats USD for Hebrew', () => {
    const result = formatPriceLocale(489, 'USD', 'he');
    expect(result).toContain('489');
  });
});

describe('formatStops', () => {
  it('returns Direct for 0 stops in English', () => {
    expect(formatStops(0, 'en')).toBe('Direct');
  });
  it('returns ישיר for 0 stops in Hebrew', () => {
    expect(formatStops(0, 'he')).toBe('ישיר');
  });
  it('returns plural stops', () => {
    expect(formatStops(2, 'en')).toContain('2');
  });
});

describe('renderTemplate', () => {
  it('interpolates route not found', () => {
    const result = renderTemplate('routeNotFound', 'en', { origin: 'TLV', destination: 'LHR' });
    expect(result).toContain('TLV');
    expect(result).toContain('LHR');
  });
});

describe('hotelScore', () => {
  function makeHotel(rating: number, reviewCount: number): RawHotel {
    return {
      id: '1', name: 'Test', address: '', city: 'London', touristArea: 'City Centre',
      stars: 4, rating, reviewCount, pricePerNight: 100, currency: 'USD',
      bookingUrl: 'https://booking.com', amenities: [],
      providerSource: 'booking.com', providerTrust: 'trusted_partner',
      isMock: true, fetchedAt: new Date().toISOString(),
    };
  }

  it('gives higher score to higher-rated hotel', () => {
    const good = makeHotel(9.0, 5000);
    const bad = makeHotel(5.0, 5000);
    expect(hotelScore(good)).toBeGreaterThan(hotelScore(bad));
  });

  it('rankHotels puts highest score first', () => {
    const hotels = [makeHotel(7.0, 1000), makeHotel(9.2, 10000), makeHotel(8.0, 500)];
    const ranked = rankHotels(hotels);
    expect(ranked[0].rating).toBe(9.2);
  });
});
