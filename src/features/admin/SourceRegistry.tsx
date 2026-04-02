'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { TRUSTED_SOURCES } from '@/config/trusted-sources';
import { badgeColor } from '@/skills/sourceTrust/scoring';
import type { SourceMetadata, TrustLevel } from '@/types/trust';
import { cn } from '@/lib/utils';

export function SourceRegistryPanel() {
  const { t } = useI18n();
  const [sources, setSources] = useState<SourceMetadata[]>(TRUSTED_SOURCES);
  const [filter, setFilter] = useState<TrustLevel | 'all'>('all');

  function toggleActive(id: string) {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  }

  const filtered = filter === 'all' ? sources : sources.filter((s) => s.trustLevel === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'official', 'trusted_partner', 'limited', 'unverified', 'blocked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px]',
              filter === f ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
          >
            {f === 'all' ? 'All' : t.trust[f as TrustLevel]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-start">Name</th>
              <th className="px-4 py-3 text-start">Domain</th>
              <th className="px-4 py-3 text-start">Type</th>
              <th className="px-4 py-3 text-start">{t.admin.trustLevel}</th>
              <th className="px-4 py-3 text-start">{t.admin.status}</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((source) => (
              <tr key={source.id} className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{source.name}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{source.domain}</td>
                <td className="px-4 py-3 capitalize">{source.type}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', badgeColor(source.trustLevel))}>
                    {t.trust[source.trustLevel]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-medium', source.isActive ? 'text-emerald-400' : 'text-slate-500')}>
                    {source.isActive ? t.admin.active : t.admin.inactive}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant={source.isActive ? 'danger' : 'secondary'}
                    onClick={() => toggleActive(source.id)}
                  >
                    {source.isActive ? t.admin.disable : t.admin.enable}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
