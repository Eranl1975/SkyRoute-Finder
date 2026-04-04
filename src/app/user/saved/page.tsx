'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSavedSearches, deleteSavedSearch, type StoredSearch } from '@/lib/storage';
import { formatPrice } from '@/lib/utils';

function formatSavedDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  } catch { return iso; }
}

function SearchCard({ s, onDelete }: { s: StoredSearch; onDelete: (id: string) => void }) {
  return (
    <Card className="border-slate-200 hover:border-sky-200 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-slate-900">{s.name}</h3>
            <span className="text-xs text-slate-400">Saved {formatSavedDate(s.savedAt)}</span>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            ✈ <strong>{s.params.origin}</strong> → <strong>{s.params.destination}</strong>
            &nbsp;·&nbsp;{s.params.startDate} → {s.params.endDate}
            &nbsp;·&nbsp;{s.params.passengers} passenger{s.params.passengers !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {s.summary.flightCount > 0 && (
              <Badge variant="direct">{s.summary.flightCount} flights found</Badge>
            )}
            {s.summary.bestPrice != null && s.summary.bestPriceCurrency && (
              <Badge variant="cheapest">Best: {formatPrice(s.summary.bestPrice, s.summary.bestPriceCurrency)}</Badge>
            )}
            {s.summary.hotelName && (
              <Badge variant="trusted_partner">🏨 {s.summary.hotelName}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <a
            href="/user"
            onClick={(e) => {
              e.preventDefault();
              sessionStorage.setItem('skyroute_rerun', JSON.stringify(s.params));
              window.location.href = '/user';
            }}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors min-h-[40px] flex items-center"
          >
            Re-run ↗
          </a>
          <button
            onClick={() => onDelete(s.id)}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:border-red-300 hover:text-red-500 text-slate-400 text-sm transition-colors min-h-[40px]"
            aria-label="Delete saved search"
          >
            🗑
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function SavedPage() {
  const { t } = useI18n();
  const [searches, setSearches] = useState<StoredSearch[]>([]);

  useEffect(() => { setSearches(getSavedSearches()); }, []);

  const handleDelete = (id: string) => {
    deleteSavedSearch(id);
    setSearches((p) => p.filter((s) => s.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-900">{t.saved.savedSearches}</h1>
        {searches.length > 0 && <span className="text-sm text-slate-500">{searches.length} saved</span>}
      </div>

      {searches.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-5xl mb-3">💾</p>
          <p className="font-medium text-slate-600 text-lg">No saved searches yet</p>
          <p className="text-sm mt-1 text-slate-500">
            After searching, click <strong>&ldquo;Save this search&rdquo;</strong> below the results.
          </p>
          <a href="/user" className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors">
            ← New Search
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {searches.map((s) => <SearchCard key={s.id} s={s} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
