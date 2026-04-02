'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';
import { featureFlags } from '@/config/feature-flags';
import { cn } from '@/lib/utils';

interface ProviderEntry {
  id: string;
  name: string;
  type: 'flight' | 'hotel';
  isMock: boolean;
  isEnabled: boolean;
  trustLevel: string;
}

const INITIAL_PROVIDERS: ProviderEntry[] = [
  { id: 'mock_flights', name: 'Mock Flights [DEV]', type: 'flight', isMock: true, isEnabled: true, trustLevel: 'official' },
  { id: 'mock_hotels', name: 'Mock Hotels [DEV]', type: 'hotel', isMock: true, isEnabled: true, trustLevel: 'trusted_partner' },
  { id: 'elal', name: 'El Al', type: 'flight', isMock: false, isEnabled: false, trustLevel: 'official' },
  { id: 'ryanair', name: 'Ryanair', type: 'flight', isMock: false, isEnabled: false, trustLevel: 'official' },
  { id: 'easyjet', name: 'easyJet', type: 'flight', isMock: false, isEnabled: false, trustLevel: 'official' },
  { id: 'british_airways', name: 'British Airways', type: 'flight', isMock: false, isEnabled: false, trustLevel: 'official' },
  { id: 'booking_com', name: 'Booking.com', type: 'hotel', isMock: false, isEnabled: false, trustLevel: 'trusted_partner' },
];

export function ProviderManager() {
  const { t } = useI18n();
  const [providers, setProviders] = useState<ProviderEntry[]>(INITIAL_PROVIDERS);
  const [flags, setFlags] = useState(featureFlags);

  function toggleProvider(id: string) {
    setProviders((p) => p.map((x) => (x.id === id ? { ...x, isEnabled: !x.isEnabled } : x)));
  }

  return (
    <div className="space-y-8">
      {/* Provider list */}
      <div>
        <h3 className="text-white font-semibold mb-4">Adapter Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className={cn(
                'rounded-xl p-4 border flex items-center justify-between gap-3',
                p.isEnabled
                  ? 'border-emerald-700/40 bg-emerald-950/30'
                  : 'border-slate-700 bg-slate-900'
              )}
            >
              <div className="min-w-0">
                <p className="font-medium text-sm text-white truncate">{p.name}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge variant={p.type === 'flight' ? 'direct' : 'stopover'}>{p.type}</Badge>
                  {p.isMock && <Badge variant="mock">mock</Badge>}
                  <Badge variant={p.trustLevel as 'official' | 'trusted_partner'}>{p.trustLevel.replace('_', ' ')}</Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant={p.isEnabled ? 'danger' : 'secondary'}
                onClick={() => toggleProvider(p.id)}
              >
                {p.isEnabled ? t.admin.disable : t.admin.enable}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature flags */}
      <div>
        <h3 className="text-white font-semibold mb-4">{t.admin.featureFlags}</h3>
        <Card className="bg-slate-900 border-slate-700 text-slate-300">
          <div className="space-y-3">
            {Object.entries(flags).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <label htmlFor={`flag-${key}`} className="text-sm text-slate-300 font-mono cursor-pointer">
                  {key}
                </label>
                <button
                  id={`flag-${key}`}
                  role="switch"
                  aria-checked={Boolean(val)}
                  onClick={() => setFlags((f) => ({ ...f, [key]: !val }))}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    val ? 'bg-sky-500' : 'bg-slate-600'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                      val ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
