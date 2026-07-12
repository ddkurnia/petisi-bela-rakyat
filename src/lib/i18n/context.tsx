"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { type Locale, getTranslation } from "./translations";

// ============================================================
// LanguageProvider — global language state
// ============================================================
// - Default: 'id' (Indonesia)
// - Persisted to localStorage
// - Detect browser language on first visit (fallback to 'id')
// - Exposes useLang() hook for translations
// ============================================================

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;  // translate function
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'pbr-locale';

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'id';

  // Check localStorage first
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && ['id', 'en', 'zh'].includes(saved)) return saved;
  } catch {}

  // Detect browser language
  const browserLang = (navigator.language || 'id').toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('en')) return 'en';

  return 'id'; // default
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id');

  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {}
    // Update <html lang="..."> for SEO
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : newLocale;
    }
  }, []);

  const t = useCallback((path: string) => {
    return getTranslation(locale, path);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ============================================================
// Hook: useLang
// ============================================================
export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if used outside provider (shouldn't happen)
    return {
      locale: 'id' as Locale,
      setLocale: () => {},
      t: (path: string) => path,
    };
  }
  return ctx;
}
