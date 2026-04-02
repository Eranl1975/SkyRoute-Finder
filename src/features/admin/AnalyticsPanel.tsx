'use client';

import { useEffect, useState } from 'react';
import { fetchAnalyticsSummary } from '@/services/analyticsService';
import { Spinner } from '@/components/ui/Spinner';

interface Summary {
  totalSearches: number;
  avgFlightsReturned: number;
  topRoutes: { origin: string; destination: string; count: number }[];
  errorRate: number;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

export function AnalyticsPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [noSupabase, setNoSupabase] = useState(false);

  useEffect(() => {
    fetchAnalyticsSummary().then((data) => {
      if (!data) setNoSupabase(true);
      else setSummary(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (noSupabase) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 text-center">
        <p className="text-slate-500 text-sm mb-2">
          📊 Analytics requires Supabase connection.
        </p>
        <p className="text-xs text-slate-600">
          Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
          and run the schema migration to enable search_analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Searches"
          value={String(summary!.totalSearches)}
          sub="all time"
        />
        <StatCard
          label="Avg Flights Returned"
          value={String(summary!.avgFlightsReturned)}
          sub="per search"
        />
        <StatCard
          label="Error Rate"
          value={`${(summary!.errorRate * 100).toFixed(1)}%`}
          sub="searches with errors"
        />
        <StatCard
          label="Top Routes"
          value={String(summary!.topRoutes.length)}
          sub="distinct routes"
        />
      </div>

      {/* Top routes table */}
      {summary!.topRoutes.length > 0 && (
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300">Top Routes</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-2 text-start text-xs text-slate-500">Route</th>
                <th className="px-4 py-2 text-end text-xs text-slate-500">Searches</th>
              </tr>
            </thead>
            <tbody>
              {summary!.topRoutes.map((r) => (
                <tr key={`${r.origin}-${r.destination}`} className="border-t border-slate-800">
                  <td className="px-4 py-2 text-slate-300">
                    {r.origin} → {r.destination}
                  </td>
                  <td className="px-4 py-2 text-end text-sky-400 font-medium">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-600">
        Data source: Supabase <code>search_analytics</code> table · No PII collected
      </p>
    </div>
  );
}
