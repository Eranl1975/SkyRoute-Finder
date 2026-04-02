'use client';

import { useI18n } from '@/i18n';
import type { SupportedLocale } from '@/lib/constants';
import { cn } from '@/lib/utils';

const LANG_LABELS: Record<SupportedLocale, string> = {
  en: 'EN',
  he: 'עב',
  es: 'ES',
};

const LANG_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  he: 'עברית',
  es: 'Español',
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={cn('flex items-center gap-1', className)} role="group" aria-label="Language">
      {(Object.keys(LANG_LABELS) as SupportedLocale[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          aria-label={`Switch to ${LANG_NAMES[lang]}`}
          aria-pressed={locale === lang}
          className={cn(
            'px-2 py-1 rounded-lg text-xs font-semibold transition-all min-w-[36px] min-h-[36px]',
            locale === lang
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          {LANG_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
