/**
 * Mock Hotel Provider — returns destination-aware hotel data for development/fallback.
 * Hotels are matched to destination city by IATA code or city name.
 * [MOCK] Replace with live Booking.com / Hotels.com adapter for production.
 */
import type { IHotelProvider } from '@/providers/interfaces/HotelProvider';
import type { HotelSearchParams, RawHotel } from '@/types/hotel';
import { generateId, nowISO } from '@/lib/utils';

interface MockHotelTemplate {
  name: string;
  address: string;
  touristArea: string;
  stars: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  amenities: string[];
}

/** Destination-specific hotel data keyed by IATA code or lowercase city name */
const DESTINATION_HOTELS: Record<string, MockHotelTemplate[]> = {
  // Athens
  ATH: [
    { name: 'Hotel Grande Bretagne', address: '1 Vasileos Georgiou A', touristArea: 'Syntagma Square', stars: 5, rating: 9.3, reviewCount: 18_400, pricePerNight: 380, amenities: ['Free WiFi', 'Rooftop Pool', 'Spa', 'Restaurant', 'Concierge'] },
    { name: 'Electra Metropolis Athens', address: '15 Mitropoleos', touristArea: 'Monastiraki', stars: 5, rating: 9.1, reviewCount: 11_200, pricePerNight: 260, amenities: ['Free WiFi', 'Rooftop Bar', 'Breakfast included', 'Gym'] },
    { name: 'Athens Was Hotel', address: '2 Agias Theklas', touristArea: 'Psiri', stars: 4, rating: 8.8, reviewCount: 7_300, pricePerNight: 145, amenities: ['Free WiFi', 'Bar', 'Acropolis View', 'Terrace'] },
  ],
  // Tel Aviv
  TLV: [
    { name: 'The Norman Tel Aviv', address: '23 Nachalat Binyamin St', touristArea: 'City Centre', stars: 5, rating: 9.4, reviewCount: 12_500, pricePerNight: 450, amenities: ['Free WiFi', 'Rooftop Pool', 'Spa', 'Restaurant', 'Valet'] },
    { name: 'Isrotel Tower Hotel', address: '78 HaYarkon St', touristArea: 'Tel Aviv Beach', stars: 4, rating: 8.9, reviewCount: 9_800, pricePerNight: 280, amenities: ['Free WiFi', 'Sea View', 'Pool', 'Gym', 'Breakfast included'] },
    { name: 'Hotel Montefiore', address: '36 Montefiore St', touristArea: 'Neve Tzedek', stars: 4, rating: 9.0, reviewCount: 5_600, pricePerNight: 220, amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Garden'] },
  ],
  // London
  LHR: [
    { name: 'The Ritz London', address: '150 Piccadilly', touristArea: 'Mayfair', stars: 5, rating: 9.5, reviewCount: 22_000, pricePerNight: 620, amenities: ['Free WiFi', 'Afternoon Tea', 'Spa', 'Fine Dining', 'Concierge'] },
    { name: 'Ham Yard Hotel', address: '1 Ham Yard', touristArea: 'Soho', stars: 5, rating: 9.2, reviewCount: 8_700, pricePerNight: 350, amenities: ['Free WiFi', 'Rooftop Terrace', 'Spa', 'Restaurant', 'Bar'] },
    { name: 'Z Hotel Shoreditch', address: '136-144 City Rd', touristArea: 'Shoreditch', stars: 3, rating: 8.4, reviewCount: 14_100, pricePerNight: 110, amenities: ['Free WiFi', 'Bar', 'City View'] },
  ],
  LON: [],   // alias filled below
  // Paris
  CDG: [
    { name: 'Hôtel de Crillon', address: '10 Place de la Concorde', touristArea: 'Champs-Élysées', stars: 5, rating: 9.6, reviewCount: 15_300, pricePerNight: 780, amenities: ['Free WiFi', 'Pool', 'Spa', 'Fine Dining', 'Butler Service'] },
    { name: 'Le Marais Boutique Hotel', address: '29 Rue de Bretagne', touristArea: 'Le Marais', stars: 4, rating: 8.9, reviewCount: 9_200, pricePerNight: 240, amenities: ['Free WiFi', 'Breakfast included', 'Bar', 'Courtyard'] },
    { name: 'Generator Paris', address: '9-11 Place du Colonel Fabien', touristArea: 'République', stars: 3, rating: 8.2, reviewCount: 21_500, pricePerNight: 95, amenities: ['Free WiFi', 'Bar', 'Lounge', 'Tour Desk'] },
  ],
  PAR: [],   // alias filled below
  // Rome
  FCO: [
    { name: 'Hotel Eden Roma', address: '49 Via Ludovisi', touristArea: 'Via Veneto', stars: 5, rating: 9.4, reviewCount: 11_800, pricePerNight: 520, amenities: ['Free WiFi', 'Rooftop Restaurant', 'Spa', 'Pool', 'Concierge'] },
    { name: 'Relais Le Clarisse', address: '284 Via Cardinale Merry del Val', touristArea: 'Trastevere', stars: 4, rating: 9.1, reviewCount: 4_200, pricePerNight: 190, amenities: ['Free WiFi', 'Garden', 'Breakfast included', 'Historic Building'] },
    { name: 'Hotel Campo de Fiori', address: '23 Via del Biscione', touristArea: 'Campo de Fiori', stars: 3, rating: 8.6, reviewCount: 7_800, pricePerNight: 130, amenities: ['Free WiFi', 'Rooftop Terrace', 'City View'] },
  ],
  ROM: [],
  // Barcelona
  BCN: [
    { name: 'W Barcelona', address: 'Plaça de la Rosa dels Vents', touristArea: 'Barceloneta Beach', stars: 5, rating: 9.2, reviewCount: 19_600, pricePerNight: 420, amenities: ['Free WiFi', 'Beach Access', 'Pool', 'Spa', 'Club'] },
    { name: 'Hotel Arts Barcelona', address: '19-21 Carrer de la Marina', touristArea: 'Port Olímpic', stars: 5, rating: 9.0, reviewCount: 13_400, pricePerNight: 350, amenities: ['Free WiFi', 'Sea View', 'Pool', 'Spa', 'Fine Dining'] },
    { name: 'Casa Camper Barcelona', address: '11 Carrer d\'Elisabets', touristArea: 'El Raval', stars: 4, rating: 8.8, reviewCount: 6_900, pricePerNight: 210, amenities: ['Free WiFi', 'Snack Bar 24h', 'Terrace', 'Gym'] },
  ],
  // Amsterdam
  AMS: [
    { name: 'Pulitzer Amsterdam', address: '315-331 Prinsengracht', touristArea: 'Canal Ring', stars: 5, rating: 9.3, reviewCount: 10_200, pricePerNight: 390, amenities: ['Free WiFi', 'Canal View', 'Restaurant', 'Bar', 'Garden'] },
    { name: 'Hotel V Nesplein', address: '49 Nes', touristArea: 'Old City Centre', stars: 4, rating: 8.9, reviewCount: 5_700, pricePerNight: 175, amenities: ['Free WiFi', 'Breakfast included', 'Bar', 'Lounge'] },
    { name: 'Generator Amsterdam', address: 'Mauritskade 57', touristArea: 'Oost', stars: 3, rating: 8.3, reviewCount: 16_800, pricePerNight: 90, amenities: ['Free WiFi', 'Bar', 'Courtyard'] },
  ],
  // Dubai
  DXB: [
    { name: 'Burj Al Arab Jumeirah', address: 'Jumeirah Beach Rd', touristArea: 'Jumeirah', stars: 5, rating: 9.7, reviewCount: 8_400, pricePerNight: 1800, amenities: ['Butler Service', 'Private Beach', 'Spa', 'Multiple Restaurants', 'Helicopter Pad'] },
    { name: 'Atlantis The Palm', address: 'Crescent Rd, The Palm', touristArea: 'Palm Jumeirah', stars: 5, rating: 9.1, reviewCount: 32_000, pricePerNight: 480, amenities: ['Free WiFi', 'Water Park', 'Private Beach', 'Aquarium', 'Spa'] },
    { name: 'Premier Inn Dubai Airport', address: 'Garhoud', touristArea: 'Airport District', stars: 3, rating: 8.5, reviewCount: 11_200, pricePerNight: 85, amenities: ['Free WiFi', 'Pool', 'Restaurant', 'Shuttle'] },
  ],
  // New York
  JFK: [
    { name: 'The Plaza Hotel', address: 'Fifth Avenue at Central Park South', touristArea: 'Midtown Manhattan', stars: 5, rating: 9.4, reviewCount: 24_300, pricePerNight: 750, amenities: ['Free WiFi', 'Spa', 'Fine Dining', 'Concierge', 'Central Park View'] },
    { name: 'Pod 51', address: '230 E 51st St', touristArea: 'Midtown East', stars: 3, rating: 8.6, reviewCount: 18_700, pricePerNight: 145, amenities: ['Free WiFi', 'Rooftop Deck', 'Café'] },
    { name: 'Arlo Nomad', address: '11 E 31st St', touristArea: 'NoMad', stars: 4, rating: 8.8, reviewCount: 9_600, pricePerNight: 220, amenities: ['Free WiFi', 'Rooftop Bar', 'Restaurant', 'Gym'] },
  ],
  EWR: [],
  NYC: [],
  // Istanbul
  IST: [
    { name: 'Four Seasons Sultanahmet', address: 'Tevkifhane Sk No:1', touristArea: 'Sultanahmet', stars: 5, rating: 9.5, reviewCount: 7_200, pricePerNight: 560, amenities: ['Free WiFi', 'Spa', 'Fine Dining', 'Hammam', 'City View'] },
    { name: 'Vault Karakoy', address: '5 Bankalar Cad', touristArea: 'Karaköy', stars: 5, rating: 9.2, reviewCount: 5_800, pricePerNight: 280, amenities: ['Free WiFi', 'Rooftop Bar', 'Restaurant', 'Art Gallery'] },
    { name: 'Hotel Arcadia Blue Istanbul', address: 'Dr. Imran Oktem Cad No:1', touristArea: 'Sultanahmet', stars: 4, rating: 8.9, reviewCount: 12_400, pricePerNight: 165, amenities: ['Free WiFi', 'Bosphorus View', 'Pool', 'Breakfast included'] },
  ],
  SAW: [],
  // Berlin
  BER: [
    { name: 'Hotel Adlon Kempinski', address: 'Unter den Linden 77', touristArea: 'Mitte', stars: 5, rating: 9.4, reviewCount: 16_500, pricePerNight: 480, amenities: ['Free WiFi', 'Spa', 'Fine Dining', 'Brandenburg Gate View', 'Pool'] },
    { name: 'Michelberger Hotel', address: 'Warschauer Str. 39-40', touristArea: 'Friedrichshain', stars: 4, rating: 9.0, reviewCount: 8_900, pricePerNight: 160, amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Courtyard'] },
    { name: 'Motel One Berlin-Alexanderplatz', address: 'Grunerstr. 11', touristArea: 'Mitte', stars: 3, rating: 8.7, reviewCount: 21_000, pricePerNight: 98, amenities: ['Free WiFi', 'Bar', 'City View'] },
  ],
  // Bangkok
  BKK: [
    { name: 'Mandarin Oriental Bangkok', address: '48 Oriental Ave', touristArea: 'Riverside', stars: 5, rating: 9.6, reviewCount: 14_200, pricePerNight: 520, amenities: ['Free WiFi', 'River View', 'Pool', 'Spa', 'Fine Dining'] },
    { name: 'The Peninsula Bangkok', address: '333 Charoennakorn Rd', touristArea: 'Thonburi Riverside', stars: 5, rating: 9.3, reviewCount: 9_700, pricePerNight: 380, amenities: ['Free WiFi', 'River View', 'Pool', 'Spa', 'Helicopter'] },
    { name: 'lub d Bangkok Silom', address: '4 Decho Rd', touristArea: 'Silom', stars: 3, rating: 8.5, reviewCount: 19_300, pricePerNight: 55, amenities: ['Free WiFi', 'Pool', 'Bar', 'Tour Desk'] },
  ],
  // Prague
  PRG: [
    { name: 'Augustine Hotel Prague', address: 'Letenská 12/33', touristArea: 'Malá Strana', stars: 5, rating: 9.3, reviewCount: 6_800, pricePerNight: 290, amenities: ['Free WiFi', 'Spa', 'Fine Dining', 'Castle View'] },
    { name: 'Hotel Josef', address: 'Rybná 20', touristArea: 'Old Town', stars: 4, rating: 9.0, reviewCount: 8_100, pricePerNight: 165, amenities: ['Free WiFi', 'Breakfast included', 'Bar', 'Design Hotel'] },
    { name: 'Sophie\'s Hostel', address: 'Melounova 2', touristArea: 'New Town', stars: 3, rating: 8.8, reviewCount: 11_400, pricePerNight: 75, amenities: ['Free WiFi', 'Bar', 'Lounge', 'Tour Desk'] },
  ],
  // Vienna
  VIE: [
    { name: 'Hotel Sacher Wien', address: 'Philharmoniker Str. 4', touristArea: 'Opera Ring', stars: 5, rating: 9.5, reviewCount: 13_600, pricePerNight: 480, amenities: ['Free WiFi', 'Spa', 'Fine Dining', 'Opera View'] },
    { name: 'The Guesthouse Vienna', address: 'Führichgasse 10', touristArea: '1st District', stars: 4, rating: 9.1, reviewCount: 5_400, pricePerNight: 210, amenities: ['Free WiFi', 'Breakfast included', 'Garden'] },
    { name: 'Wombat\'s City Hostel', address: 'Mariahilfer Str. 137', touristArea: 'Mariahilf', stars: 3, rating: 8.6, reviewCount: 17_200, pricePerNight: 72, amenities: ['Free WiFi', 'Bar', 'Rooftop'] },
  ],
  // Lisbon
  LIS: [
    { name: 'Bairro Alto Hotel', address: 'Praça Luís de Camões 2', touristArea: 'Bairro Alto', stars: 5, rating: 9.4, reviewCount: 7_900, pricePerNight: 360, amenities: ['Free WiFi', 'Rooftop', 'Spa', 'Fine Dining', 'City View'] },
    { name: 'Dear Lisbon Palace Suites', address: 'Rua de São Filipe Neri 16', touristArea: 'Príncipe Real', stars: 4, rating: 9.2, reviewCount: 4_500, pricePerNight: 195, amenities: ['Free WiFi', 'Garden', 'Breakfast included'] },
    { name: 'Selina Mouraria', address: 'Rua do Benformoso 134-136', touristArea: 'Mouraria', stars: 3, rating: 8.7, reviewCount: 9_100, pricePerNight: 88, amenities: ['Free WiFi', 'Rooftop', 'Coworking', 'Bar'] },
  ],
  // Madrid
  MAD: [
    { name: 'Mandarin Oriental Ritz Madrid', address: 'Plaza de la Lealtad 5', touristArea: 'Retiro', stars: 5, rating: 9.5, reviewCount: 9_300, pricePerNight: 620, amenities: ['Free WiFi', 'Garden Terrace', 'Spa', 'Fine Dining', 'Pool'] },
    { name: 'Hotel Urban', address: 'Carrera de San Jerónimo 34', touristArea: 'Sol', stars: 5, rating: 9.1, reviewCount: 8_700, pricePerNight: 280, amenities: ['Free WiFi', 'Rooftop Pool', 'Spa', 'Restaurant'] },
    { name: 'Room Mate Óscar', address: 'Plaza Vázquez de Mella 12', touristArea: 'Chueca', stars: 4, rating: 8.8, reviewCount: 12_200, pricePerNight: 145, amenities: ['Free WiFi', 'Rooftop Pool', 'Bar'] },
  ],
  // Tokyo
  NRT: [
    { name: 'The Peninsula Tokyo', address: '1-8-1 Yurakucho, Chiyoda', touristArea: 'Marunouchi', stars: 5, rating: 9.5, reviewCount: 11_800, pricePerNight: 680, amenities: ['Free WiFi', 'Pool', 'Spa', 'Fine Dining', 'City View'] },
    { name: 'Shibuya Stream Excel Hotel Tokyu', address: '3-21-3 Shibuya', touristArea: 'Shibuya', stars: 4, rating: 9.0, reviewCount: 8_400, pricePerNight: 230, amenities: ['Free WiFi', 'City View', 'Restaurant', 'Gym'] },
    { name: 'Nui. Hostel & Bar Lounge', address: '2-14-13 Kuramae', touristArea: 'Kuramae', stars: 3, rating: 8.9, reviewCount: 6_700, pricePerNight: 80, amenities: ['Free WiFi', 'Bar', 'Café'] },
  ],
  HND: [],
  // Singapore
  SIN: [
    { name: 'Marina Bay Sands', address: '10 Bayfront Ave', touristArea: 'Marina Bay', stars: 5, rating: 9.3, reviewCount: 38_000, pricePerNight: 520, amenities: ['Free WiFi', 'Infinity Pool', 'Casino', 'Spa', 'Fine Dining'] },
    { name: 'Naumi Hotel Singapore', address: '41 Seah St', touristArea: 'City Hall', stars: 5, rating: 9.4, reviewCount: 4_200, pricePerNight: 280, amenities: ['Free WiFi', 'Rooftop Pool', 'Bar', 'Spa'] },
    { name: 'Hotel G Singapore', address: '200 Middle Rd', touristArea: 'Bugis', stars: 4, rating: 8.8, reviewCount: 9_600, pricePerNight: 150, amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Gym'] },
  ],
  // Zurich
  ZRH: [
    { name: 'Baur au Lac', address: 'Talstrasse 1', touristArea: 'Quaianlagen', stars: 5, rating: 9.6, reviewCount: 5_800, pricePerNight: 750, amenities: ['Free WiFi', 'Lake View', 'Spa', 'Fine Dining', 'Garden'] },
    { name: 'B2 Boutique Hotel + Spa', address: 'Brandschenkestrasse 152', touristArea: 'Enge', stars: 4, rating: 9.1, reviewCount: 4_100, pricePerNight: 280, amenities: ['Free WiFi', 'Spa', 'Pool', 'Library Bar'] },
  ],
  // Copenhagen
  CPH: [
    { name: 'Hotel d\'Angleterre', address: 'Kongens Nytorv 34', touristArea: 'City Centre', stars: 5, rating: 9.5, reviewCount: 6_200, pricePerNight: 480, amenities: ['Free WiFi', 'Spa', 'Fine Dining', 'Pool'] },
    { name: 'Nimb Hotel', address: 'Bernstorffsgade 5', touristArea: 'Tivoli', stars: 5, rating: 9.4, reviewCount: 3_900, pricePerNight: 420, amenities: ['Free WiFi', 'Tivoli Access', 'Spa', 'Fine Dining'] },
  ],
  // Stockholm
  ARN: [
    { name: 'Grand Hôtel Stockholm', address: 'Södra Blasieholmshamnen 8', touristArea: 'Blasieholmen', stars: 5, rating: 9.4, reviewCount: 8_900, pricePerNight: 490, amenities: ['Free WiFi', 'Sea View', 'Spa', 'Fine Dining'] },
    { name: 'Story Hotel Signalfabriken', address: 'Lindhagensgatan 88', touristArea: 'Kungsholmen', stars: 4, rating: 8.9, reviewCount: 5_300, pricePerNight: 195, amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Gym'] },
  ],
  // Milan
  MXP: [
    { name: 'Armani Hotel Milano', address: 'Via Manzoni 31', touristArea: 'Brera', stars: 5, rating: 9.5, reviewCount: 6_700, pricePerNight: 650, amenities: ['Free WiFi', 'Spa', 'Pool', 'Fine Dining', 'Terrace'] },
    { name: 'Nhow Milano', address: 'Via Tortona 35', touristArea: 'Navigli', stars: 4, rating: 8.9, reviewCount: 9_400, pricePerNight: 190, amenities: ['Free WiFi', 'Pool', 'Restaurant', 'Design Hotel'] },
    { name: 'Ostello Bello', address: 'Via Medici 4', touristArea: 'Sant\'Ambrogio', stars: 3, rating: 9.0, reviewCount: 14_800, pricePerNight: 70, amenities: ['Free WiFi', 'Bar', 'Rooftop', 'Garden'] },
  ],
  LIN: [],
};

// Alias duplicates
DESTINATION_HOTELS.LON = DESTINATION_HOTELS.LHR;
DESTINATION_HOTELS.PAR = DESTINATION_HOTELS.CDG;
DESTINATION_HOTELS.ROM = DESTINATION_HOTELS.FCO;
DESTINATION_HOTELS.EWR = DESTINATION_HOTELS.JFK;
DESTINATION_HOTELS.NYC = DESTINATION_HOTELS.JFK;
DESTINATION_HOTELS.SAW = DESTINATION_HOTELS.IST;
DESTINATION_HOTELS.HND = DESTINATION_HOTELS.NRT;
DESTINATION_HOTELS.LIN = DESTINATION_HOTELS.MXP;

/** Generic fallback used when no destination-specific data is found */
const GENERIC_HOTELS: MockHotelTemplate[] = [
  {
    name: 'Grand Palace Hotel',
    address: '1 Central Boulevard',
    touristArea: 'City Centre',
    stars: 5,
    rating: 9.1,
    reviewCount: 8_200,
    pricePerNight: 290,
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Breakfast included', 'Concierge'],
  },
  {
    name: 'Boutique Old Town Inn',
    address: '22 Heritage Street',
    touristArea: 'Old Town',
    stars: 4,
    rating: 8.7,
    reviewCount: 5_100,
    pricePerNight: 160,
    amenities: ['Free WiFi', 'Breakfast included', 'Bar', 'Garden'],
  },
  {
    name: 'Skyline Business Hotel',
    address: '5 Airport Boulevard',
    touristArea: 'Business District',
    stars: 3,
    rating: 8.0,
    reviewCount: 3_400,
    pricePerNight: 95,
    amenities: ['Free WiFi', 'Gym', 'Shuttle', 'Parking'],
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

    const destKey = params.destination.toUpperCase().trim();
    const templates = DESTINATION_HOTELS[destKey]?.length
      ? DESTINATION_HOTELS[destKey]
      : GENERIC_HOTELS;

    // Generate destination-specific Booking.com deep-link
    const baseBookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(params.destination)}&checkin=${params.checkIn}&checkout=${params.checkOut}&group_adults=${params.guests}&no_rooms=1`;

    return templates.map((tpl): RawHotel => ({
      ...tpl,
      bookingUrl: baseBookingUrl,
      id: generateId(),
      city: params.destination,
      currency: 'USD',
      imageUrl: undefined,
      providerSource: 'booking.com',
      providerTrust: 'trusted_partner',
      isMock: true,
      fetchedAt: nowISO(),
    }));
  }
}
