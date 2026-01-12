'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { I18nContext, translations, type TranslationKey } from '@/lib/i18n';
import type { Language } from '@/types';

interface I18nProviderProps {
  children: React.ReactNode;
  locale: Language;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const pathname = usePathname();

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] || key;
    },
    [locale]
  );

  const isRtl = locale === 'he';

  const setLanguage = useCallback(
    (lang: Language) => {
      if (lang === locale) return;

      // Get the current path without locale prefix
      let basePath = pathname;

      // Remove /en prefix if present
      if (pathname.startsWith('/en')) {
        basePath = pathname.slice(3) || '/';
      }

      // Navigate to new locale
      // Use window.location for full reload to ensure HTML dir attribute updates
      if (lang === 'en') {
        window.location.href = `/en${basePath === '/' ? '' : basePath}`;
      } else {
        // Hebrew is default, no prefix
        window.location.href = basePath;
      }
    },
    [locale, pathname]
  );

  return (
    <I18nContext.Provider
      value={{
        language: locale,
        setLanguage,
        t,
        isRtl,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}
