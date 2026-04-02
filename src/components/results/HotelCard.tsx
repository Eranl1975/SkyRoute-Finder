'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookingLink } from './BookingLink';
import { BookingApprovalModal } from '@/features/booking/BookingApprovalModal';
import { useI18n } from '@/i18n';
import { featureFlags } from '@/config/feature-flags';
import type { NormalizedHotel } from '@/types/hotel';

interface HotelCardProps {
  hotel: NormalizedHotel;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export function HotelCard({ hotel, onFavorite, isFavorited }: HotelCardProps) {
  const { t } = useI18n();
  const [showApproval, setShowApproval] = useState(false);

  return (
    <>
    {showApproval && (
      <BookingApprovalModal
        booking={{ type: 'hotel', item: hotel }}
        onConfirm={() => setShowApproval(false)}
        onCancel={() => setShowApproval(false)}
      />
    )}
    <Card className="border-sky-100">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-base">{hotel.name}</h3>
            {hotel.isMock && featureFlags.showMockBadge && (
              <Badge variant="mock">[MOCK]</Badge>
            )}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-amber-400 text-sm" aria-label={`${hotel.stars} stars`}>
              {'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}
            </span>
            <Badge variant={hotel.providerTrust}>{hotel.trustBadge}</Badge>
          </div>

          {/* Location */}
          <p className="text-sm text-slate-500 mb-1">
            📍 {hotel.address} — <span className="text-sky-600 font-medium">{hotel.touristArea}</span>
          </p>
          {hotel.attractionNote && (
            <p className="text-xs text-emerald-600 font-medium mb-1">
              🗺 {hotel.attractionNote}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              {hotel.rating.toFixed(1)}
            </span>
            <span className="text-sm text-slate-600">
              {hotel.reviewCount.toLocaleString()} {t.hotel.reviews}
            </span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 sm:w-36 shrink-0">
          <div className="text-end">
            <p className="text-2xl font-bold text-slate-900">{hotel.formattedPrice}</p>
            <p className="text-xs text-slate-400">{t.hotel.perNight}</p>
          </div>
          <div className="flex gap-2 sm:flex-col sm:w-full">
            <button
              onClick={() => setShowApproval(true)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors min-h-[44px]"
            >
              {featureFlags.bookingEnabled ? t.hotel.bookHotel : 'Review & Book'}
            </button>
            <BookingLink url={hotel.bookingUrl} label={t.hotel.bookHotel} />
            {onFavorite && (
              <button
                onClick={() => onFavorite(hotel.id)}
                aria-label={isFavorited ? t.saved.removeFavorite : t.saved.addFavorite}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-orange-400 hover:border-orange-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {isFavorited ? '❤️' : '🤍'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
    </>
  );
}
