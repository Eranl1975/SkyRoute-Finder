'use client';

import { useState, useEffect } from 'react';
import { featureFlags } from '@/config/feature-flags';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'skyroute_official_only';

/** Reads the current official-only setting, persisted in localStorage. */
export function getOfficialOnly(): boolean {
  if (typeof window === 'undefined') return featureFlags.officialSitesOnlyMode;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null ? stored === 'true' : featureFlags.officialSitesOnlyMode;
}

export function OfficialOnlyToggle({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => { setEnabled(getOfficialOnly()); }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    // TODO: POST to /api/admin/settings when Supabase auth is live
  }

  return (
    <div className={cn('flex items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700', className)}>
      <div>
        <p className="text-sm font-medium text-white">Official Sites Only</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Restrict results to direct official airline websites only.
          Excludes aggregators and limited-trust sources.
        </p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle official sites only mode"
        onClick={toggle}
        className={cn(
          'relative inline-flex h-7 w-13 shrink-0 items-center rounded-full transition-colors',
          enabled ? 'bg-sky-500' : 'bg-slate-600'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
            enabled ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}
