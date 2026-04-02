'use client';

import { useState } from 'react';
import { SourceRegistryPanel } from '@/features/admin/SourceRegistry';
import { LogsPanel } from '@/features/admin/LogsPanel';
import { ProviderManager } from '@/features/admin/ProviderManager';
import { AnalyticsPanel } from '@/features/admin/AnalyticsPanel';
import { OfficialOnlyToggle } from '@/features/admin/OfficialOnlyToggle';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';

type Tab = 'providers' | 'sources' | 'logs' | 'analytics' | 'settings';

const TABS: Tab[] = ['providers', 'sources', 'logs', 'analytics', 'settings'];

export default function AdminPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('providers');

  const tabLabel: Record<Tab, string> = {
    providers: t.admin.providers,
    sources: t.admin.sources,
    logs: t.admin.logs,
    analytics: t.admin.analytics,
    settings: t.admin.settings,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">{t.admin.dashboard}</h1>
        <p className="text-slate-400 text-sm">
          Provider mode: <span className="text-amber-400 font-mono">{env.providerMode.toUpperCase()}</span>
        </p>
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
              'px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap min-h-[44px]',
              activeTab === tab
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {tabLabel[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'providers' && <ProviderManager />}
        {activeTab === 'sources' && <SourceRegistryPanel />}
        {activeTab === 'logs' && <LogsPanel />}
        {activeTab === 'analytics' && <AnalyticsPanel />}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <OfficialOnlyToggle />
            <div className="text-slate-400 text-sm bg-slate-900 rounded-xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold mb-3">More Settings</h3>
              <ul className="space-y-2 list-disc list-inside text-slate-500">
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
