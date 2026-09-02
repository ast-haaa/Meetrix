'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import en from './locales/en.json';
import hi from './locales/hi.json';

export type SupportedLocale = 'en' | 'hi';

const dictionaries: Record<SupportedLocale, any> = { en, hi };

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (path: string) => string;
  formatDate: (date: Date | string) => string;
  formatNumber: (num: number) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  useEffect(() => {
    const stored = localStorage.getItem('acme_app_locale') as SupportedLocale | null;
    if (stored && (stored === 'en' || stored === 'hi')) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('acme_app_locale', newLocale);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let dict = dictionaries[locale] || en;
    for (const k of keys) {
      if (dict && dict[k] !== undefined) {
        dict = dict[k];
      } else {
        // Fallback to English
        let fallbackDict = en as any;
        for (const fk of keys) {
          if (fallbackDict && fallbackDict[fk] !== undefined) {
            fallbackDict = fallbackDict[fk];
          } else {
            return path;
          }
        }
        return typeof fallbackDict === 'string' ? fallbackDict : path;
      }
    }
    return typeof dict === 'string' ? dict : path;
  };

  const formatDate = (dateInput: Date | string): string => {
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return String(dateInput);
    }
  };

  const formatNumber = (num: number): string => {
    try {
      return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-US').format(num);
    } catch {
      return String(num);
    }
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatDate, formatNumber }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
