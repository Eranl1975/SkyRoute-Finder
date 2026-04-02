'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import en, { type TranslationKeys } from './en';
import he from './he';
import es from './es';
import type { SupportedLocale } from '@/lib/constants';
import { RTL_LOCALES } from '@/lib/constants';

const translations: Record<SupportedLocale, TranslationKeys> = { en, he: he as unknown as TranslationKeys, es: es as unknown as TranslationKeys };

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (l: SupportedLocale) => void;
  t: TranslationKeys;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'skyroute_locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    if (stored && translations[stored]) setLocaleState(stored);
  }, []);

  const setLocale = useCallback((l: SupportedLocale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
    document.documentElement.dir = RTL_LOCALES.includes(l) ? 'rtl' : 'ltr';
  }, []);

  // Sync dir on locale change
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  const isRTL = RTL_LOCALES.includes(locale);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t: translations[locale],
        isRTL,
        dir: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

// Interpolate {key} placeholders: interpolate('Hello {name}', { name: 'World' })
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
