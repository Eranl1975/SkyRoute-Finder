'use client';

interface AirbnbBannerProps {
  destination: string; // IATA code or city name
  checkIn: string;     // YYYY-MM-DD
  checkOut: string;    // YYYY-MM-DD
  guests: number;
}

export function AirbnbBanner({ destination, checkIn, checkOut, guests }: AirbnbBannerProps) {
  const url = new URL('https://www.airbnb.com/s/homes');
  url.searchParams.set('query', destination);
  url.searchParams.set('checkin', checkIn);
  url.searchParams.set('checkout', checkOut);
  url.searchParams.set('adults', String(guests));

  return (
    <div className="rounded-2xl border border-[#FF5A5F]/30 bg-gradient-to-r from-[#FF5A5F]/5 to-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Airbnb logo mark */}
        <div className="w-10 h-10 rounded-xl bg-[#FF5A5F] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6" aria-hidden="true">
            <path d="M22.5 12.6c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6 6 2.7 6 6zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">Also search on Airbnb</p>
          <p className="text-xs text-slate-500">
            Apartments, villas &amp; unique stays in {destination} · {checkIn} → {checkOut} · {guests} guest{guests !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <a
        href={url.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 rounded-xl bg-[#FF5A5F] hover:bg-[#e54b50] text-white text-sm font-semibold transition-colors min-h-[44px] flex items-center gap-2 shrink-0"
      >
        Search Airbnb ↗
      </a>
    </div>
  );
}
