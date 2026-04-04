'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';
import { featureFlags } from '@/config/feature-flags';
import { cn } from '@/lib/utils';
import type { AdminStatusResponse, ProviderStatus } from '@/app/api/admin/status/route';

export function ProviderManager() {
  const { t } = useI18n();
  const [status, setStatus] = useState<AdminStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState(featureFlags);

  useEffect(() => {
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((data: AdminStatusResponse) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const flightProviders = status?.providers.filter((p) => p.type === 'flight') ?? [];
  const hotelProviders = status?.providers.filter((p) => p.type === 'hotel') ?? [];

  function ProviderRow({ p }: { p: ProviderStatus }) {
    return (
      <div
        className={cn(
          'rounded-xl p-4 border flex items-center justify-between gap-3',
          p.isActive
            ? 'border-emerald-700/40 bg-emerald-950/30'
            : 'border-slate-700 bg-slate-900'
        )}
      >
        <div className="min-w-0">
          <p className="font-medium text-sm text-white truncate">{p.name}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge variant={p.type === 'flight' ? 'direct' : 'stopover'}>{p.type}</Badge>
            {p.isMock && <Badge variant="mock">mock</Badge>}
            {!p.isMock && (
              p.hasApiKey
                ? <Badge variant="official">✓ key set</Badge>
                : <Badge variant="limited">⚠ no key</Badge>
            )}
          </div>
        </div>
        <span className={cn(
          'text-xs font-semibold px-2.5 py-1 rounded-full',
          p.isActive
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-slate-700 text-slate-400'
        )}>
          {p.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mode banner */}
      <div className={cn(
        'rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2',
        status?.providerMode === 'live'
          ? 'bg-emerald-950/40 border border-emerald-700/40 text-emerald-300'
          : 'bg-amber-950/40 border border-amber-700/40 text-amber-300'
      )}>
        {status?.providerMode === 'live' ? '🟢' : '🟡'}
        Provider mode: <strong>{loading ? '…' : (status?.providerMode ?? 'unknown')}</strong>
        {status?.providerMode !== 'live' && (
          <span className="ml-2 text-xs opacity-70">Set NEXT_PUBLIC_PROVIDER_MODE=live to use live data</span>
        )}
      </div>

      {/* Flight providers */}
      <div>
        <h3 className="text-white font-semibold mb-4">✈ Flight Adapters</h3>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading status…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flightProviders.map((p) => <ProviderRow key={p.id} p={p} />)}
          </div>
        )}
      </div>

      {/* Hotel providers */}
      <div>
        <h3 className="text-white font-semibold mb-4">🏨 Hotel Adapters</h3>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading status…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hotelProviders.map((p) => <ProviderRow key={p.id} p={p} />)}
          </div>
        )}
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
