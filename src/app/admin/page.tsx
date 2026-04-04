'use client';

import { useState, useEffect } from 'react';
import { SourceRegistryPanel } from '@/features/admin/SourceRegistry';
import { LogsPanel } from '@/features/admin/LogsPanel';
import { AnalyticsPanel } from '@/features/admin/AnalyticsPanel';
import { OfficialOnlyToggle } from '@/features/admin/OfficialOnlyToggle';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';
import { featureFlags } from '@/config/feature-flags';
import type { AdminStatusResponse, ProviderStatus } from '@/app/api/admin/status/route';

type Tab = 'overview' | 'providers' | 'sources' | 'logs' | 'analytics' | 'settings';
const TABS: Tab[] = ['overview', 'providers', 'sources', 'logs', 'analytics', 'settings'];
const TAB_ICONS: Record<Tab, string> = {
  overview: '🖥',
  providers: '🔌',
  sources: '📋',
  logs: '📜',
  analytics: '📊',
  settings: '⚙',
};

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={cn('inline-block w-2.5 h-2.5 rounded-full shrink-0', ok ? 'bg-emerald-400' : 'bg-slate-600')} />
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-xl border p-4', accent ? 'border-sky-700/50 bg-sky-950/40' : 'border-slate-700 bg-slate-900')}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
      </div>
      <p className={cn('text-2xl font-bold', accent ? 'text-sky-300' : 'text-white')}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

