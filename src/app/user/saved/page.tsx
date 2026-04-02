'use client';

import { useI18n } from '@/i18n';
import { EmptyState } from '@/components/results/EmptyState';

export default function SavedPage() {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.saved.savedSearches}</h1>
      {/* TODO: Connect to Supabase saved_searches table */}
      <EmptyState title={t.saved.noSaved} type="general" />
    </div>
  );
}
