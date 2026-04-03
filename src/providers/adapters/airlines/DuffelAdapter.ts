/**
 * Duffel API Adapter — Multi-Airline Live Search
 *
 * Covers 300+ airlines through Duffel (GDS replacement).
 * Includes: Ryanair, easyJet, Wizz Air, British Airways, Lufthansa,
 *           Turkish Airlines, El Al, KLM, Air France, SAS, Iberia, and more.
 *
 * Sign up (free, no credit card): https://app.duffel.com/join
 *   1. Create account → go to Settings → Access tokens
 *   2. Create a "Test" token for sandbox, or "Live" token for real results
 *   3. Add DUFFEL_ACCESS_TOKEN to Vercel env vars
 *
 * To switch from test → live data: replace the token with a live token
 * (same env var name — no code changes needed).
 */
import type { IFlightProvider } from '@/providers/interfaces/FlightProvider';
import type { FlightSearchParams, RawFlight, BaggageInfo } from '@/types/flight';
import { generateId, nowISO } from '@/lib/utils';

const OFFER_REQUESTS_URL = 'https://api.duffel.com/air/offer_requests';
const DUFFEL_VERSION = 'v2';

interface DuffelSegment {
  origin: { iata_code: string; city_name?: string };
  destination: { iata_code: string; city_name?: string };
  departing_at: string;
  arriving_at: string;
  duration: string; // PT2H30M
  marketing_carrier: { iata_code: string; name: string };
  marketing_carrier_flight_number: string;
}

interface DuffelSlice {
  duration: string;
  segments: DuffelSegment[];
}

interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  slices: DuffelSlice[];
}

interface DuffelResponse {
  data?: {
    id?: string;
    offers?: DuffelOffer[];
  };
}

/** Parse ISO 8601 duration PT2H30M → minutes */
function durationToMinutes(dur: string): number {
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? '0') * 60) + parseInt(m[2] ?? '0');
}

/** Build airline-specific deep-link for booking */
function buildBookingUrl(offer: DuffelOffer, params: FlightSearchParams): string {
  const firstSlice = offer.slices[0];
  const firstSeg = firstSlice?.segments[0];
  const airlineCode = firstSeg?.marketing_carrier?.iata_code ?? '';
  const dep = firstSeg?.departing_at?.split('T')[0] ?? params.startDate;
  const ori = params.origin.toUpperCase();
  const dst = params.destination.toUpperCase();
  const pax = params.passengers;

  const deepLinks: Record<string, string> = {
    FR: `https://www.ryanair.com/gb/en/booking/new-booking?Origin=${ori}&Destination=${dst}&DateOut=${dep}&ADT=${pax}&RoundTrip=false`,
    W6: `https://wizzair.com/en-gb/booking/select-flight/${ori}/${dst}/${dep}/null/${pax}/0/0/`,
    U2: `https://www.easyjet.com/en/book/search#ori${ori}|des${dst}|dep${dep}|ADT${pax}`,
    LH: `https://www.lufthansa.com/flight-search/LH-search/lh_flightSearch.shtml?departure=${ori}&arrival=${dst}&date=${dep}&adults=${pax}`,
    BA: `https://www.britishairways.com/travel/book/public/en_us#outboundAirportCode=${ori}&destinationAirportCode=${dst}&departureDate=${dep}&numberOfAdults=${pax}`,
    AF: `https://www.airfrance.com/search/offers?pax=ADT:${pax}&cleanSlice=1&journeys=O:${ori}>${dst}:${dep}:0`,
    TK: `https://www.turkishairlines.com/en-us/flights/from-${ori.toLowerCase()}-to-${dst.toLowerCase()}/?from=${ori}&to=${dst}&cabin=economy&date=${dep}`,
    LY: `https://www.elal.com/en/Israel/Pages/flight-search.aspx?From=${ori}&To=${dst}&Date=${dep}&Adults=${pax}`,
    KL: `https://www.klm.com/search/public/flights?selectFlow=ONE_WAY&origin0=${ori}&destination0=${dst}&departureDate0=${dep}&cabinClass=ECONOMY&adults=${pax}`,
    IB: `https://www.iberia.com/vuelos/madrid/buscar-vuelo/?from=${ori}&to=${dst}&dep_date=${dep}&adults=${pax}&cabin=Y`,
    SK: `https://www.flysas.com/en/book-and-buy/book/flights/?origin=${ori}&destination=${dst}&outDate=${dep}&adults=${pax}&adt=${pax}`,
  };

  return deepLinks[airlineCode] ?? `https://www.duffel.com/`;
}

export class DuffelAdapter implements IFlightProvider {
  readonly id = 'duffel';
  readonly name = 'Duffel (Multi-Airline)';
  readonly trustLevel = 'trusted_partner' as const;
  readonly isEnabled = true;
  readonly isMock = false;

  async search(params: FlightSearchParams): Promise<RawFlight[]> {
    const token = process.env.DUFFEL_ACCESS_TOKEN;
    if (!token) return []; // No token configured — skip silently

    try {
      // Build passenger list
      const passengers = Array.from({ length: params.passengers }, () => ({ type: 'adult' }));

      const body = {
        data: {
          return_offers: true,
          slices: [{
            origin: params.origin.toUpperCase(),
            destination: params.destination.toUpperCase(),
            departure_date: params.startDate,
          }],
          passengers,
          cabin_class: 'economy',
          max_connections: params.stopoverPreference === 'direct_only' ? 0 : 1,
        },
      };

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);

      const res = await fetch(OFFER_REQUESTS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Duffel-Version': DUFFEL_VERSION,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const text = await res.text();
        console.warn(`[DuffelAdapter] ${res.status}:`, text.slice(0, 300));
        return [];
      }

      const json: DuffelResponse = await res.json();
      const offers: DuffelOffer[] = json.data?.offers ?? [];

      return offers.flatMap((offer): RawFlight[] => {
        const slice = offer.slices[0];
        if (!slice) return [];

        const firstSeg = slice.segments[0];
        const lastSeg = slice.segments[slice.segments.length - 1];
        const price = parseFloat(offer.total_amount);
        if (!price || price <= 0) return [];

        const stops = slice.segments.slice(0, -1).map((seg) => ({
          airport: seg.destination.iata_code,
          city: seg.destination.city_name ?? seg.destination.iata_code,
          durationMinutes: durationToMinutes(seg.duration),
        }));

        const baggage: BaggageInfo = {
          checkedBags: params.baggage.checkedBags,
          checkedBagWeightKg: 23,
          trolley: params.baggage.trolley,
          trolleyCount: params.baggage.trolleyCount,
        };

        return [{
          id: generateId(),
          airline: firstSeg.marketing_carrier.name,
          airlineCode: firstSeg.marketing_carrier.iata_code,
          origin: firstSeg.origin.iata_code,
          destination: lastSeg.destination.iata_code,
          departureAt: firstSeg.departing_at,
          arrivalAt: lastSeg.arriving_at,
          price,
          currency: offer.total_currency,
          isDirect: slice.segments.length === 1,
          stops,
          baggage,
          bookingUrl: buildBookingUrl(offer, params),
          providerSource: 'duffel.com',
          providerTrust: 'trusted_partner',
          isMock: false,
          fetchedAt: nowISO(),
        }];
      });
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.warn('[DuffelAdapter]', (err as Error)?.message);
      }
      return [];
    }
  }
}
