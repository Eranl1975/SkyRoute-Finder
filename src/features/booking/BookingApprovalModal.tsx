'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import { featureFlags } from '@/config/feature-flags';
import type { NormalizedFlight } from '@/types/flight';
import type { NormalizedHotel } from '@/types/hotel';

type BookingItem = { type: 'flight'; item: NormalizedFlight } | { type: 'hotel'; item: NormalizedHotel };

interface BookingApprovalModalProps {
  booking: BookingItem;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BookingApprovalModal({ booking, onConfirm, onCancel }: BookingApprovalModalProps) {
  const { t } = useI18n();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isFlight = booking.type === 'flight';
  const item = booking.item;

  async function handleConfirm() {
    if (!agreed) return;
    setSubmitting(true);

    if (!featureFlags.bookingEnabled) {
      alert('Automatic booking is disabled. You will be redirected to the booking site instead.');
      setSubmitting(false);
      onCancel();
      window.open(item.bookingUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // TODO: POST /api/booking/request when bookingEnabled = true
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    onConfirm();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4" padding="lg">
        <h2 id="approval-title" className="text-lg font-bold text-slate-900 mb-1">
          {isFlight ? '✈ Confirm Flight Booking' : '🏨 Confirm Hotel Booking'}
        </h2>

        {!featureFlags.bookingEnabled && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
            ⚠ Automatic booking is <strong>disabled</strong>. Confirming will open the official booking site in a new tab.
          </div>
        )}

        {/* Item summary */}
        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-1 text-sm">
          {isFlight ? (
            <>
              <p className="font-semibold text-slate-900">{(item as NormalizedFlight).airline}</p>
              <p className="text-slate-600">{(item as NormalizedFlight).origin} → {(item as NormalizedFlight).destination}</p>
              <p className="text-slate-600">{(item as NormalizedFlight).formattedDeparture}</p>
              <p className="text-xl font-bold text-sky-700">{(item as NormalizedFlight).formattedPrice}</p>
              <Badge variant={(item as NormalizedFlight).providerTrust}>{(item as NormalizedFlight).trustBadge}</Badge>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-900">{(item as NormalizedHotel).name}</p>
              <p className="text-slate-600">{(item as NormalizedHotel).touristAreaNote}</p>
              <p className="text-xl font-bold text-sky-700">{(item as NormalizedHotel).formattedPrice} / night</p>
              <Badge variant={(item as NormalizedHotel).providerTrust}>{(item as NormalizedHotel).trustBadge}</Badge>
            </>
          )}
        </div>

        {/* Agreement checkbox */}
        <label className="flex gap-3 items-start cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="accent-sky-500 w-4 h-4 mt-0.5 shrink-0"
          />
          <span className="text-sm text-slate-600">
            I confirm the details above and want to proceed to booking.
            Prices may change before payment is complete on the provider site.
          </span>
        </label>

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button
            variant="primary"
            fullWidth
            disabled={!agreed}
            loading={submitting}
            onClick={handleConfirm}
          >
            {featureFlags.bookingEnabled ? 'Confirm & Book' : 'Go to Booking Site'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
