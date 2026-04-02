'use client';

import { useState, useEffect } from 'react';
import { priceAlertService, type PriceAlert } from '@/services/priceAlertService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/i18n';
import { formatPrice } from '@/lib/utils';
import type { SearchParamsInput } from '@/schemas/searchSchema';

interface PriceAlertsProps {
  currentSearch?: SearchParamsInput;
  currentBestPrice?: number;
}

export function PriceAlertsPanel({ currentSearch, currentBestPrice }: PriceAlertsProps) {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentBestPrice ? String(Math.round(currentBestPrice * 0.9)) : '');

  useEffect(() => {
    setAlerts(priceAlertService.getAll());
  }, []);

  function handleAdd() {
    if (!currentSearch || !targetPrice) return;
    priceAlertService.add(currentSearch, Number(targetPrice));
    setAlerts(priceAlertService.getAll());
    setShowAdd(false);
    setTargetPrice('');
  }

  function handleRemove(id: string) {
    priceAlertService.remove(id);
    setAlerts(priceAlertService.getAll());
  }

  return (
    <section aria-label="Price alerts">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          🔔 Price Alerts
          {alerts.filter((a) => a.isActive).length > 0 && (
            <Badge variant="default">{alerts.filter((a) => a.isActive).length}</Badge>
          )}
        </h3>
        {currentSearch && (
          <Button size="sm" variant="secondary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? t.common.cancel : '+ Set alert'}
          </Button>
        )}
      </div>

      {/* Add alert form */}
      {showAdd && currentSearch && (
        <Card padding="sm" className="mb-3 border-orange-100 bg-orange-50">
          <p className="text-xs text-slate-600 mb-2">
            Notify when <strong>{currentSearch.origin} → {currentSearch.destination}</strong> drops below:
          </p>
          <div className="flex gap-2 items-end">
            <Input
              label="Target price (USD)"
              type="number"
              min={1}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="flex-1"
            />
            <Button size="md" onClick={handleAdd} disabled={!targetPrice}>
              Save alert
            </Button>
          </div>
          {currentBestPrice && (
            <p className="text-xs text-slate-400 mt-1">
              Current best: {formatPrice(currentBestPrice, 'USD')}
            </p>
          )}
        </Card>
      )}

      {/* Alert list */}
      {alerts.length === 0 ? (
        <p className="text-xs text-slate-400">No active price alerts.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-white text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-700 truncate">{alert.label}</p>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  <span className="text-slate-500 text-xs">
                    Target: <strong className="text-orange-600">{formatPrice(alert.targetPrice, alert.currency)}</strong>
                  </span>
                  {alert.bestPriceSeen && (
                    <span className="text-slate-400 text-xs">
                      Best seen: {formatPrice(alert.bestPriceSeen, alert.currency)}
                    </span>
                  )}
                  {alert.triggeredAt && (
                    <Badge variant="cheapest">Triggered!</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Badge variant={alert.isActive ? 'direct' : 'stopover'}>
                  {alert.isActive ? 'Active' : 'Off'}
                </Badge>
                <button
                  onClick={() => handleRemove(alert.id)}
                  aria-label="Remove alert"
                  className="text-slate-400 hover:text-red-500 px-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
