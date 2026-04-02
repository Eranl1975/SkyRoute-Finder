/**
 * Attraction-proximity scoring for hotel recommendations.
 *
 * Approach (no paid API):
 *  - Hard-coded landmark coordinates for popular destinations.
 *  - Hotels already carry a `touristArea` string from adapters.
 *  - We match the requested `attractionKeyword` against area names and compute
 *    a 0-1 proximity boost that is blended into the base hotel score.
 *
 * Extension points:
 *  - Replace the static map with a Supabase table for admin-managed landmarks.
 *  - Integrate OpenStreetMap Nominatim (free) to geocode hotel addresses at
 *    search time and compute real haversine distances.
 */

/** A named landmark with rough city-district tags for fuzzy matching. */
interface Landmark {
  name: string;
  /** Districts / keywords that are "near" this landmark */
  nearbyAreas: string[];
  /** Latitude for future haversine use */
  lat: number;
  /** Longitude for future haversine use */
  lon: number;
}

/** Static landmark registry for top travel destinations. */
const LANDMARK_REGISTRY: Record<string, Landmark[]> = {
  // --- Israel ---
  'tel aviv': [
    { name: 'Dizengoff Square', nearbyAreas: ['dizengoff', 'center', 'city centre', 'downtown'], lat: 32.0786, lon: 34.7739 },
    { name: 'Old Jaffa Port', nearbyAreas: ['jaffa', 'yafo', 'old port', 'old jaffa'], lat: 32.0528, lon: 34.7514 },
    { name: 'Tel Aviv Beach', nearbyAreas: ['beachfront', 'promenade', 'tayelet', 'sea', 'beach'], lat: 32.0853, lon: 34.7676 },
  ],
  'jerusalem': [
    { name: 'Old City', nearbyAreas: ['old city', 'christian quarter', 'muslim quarter', 'jewish quarter', 'armenian'], lat: 31.7767, lon: 35.2345 },
    { name: 'Mahane Yehuda Market', nearbyAreas: ['mahane yehuda', 'market', 'shuk', 'city center'], lat: 31.7857, lon: 35.2128 },
    { name: 'Mount of Olives', nearbyAreas: ['mount of olives', 'east jerusalem', 'garden of gethsemane'], lat: 31.7786, lon: 35.2469 },
  ],
  'eilat': [
    { name: 'Coral Beach', nearbyAreas: ['coral beach', 'reef', 'snorkeling', 'south eilat'], lat: 29.5128, lon: 34.9140 },
    { name: 'Eilat Promenade', nearbyAreas: ['promenade', 'north beach', 'city center', 'marina'], lat: 29.5569, lon: 34.9519 },
  ],
  // --- UK ---
  'london': [
    { name: 'Tower of London', nearbyAreas: ['tower bridge', 'city of london', 'aldgate', 'whitechapel'], lat: 51.5081, lon: -0.0759 },
    { name: 'Buckingham Palace', nearbyAreas: ['westminster', 'victoria', 'st james', 'mayfair', 'belgravia'], lat: 51.5014, lon: -0.1419 },
    { name: 'Covent Garden', nearbyAreas: ['covent garden', 'west end', 'soho', 'strand', 'holborn'], lat: 51.5117, lon: -0.1228 },
    { name: 'Heathrow', nearbyAreas: ['heathrow', 'airport', 'hayes', 'hounslow'], lat: 51.4700, lon: -0.4543 },
  ],
  // --- France ---
  'paris': [
    { name: 'Eiffel Tower', nearbyAreas: ['trocadero', 'champ de mars', '7th', 'tour eiffel'], lat: 48.8584, lon: 2.2945 },
    { name: 'The Louvre', nearbyAreas: ['louvre', '1st', 'rivoli', 'les halles', 'marais'], lat: 48.8606, lon: 2.3376 },
    { name: 'Montmartre', nearbyAreas: ['montmartre', 'sacre coeur', '18th', 'pigalle'], lat: 48.8867, lon: 2.3431 },
    { name: 'CDG Airport', nearbyAreas: ['cdg', 'roissy', 'airport', 'charles de gaulle'], lat: 49.0097, lon: 2.5479 },
  ],
  // --- Italy ---
  'rome': [
    { name: 'Colosseum', nearbyAreas: ['colosseum', 'forum', 'palatine', 'celio', 'aventino'], lat: 41.8902, lon: 12.4922 },
    { name: 'Vatican', nearbyAreas: ['vatican', 'prati', 'borgo', 'st peter'], lat: 41.9029, lon: 12.4534 },
    { name: 'Trevi Fountain', nearbyAreas: ['trevi', 'quirinale', 'spagna', 'centro storico'], lat: 41.9009, lon: 12.4833 },
  ],
  // --- Spain ---
  'barcelona': [
    { name: 'Sagrada Familia', nearbyAreas: ['sagrada familia', 'eixample', 'gracia'], lat: 41.4036, lon: 2.1744 },
    { name: 'La Rambla', nearbyAreas: ['ramblas', 'gothic quarter', 'old town', 'barceloneta'], lat: 41.3817, lon: 2.1734 },
    { name: 'Picasso Museum', nearbyAreas: ['born', 'el born', 'gothic', 'ribera'], lat: 41.3852, lon: 2.1810 },
  ],
  // --- Germany ---
  'berlin': [
    { name: 'Brandenburg Gate', nearbyAreas: ['mitte', 'tiergarten', 'potsdamer platz', 'unter den linden'], lat: 52.5163, lon: 13.3777 },
    { name: 'East Side Gallery', nearbyAreas: ['friedrichshain', 'kreuzberg', 'east berlin'], lat: 52.5053, lon: 13.4394 },
    { name: 'Airport BER', nearbyAreas: ['ber', 'schoenefeld', 'airport'], lat: 52.3667, lon: 13.5033 },
  ],
  // --- Netherlands ---
  'amsterdam': [
    { name: 'Rijksmuseum', nearbyAreas: ['museum quarter', 'vondelpark', 'oud-west', 'rijksmuseum'], lat: 52.3600, lon: 4.8852 },
    { name: 'Anne Frank House', nearbyAreas: ['jordaan', 'canal ring', 'city centre', 'old center'], lat: 52.3752, lon: 4.8840 },
    { name: 'Amsterdam Centraal', nearbyAreas: ['central station', 'damrak', 'red light district', 'de wallen'], lat: 52.3791, lon: 4.9003 },
  ],
};

