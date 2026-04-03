/**
 * Amadeus Self-Service API Adapter
 *
 * Covers 400+ airlines via Amadeus Global Distribution System.
 * Free tier: https://developers.amadeus.com (Self-Service)
 *
 * Required env vars (server-side only — never expose to client):
 *   AMADEUS_CLIENT_ID     — from Amadeus developer portal
 *   AMADEUS_CLIENT_SECRET — from Amadeus developer portal
 *
 * Uses production endpoint when AMADEUS_ENV=production, otherwise test.
 *
 * To enable:
 *   1. Sign up at https://developers.amadeus.com
 *   2. Create an app → copy Client ID + Secret
 *   3. Add AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET to Vercel env vars
 *   4. Redeploy
 */
import type { IFlightProvider } from '@/providers/interfaces/FlightProvider';
import type { FlightSearchParams, RawFlight, BaggageInfo } from '@/types/flight';
import { generateId, nowISO } from '@/lib/utils';

const IS_PRODUCTION = process.env.AMADEUS_ENV === 'production';
const BASE_URL = IS_PRODUCTION
  ? 'https://api.amadeus.com'
  : 'https://test.api.amadeus.com';

const TOKEN_URL = `${BASE_URL}/v1/security/oauth2/token`;
const OFFERS_URL = `${BASE_URL}/v2/shopping/flight-offers`;

// Cache token for up to 25 minutes (tokens expire after 30min)
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.value;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amadeus token error ${res.status}: ${text}`);
  }

  const data: { access_token: string; expires_in: number } = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: now + (data.expires_in - 60) * 1000, // subtract 60s safety margin
  };
  return cachedToken.value;
}

interface AmadeusItinerary {
  duration: string; // e.g. "PT2H30M"
  segments: Array<{
    departure: { iataCode: string; at: string };
    arrival: { iataCode: string; at: string };
    carrierCode: string;
    number: string;
    duration: string;
  }>;
}

interface AmadeusOffer {
  id: string;
  itineraries: AmadeusItinerary[];
  price: { grandTotal: string; currency: string };
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
}

/** Parse ISO 8601 duration PT2H30M → minutes */
function _isoDurationToMinutes(dur: string): number {
  const match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] ?? '0') * 60) + parseInt(match[2] ?? '0');
}

/** Build Ryanair-style booking deep-link — falls back to generic Amadeus search */
function buildBookingUrl(offer: AmadeusOffer, params: FlightSearchParams): string {
  const airlineCode = offer.validatingAirlineCodes[0] ?? '';
  const seg = offer.itineraries[0]?.segments[0];
  const dep = seg?.departure?.at?.split('T')[0] ?? params.startDate;

  const knownDeepLinks: Record<string, string> = {
    FR: `https://www.ryanair.com/gb/en/booking/new-booking?Origin=${params.origin}&Destination=${params.destination}&DateOut=${dep}&ADT=${params.passengers}&RoundTrip=false`,
    W6: `https://wizzair.com/en-gb/booking/select-flight/${params.origin}/${params.destination}/${dep}/null/${params.passengers}/0/0/`,
    U2: `https://www.easyjet.com/en/book/search#searchmodel=ADT${params.passengers}_CHD0_INFT0|ori${params.origin}|des${params.destination}|dep${dep}`,
    LH: `https://www.lufthansa.com/us/en/homepage`,
    BA: `https://www.britishairways.com/travel/book/public/en_us`,
    AF: `https://www.airfrance.com/us/en/common/guidevoyageur/billet_avion/recherche-de-vol.htm`,
    TK: `https://www.turkishairlines.com/en-us/flights/`,
  };

  return knownDeepLinks[airlineCode]
    ?? `https://www.amadeus.com/`;
}

const AIRLINE_NAMES: Record<string, string> = {
  FR: 'Ryanair', W6: 'Wizz Air', U2: 'easyJet',
  LH: 'Lufthansa', BA: 'British Airways', AF: 'Air France',
  TK: 'Turkish Airlines', LY: 'El Al', IZ: 'Arkia', '6H': 'Israir',
  KL: 'KLM', EW: 'Eurowings', VY: 'Vueling', IB: 'Iberia',
  AZ: 'ITA Airways', TP: 'TAP Air Portugal', SK: 'SAS', AY: 'Finnair',
  OS: 'Austrian Airlines', SN: 'Brussels Airlines', LX: 'Swiss',
};

function airlineName(code: string): string {
  return AIRLINE_NAMES[code] ?? code;
}

export class AmadeusAdapter implements IFlightProvider {
  readonly id = 'amadeus';
  readonly name = 'Amadeus (Multi-Airline)';
  readonly trustLevel = 'trusted_partner' as const;
  readonly isEnabled = true;
  readonly isMock = false;

  async search(params: FlightSearchParams): Promise<RawFlight[]> {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      // No credentials configured — skip silently
      return [];
    }

    try {
      const token = await getAccessToken(clientId, clientSecret);

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);

      const url = new URL(OFFERS_URL);
      url.searchParams.set('originLocationCode', params.origin.toUpperCase());
      url.searchParams.set('destinationLocationCode', params.destination.toUpperCase());
      url.searchParams.set('departureDate', params.startDate);
      url.searchParams.set('adults', String(params.passengers));
      url.searchParams.set('max', '15');
      url.searchParams.set('currencyCode', 'USD');

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const text = await res.text();
        console.warn(`[AmadeusAdapter] ${res.status}:`, text.slice(0, 200));
        return [];
      }

      const data: { data?: AmadeusOffer[] } = await res.json();
      const offers = data.data ?? [];

      return offers.flatMap((offer): RawFlight[] => {
        const itin = offer.itineraries[0];
        if (!itin) return [];

        const firstSeg = itin.segments[0];
        const lastSeg = itin.segments[itin.segments.length - 1];
        const airlineCode = offer.validatingAirlineCodes[0] ?? firstSeg.carrierCode;

        const stops = itin.segments.slice(0, -1).map((seg) => ({
          airport: seg.arrival.iataCode,
          city: seg.arrival.iataCode,
          durationMinutes: 0, // Amadeus doesn't give layover time per stop in v2
        }));

        const baggage: BaggageInfo = {
          checkedBags: params.baggage.checkedBags,
          checkedBagWeightKg: 23,
          trolley: params.baggage.trolley,
          trolleyCount: params.baggage.trolleyCount,
        };

        return [{
          id: generateId(),
          airline: airlineName(airlineCode),
          airlineCode,
          origin: firstSeg.departure.iataCode,
          destination: lastSeg.arrival.iataCode,
          departureAt: firstSeg.departure.at,
          arrivalAt: lastSeg.arrival.at,
          price: parseFloat(offer.price.grandTotal),
          currency: offer.price.currency,
          isDirect: itin.segments.length === 1,
          stops,
          baggage,
          bookingUrl: buildBookingUrl(offer, params),
          providerSource: 'amadeus.com',
          providerTrust: 'trusted_partner',
          isMock: false,
          fetchedAt: nowISO(),
        }];
      });
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.warn('[AmadeusAdapter]', (err as Error)?.message);
      }
      return [];
    }
  }
}
