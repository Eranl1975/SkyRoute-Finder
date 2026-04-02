'use client';

import { useI18n } from '@/i18n';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-slate-100 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} {t.app.name} — {t.app.tagline}</p>
        <p className="text-xs text-slate-400">
          {/* TODO: Replace with real links */}
          <span>Privacy · Terms · Contact</span>
        </p>
      </div>
    </footer>
  );
}
