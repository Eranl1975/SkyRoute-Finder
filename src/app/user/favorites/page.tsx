'use client';

import { useI18n } from '@/i18n';
import { EmptyState } from '@/components/results/EmptyState';

export default function FavoritesPage() {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.saved.favorites}</h1>
      {/* TODO: Connect to Supabase favorites table */}
      <EmptyState title={t.saved.noFavorites} type="general" />
    </div>
  );
}