/**
 * Normalise a city name for map lookup.
 * Strips diacritics and lowercases.
 */
function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Returns a 0–1 proximity boost for a hotel `touristArea` string
 * relative to the `attractionKeyword` searched by the user.
 *
 * 1.0 = exact area match
 * 0.5 = partial keyword match
 * 0.0 = no match
 */
export function attractionProximityBoost(
  city: string,
  touristArea: string,
  attractionKeyword: string
): number {
  if (!attractionKeyword.trim()) return 0;

  const normalizedCity = normalizeCity(city);
  const landmarks = LANDMARK_REGISTRY[normalizedCity];
  if (!landmarks) return 0;

  const kw = attractionKeyword.toLowerCase().trim();
  const area = touristArea.toLowerCase();

  for (const landmark of landmarks) {
    const lmName = landmark.name.toLowerCase();
    // Check if the attraction keyword matches this landmark
    const isLandmarkMatch = lmName.includes(kw) || kw.includes(lmName.split(' ')[0]);
    if (!isLandmarkMatch) continue;

    // Landmark matched — now score the hotel's area against this landmark's nearby areas
    for (const nearby of landmark.nearbyAreas) {
      if (area.includes(nearby) || nearby.includes(area)) return 1.0;
    }
    // Landmark found but hotel area not in nearby list — partial boost
    return 0.2;
  }

  // No landmark match — try direct area-vs-keyword fuzzy match
  if (area.includes(kw) || kw.includes(area.split(' ')[0])) return 0.5;
  return 0;
}

/**
 * Blended score: base score (rating+reviews) + attraction proximity bonus.
 *
 * @param baseScore   Output of `hotelScore()` (0–~8)
 * @param boost       0–1 from `attractionProximityBoost()`
 * @param weight      How much the boost matters (default 0.25 → 25 % of final score)
 */
export function blendAttractionScore(baseScore: number, boost: number, weight = 0.25): number {
  return baseScore * (1 - weight) + boost * weight * 10; // normalise boost to same scale
}

/** Returns a human-readable note about attraction proximity, or '' if no match. */
export function attractionNote(city: string, touristArea: string, attractionKeyword: string): string {
  if (!attractionKeyword.trim()) return '';
  const boost = attractionProximityBoost(city, touristArea, attractionKeyword);
  if (boost >= 1.0) return `Near ${attractionKeyword}`;
  if (boost >= 0.5) return `Close to ${attractionKeyword} area`;
  if (boost > 0) return `Some distance from ${attractionKeyword}`;
  return '';
}

/** List all known landmarks for a city (used by UI to suggest attraction names). */
export function getLandmarks(city: string): string[] {
  return (LANDMARK_REGISTRY[normalizeCity(city)] ?? []).map((l) => l.name);
}
