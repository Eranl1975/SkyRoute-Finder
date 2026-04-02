'use client';

import { useState, useCallback } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DayFare {
  date: string;   // YYYY-MM-DD
  price: number | null;
  currency: string;
  isMock: boolean;
}

interface FlexibleDateViewProps {
  origin: string;
  destination: string;
  passengers: number;
  onSelectDate: (date: string) => void;
}

// Mock cheapest-by-day data.
// TODO: Replace with real provider call: query each day in the month in parallel.
function generateMockMonth(origin: string, destination: string, month: Date): DayFare[] {
  return eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }).map((day) => {
    const dow = day.getDay();
    // Weekends cheaper in mock
    const base = 350 + Math.round(Math.random() * 400);
    const discount = dow === 2 || dow === 3 ? 0.8 : 1;
    const price = origin && destination ? Math.round(base * discount) : null;
    return {
      date: format(day, 'yyyy-MM-dd'),
      price,
      currency: 'USD',
      isMock: true,
    };
  });
}

const MONTHS_AHEAD = 3;

export function FlexibleDateView({ origin, destination, passengers, onSelectDate }: FlexibleDateViewProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today);
  const [loading, setLoading] = useState(false);
  const [fares, setFares] = useState<DayFare[]>(() =>
    generateMockMonth(origin, destination, today)
  );

  const loadMonth = useCallback(async (month: Date) => {
    setLoading(true);
    setViewMonth(month);
    // Simulate async fetch (replace with real /api/flexible-dates call)
    await new Promise((r) => setTimeout(r, 400));
    setFares(generateMockMonth(origin, destination, month));
    setLoading(false);
  }, [origin, destination]);

  const days = fares;
  const prices = days.map((d) => d.price).filter((p): p is number => p !== null);
  const minPrice = prices.length ? Math.min(...prices) : null;

  function priceColor(price: number | null): string {
    if (!price || !minPrice) return 'bg-slate-50 text-slate-400';
    const ratio = price / minPrice;
    if (ratio <= 1.05) return 'bg-emerald-100 text-emerald-800 font-semibold ring-1 ring-emerald-300';
    if (ratio <= 1.2)  return 'bg-sky-50 text-sky-700';
    if (ratio <= 1.5)  return 'bg-amber-50 text-amber-700';
    return 'bg-red-50 text-red-700';
  }

  const canGoBack = viewMonth > addDays(today, 1);
  const canGoForward = viewMonth < addDays(today, MONTHS_AHEAD * 31);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 text-sm">
          📅 Cheapest fares — {format(viewMonth, 'MMMM yyyy')}
          {fares[0]?.isMock && <span className="text-xs text-purple-500 ms-2">[mock]</span>}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => loadMonth(addDays(startOfMonth(viewMonth), -1))}
            disabled={!canGoBack || loading}
            aria-label="Previous month"
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 min-h-[36px] min-w-[36px]"
          >‹</button>
          <button
            onClick={() => loadMonth(addDays(endOfMonth(viewMonth), 1))}
            disabled={!canGoForward || loading}
            aria-label="Next month"
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 min-h-[36px] min-w-[36px]"
          >›</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <>
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Leading empty cells */}
            {Array.from({ length: startOfMonth(viewMonth).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const date = parseISO(day.date);
              const isPast = date < today;
              return (
                <button
                  key={day.date}
                  disabled={isPast || day.price === null}
                  onClick={() => onSelectDate(day.date)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl p-1.5 transition-all min-h-[52px]',
                    'text-xs disabled:opacity-30 disabled:cursor-not-allowed',
                    isPast ? 'opacity-20' : priceColor(day.price),
                    !isPast && day.price !== null && 'hover:scale-105 cursor-pointer hover:shadow-sm'
                  )}
                  aria-label={`${day.date}: ${day.price ? formatPrice(day.price, day.currency) : 'unavailable'}`}
                >
                  <span className="font-medium">{format(date, 'd')}</span>
                  {day.price !== null && (
                    <span className="text-[10px] leading-tight mt-0.5">
                      {formatPrice(day.price, day.currency, 'en-US').replace('$', '')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 ring-1 ring-emerald-300 inline-block" /> Best price</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-50 inline-block" /> Good</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 inline-block" /> Higher</span>
          </div>
        </>
      )}
    </Card>
  );
}
