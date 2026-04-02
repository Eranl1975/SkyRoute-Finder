'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { SearchLog } from '@/types/search';

interface LogsPanelProps {
  logs?: SearchLog[];
}

const levelColors = {
  info:  'text-sky-400',
  warn:  'text-amber-400',
  error: 'text-red-400',
};

export function LogsPanel({ logs: initialLogs = [] }: LogsPanelProps) {
  const { t } = useI18n();
  const [logs, setLogs] = useState<SearchLog[]>(initialLogs);
  const [filter, setFilter] = useState<'all' | SearchLog['level']>('all');

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(['all', 'info', 'warn', 'error'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors min-h-[36px]',
                filter === f ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setLogs([])} className="text-slate-400">
          {t.admin.clearLogs}
        </Button>
      </div>

      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-slate-600 text-center py-6">{t.admin.noLogs}</p>
        ) : (
          <div className="space-y-1">
            {filtered.map((log, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-slate-600 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn('uppercase font-bold w-10 shrink-0', levelColors[log.level])}>
                  {log.level.slice(0, 3)}
                </span>
                <span className="text-sky-400 shrink-0 w-24 truncate">[{log.skill}]</span>
                <span className="text-slate-300 flex-1">{log.message}</span>
                {log.durationMs !== undefined && (
                  <span className="text-slate-600 shrink-0">{log.durationMs}ms</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
