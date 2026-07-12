"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import { LOCALES, type Locale } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/button";

// ============================================================
// LanguageSwitcher — dropdown untuk ganti bahasa
// ============================================================
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full gap-1.5 h-9 px-3"
        onClick={() => setOpen(!open)}
      >
        <Globe className="h-4 w-4" />
        {!compact && <span className="text-sm font-medium">{current.flag}</span>}
        {!compact && <span className="text-xs">{current.code.toUpperCase()}</span>}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-background border border-border shadow-xl z-50 overflow-hidden">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code as Locale);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${
                l.code === locale ? 'bg-primary/5 font-semibold' : ''
              }`}
            >
              <span className="text-lg">{l.flag}</span>
              <span className="flex-1 text-left">{l.label}</span>
              {l.code === locale && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