function ProviderCard({ p }: { p: ProviderStatus }) {
  return (
    <div className={cn(
      'rounded-xl border p-4 flex items-start justify-between gap-3',
      p.isActive ? 'border-emerald-700/40 bg-emerald-950/20' : 'border-slate-700 bg-slate-900'
    )}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusDot ok={p.isActive} />
          <p className="font-medium text-sm text-white truncate">{p.name}</p>
        </div>
        <div className="flex gap-2 flex-wrap mt-1">
          <span className={cn('text-xs px-2 py-0.5 rounded-full', p.type === 'flight' ? 'bg-sky-900 text-sky-300' : 'bg-emerald-900 text-emerald-300')}>
            {p.type === 'flight' ? '✈ Flight' : '🏨 Hotel'}
          </span>
          {p.isMock && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900 text-purple-300">mock</span>}
          {!p.isMock && (p.hasApiKey
            ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300">✓ key set</span>
            : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900 text-amber-300">⚠ no key</span>
          )}
        </div>
      </div>
      <span className={cn(
        'text-xs font-bold px-2.5 py-1 rounded-full shrink-0',
        p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
      )}>
        {p.isActive ? 'LIVE' : 'OFF'}
      </span>
    </div>
  );
}

function OverviewTab({ status }: { status: AdminStatusResponse | null }) {
  const isLive = env.providerMode === 'live';
  const activeCount = status?.providers.filter((p) => p.isActive).length ?? 0;
  const totalCount = status?.providers.length ?? 0;
  const missingKeys = status?.providers.filter((p) => !p.isMock && !p.hasApiKey) ?? [];

  return (
    <div className="space-y-8">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon="🌐"
          label="Mode"
          value={isLive ? 'LIVE' : 'MOCK'}
          sub="NEXT_PUBLIC_PROVIDER_MODE"
          accent={isLive}
        />
        <StatCard
          icon="🔌"
          label="Active Adapters"
          value={`${activeCount} / ${totalCount}`}
          sub="providers running"
        />
        <StatCard
          icon="🔑"
          label="API Keys Missing"
          value={String(missingKeys.length)}
          sub={missingKeys.length ? missingKeys.map((p) => p.id).join(', ') : 'all good'}
        />
        <StatCard
          icon="🏗"
          label="Build"
          value="v1.4.1"
          sub="latest deployed"
          accent
        />
      </div>

      {/* Provider grid */}
      <div>
        <h3 className="text-white font-semibold mb-3">All Adapters</h3>
        {status ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {status.providers.map((p) => <ProviderCard key={p.id} p={p} />)}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Loading provider status…</p>
        )}
      </div>

      {/* Feature flags summary */}
      <div>
        <h3 className="text-white font-semibold mb-3">Feature Flags</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(featureFlags).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
              <StatusDot ok={Boolean(val)} />
              <span className="text-xs text-slate-300 font-mono truncate">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Env checklist */}
      <div>
        <h3 className="text-white font-semibold mb-3">Environment Checklist</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {[
            { label: 'Provider mode = live', ok: isLive, fix: 'Set NEXT_PUBLIC_PROVIDER_MODE=live in Vercel' },
            { label: 'Duffel flights API key', ok: status?.providers.find(p => p.id === 'duffel')?.hasApiKey ?? false, fix: 'Add DUFFEL_ACCESS_TOKEN from app.duffel.com' },
            { label: 'RapidAPI hotel key', ok: status?.providers.find(p => p.id === 'booking_com_rapid')?.hasApiKey ?? false, fix: 'Add RAPIDAPI_BOOKING_KEY from rapidapi.com/apidojo/api/booking' },
          ].map(({ label, ok, fix }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <StatusDot ok={ok} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', ok ? 'text-white' : 'text-slate-400')}>{label}</p>
                {!ok && <p className="text-xs text-amber-500 mt-0.5">{fix}</p>}
              </div>
              <span className={cn('text-xs font-bold', ok ? 'text-emerald-400' : 'text-slate-600')}>{ok ? '✓' : '✗'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProvidersTab({ status }: { status: AdminStatusResponse | null }) {
  const isLive = status?.providerMode === 'live';
  const flights = status?.providers.filter((p) => p.type === 'flight') ?? [];
  const hotels = status?.providers.filter((p) => p.type === 'hotel') ?? [];

  return (
    <div className="space-y-8">
      <div className={cn(
        'rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2',
        isLive ? 'bg-emerald-950/40 border border-emerald-700/40 text-emerald-300' : 'bg-amber-950/40 border border-amber-700/40 text-amber-300'
      )}>
        {isLive ? '🟢' : '🟡'}
        Provider mode: <strong>{status ? status.providerMode.toUpperCase() : '…'}</strong>
        {!isLive && <span className="ml-2 text-xs opacity-70">Set NEXT_PUBLIC_PROVIDER_MODE=live to activate live data</span>}
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">✈ Flight Adapters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {flights.map((p) => <ProviderCard key={p.id} p={p} />)}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">🏨 Hotel Adapters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hotels.map((p) => <ProviderCard key={p.id} p={p} />)}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">⚙ Feature Flags</h3>
        <div className="bg-slate-900 border border-slate-700 rounded-xl divide-y divide-slate-800">
          {Object.entries(featureFlags).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm text-slate-300 font-mono">{key}</span>
              <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', val ? 'bg-emerald-900 text-emerald-400' : 'bg-slate-800 text-slate-500')}>
                {val ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [status, setStatus] = useState<AdminStatusResponse | null>(null);

  useEffect(() => {
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((d: AdminStatusResponse) => setStatus(d))
      .catch(() => {});
  }, []);

  const tabLabel: Record<Tab, string> = {
    overview: 'Overview',
    providers: t.admin.providers,
    sources: t.admin.sources,
    logs: t.admin.logs,
    analytics: t.admin.analytics,
    settings: t.admin.settings,
  };

  const activeProviders = status?.providers.filter((p) => p.isActive).length ?? 0;

  return (
    <div>
      {/* Dashboard header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">⚙ Admin Dashboard</h1>
          <p className="text-slate-400 text-sm flex items-center gap-2 flex-wrap">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
              env.providerMode === 'live' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
            )}>
              {env.providerMode === 'live' ? '🟢 LIVE' : '🟡 MOCK'}
            </span>
            <span>{activeProviders} adapter{activeProviders !== 1 ? 's' : ''} active</span>
            <span className="text-slate-600">·</span>
            <span>SkyRoute Finder v1.4.1</span>
          </p>
        </div>
        <a
          href="/user"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-slate-700"
        >
          ← Back to User App
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-800 overflow-x-auto" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-1.5',
              activeTab === tab
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <span>{TAB_ICONS[tab]}</span>
            {tabLabel[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'overview'   && <OverviewTab status={status} />}
        {activeTab === 'providers'  && <ProvidersTab status={status} />}
        {activeTab === 'sources'    && <SourceRegistryPanel />}
        {activeTab === 'logs'       && <LogsPanel />}
        {activeTab === 'analytics'  && <AnalyticsPanel />}
        {activeTab === 'settings'   && (
          <div className="space-y-4">
            <OfficialOnlyToggle />
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">🔑 Required API Keys</h3>
              <div className="space-y-3 text-sm text-slate-400">
                {[
                  { key: 'DUFFEL_ACCESS_TOKEN', desc: 'Live flight search (300+ airlines)', url: 'https://app.duffel.com' },
                  { key: 'RAPIDAPI_BOOKING_KEY', desc: 'Live hotel search via Booking.com', url: 'https://rapidapi.com/apidojo/api/booking' },
                  { key: 'ADMIN_SECRET', desc: 'Admin panel access (already set)', url: '' },
                ].map(({ key, desc, url }) => (
                  <div key={key} className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-3">
                    <code className="text-sky-400 text-xs mt-0.5 shrink-0">{key}</code>
                    <div className="flex-1">
                      <p>{desc}</p>
                      {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-sky-500 text-xs hover:underline">{url} ↗</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-3">More Settings</h3>
              <ul className="space-y-2 list-disc list-inside text-slate-500 text-sm">
                <li>Max results per search — coming in Phase 2</li>
                <li>Cache TTL configuration — coming in Phase 2</li>
                <li>Admin notification email — coming in Phase 2</li>
                <li>Blocked domains management — use Sources tab</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
