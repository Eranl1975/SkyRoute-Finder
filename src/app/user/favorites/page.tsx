'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getFavorites, removeFavorite, type FavoriteItem } from '@/lib/storage';
import { formatPrice } from '@/lib/utils';
import type { NormalizedFlight } from '@/types/flight';
import type { NormalizedHotel } from '@/types/hotel';
import type { SearchParamsInput } from '@/schemas/searchSchema';

function rerunFlight(f: NormalizedFlight) {
  const params: Partial<SearchParamsInput> = {
    origin: f.origin,
    destination: f.destination,
    passengers: 1,
    stopoverPreference: f.isDirect ? 'direct_only' : 'include_stopovers',
    includeHotel: true,
    baggage: { checkedBags: f.baggage.checkedBags, checkedBagWeightKg: f.baggage.checkedBagWeightKg, trolley: f.baggage.trolley, trolleyCount: f.baggage.trolleyCount },
    // dates intentionally omitted — SearchContainer will shift to today + 7 days
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  };
  sessionStorage.setItem('skyroute_rerun', JSON.stringify(params));
  window.location.href = '/user';
}

function formatSavedDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  } catch { return iso; }
}

function FlightFavoriteCard({ fav, onRemove }: { fav: FavoriteItem & { type: 'flight' }; onRemove: (id: string) => void }) {
  const f = fav.item as NormalizedFlight;
  return (
    <Card className="border-slate-200 hover:border-sky-200 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">✈ Flight</span>
            {f.flightNumber && <span className="text-xs text-slate-500 font-mono">{f.flightNumber}</span>}
            <span className="text-xs text-slate-400">Saved {formatSavedDate(fav.savedAt)}</span>
          </div>
          <p className="font-semibold text-slate-900 mb-1">
            {f.airline} · <strong>{f.origin}</strong> → <strong>{f.destination}</strong>
          </p>
          <p className="text-sm text-slate-600 mb-2">
            {f.formattedDeparture} → {f.formattedArrival}
            &nbsp;·&nbsp;{f.stopSummary}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="cheapest">{formatPrice(f.price, f.currency)}</Badge>
            {f.isDirect ? (
              <Badge variant="direct">Direct</Badge>
            ) : (
              <Badge variant="stopover">{f.stops.length} stop{f.stops.length !== 1 ? 's' : ''}</Badge>
            )}
            {f.isMock && <Badge variant="mock">Mock</Badge>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => rerunFlight(f)}
            className="px-4 py-2 rounded-xl border border-sky-200 hover:bg-sky-50 text-sky-600 text-sm font-semibold transition-colors min-h-[40px]"
          >
            Search Again ↻
          </button>
          <a
            href={f.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors min-h-[40px] flex items-center"
          >
            Book ↗
          </a>
          <button
            onClick={() => onRemove(fav.id)}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:border-red-300 hover:text-red-500 text-slate-400 text-sm transition-colors min-h-[40px]"
            aria-label="Remove from favorites"
          >
            🗑
          </button>
        </div>
      </div>
    </Card>
  );
}

function HotelFavoriteCard({ fav, onRemove }: { fav: FavoriteItem & { type: 'hotel' }; onRemove: (id: string) => void }) {
  const h = fav.item as NormalizedHotel;
  return (
    <Card className="border-slate-200 hover:border-sky-200 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">🏨 Hotel</span>
            <span className="text-xs text-slate-400">Saved {formatSavedDate(fav.savedAt)}</span>
          </div>
          <p className="font-semibold text-slate-900 mb-0.5">{h.name}</p>
          <p className="text-sm text-slate-500 mb-1">{h.address}, {h.city}</p>
          <p className="text-sm text-slate-600 mb-2">
            ⭐ {h.stars} stars · {h.formattedRating} ({h.reviewCount.toLocaleString()} reviews)
            &nbsp;·&nbsp;{h.formattedPrice}/night
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="trusted_partner">{h.touristArea}</Badge>
            {h.isMock && <Badge variant="mock">Mock</Badge>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <a
            href={h.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors min-h-[40px] flex items-center"
          >
            Book ↗
          </a>
          <button
            onClick={() => onRemove(fav.id)}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:border-red-300 hover:text-red-500 text-slate-400 text-sm transition-colors min-h-[40px]"
            aria-label="Remove from favorites"
          >
            🗑
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function FavoritesPage() {
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => { setFavorites(getFavorites()); }, []);

  const handleRemove = (id: string) => {
    removeFavorite(id);
    setFavorites((p) => p.filter((f) => f.id !== id));
  };

  const flights = favorites.filter((f): f is FavoriteItem & { type: 'flight' } => f.type === 'flight');
  const hotels = favorites.filter((f): f is FavoriteItem & { type: 'hotel' } => f.type === 'hotel');

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-900">{t.saved.favorites}</h1>
        {favorites.length > 0 && <span className="text-sm text-slate-500">{favorites.length} saved</span>}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-5xl mb-3">⭐</p>
          <p className="font-medium text-slate-600 text-lg">{t.saved.noFavorites}</p>
          <p className="text-sm mt-1 text-slate-500">
            Click the <strong>★</strong> on any flight or hotel to save it here.
          </p>
          <a href="/user" className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors">
            ← New Search
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {flights.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Flights ({flights.length})</h2>
              <div className="space-y-3">
                {flights.map((fav) => <FlightFavoriteCard key={fav.id} fav={fav} onRemove={handleRemove} />)}
              </div>
            </section>
          )}
          {hotels.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Hotels ({hotels.length})</h2>
              <div className="space-y-3">
                {hotels.map((fav) => <HotelFavoriteCard key={fav.id} fav={fav} onRemove={handleRemove} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
