"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLang } from "@/lib/i18n/context";

// ============================================================
// useTranslatedText — auto-translate text on-demand
// ============================================================
// - Translates text when locale !== 'id'
// - Caches in localStorage (persists across sessions)
// - Skip translation if target is 'id' (source language)
// - Returns original text while loading
// ============================================================

const STORAGE_PREFIX = 'pbr-tr-';

interface CacheEntry {
  text: string;
  ts: number;
}

function loadCache(target: string, text: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `${STORAGE_PREFIX}${target}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, CacheEntry>;
    const entry = map[text.substring(0, 200)];
    if (entry && Date.now() - entry.ts < 30 * 24 * 60 * 60 * 1000) { // 30 days
      return entry.text;
    }
    return null;
  } catch {
    return null;
  }
}

function saveCache(target: string, text: string, translated: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = `${STORAGE_PREFIX}${target}`;
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) as Record<string, CacheEntry> : {};
    map[text.substring(0, 200)] = { text: translated, ts: Date.now() };
    // Limit cache size (keep last 200 entries)
    const entries = Object.entries(map);
    if (entries.length > 200) {
      const trimmed = entries
        .sort((a, b) => b[1].ts - a[1].ts)
        .slice(0, 200)
        .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {} as Record<string, CacheEntry>);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(key, JSON.stringify(map));
    }
  } catch {
    // localStorage might be full or blocked — silent fail
  }
}

export function useTranslatedText(text: string): string {
  const { locale } = useLang();
  const [translated, setTranslated] = useState(text);
  const lastRequestRef = useRef('');

  useEffect(() => {
    // Skip if target is Indonesian (source language)
    if (locale === 'id') {
      setTranslated(text);
      return;
    }

    // Skip if text is empty or too short
    if (!text || text.trim().length < 2) {
      setTranslated(text);
      return;
    }

    // Check localStorage cache
    const cached = loadCache(locale, text);
    if (cached) {
      setTranslated(cached);
      return;
    }

    // Avoid duplicate requests
    const requestKey = `${locale}:${text}`;
    if (lastRequestRef.current === requestKey) return;
    lastRequestRef.current = requestKey;

    // Translate via API
    let cancelled = false;
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target: locale, source: 'id' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok && data.translated) {
          setTranslated(data.translated);
          saveCache(locale, text, data.translated);
        }
      })
      .catch(() => {
        // Silent fail — show original text
      });

    return () => {
      cancelled = true;
    };
  }, [text, locale]);

  return translated;
}

// ============================================================
// <T> component — auto-translate children text
// ============================================================
// Usage:
//   <T>Judul Artikel dari Firestore</T>
//   <T>{post.title}</T>
//   <T>{post.content}</T>
//
// When locale === 'id', returns children as-is (no API call).
// When locale !== 'id', translates via /api/translate with cache.
// ============================================================
interface TProps {
  children: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'li';
  className?: string;
}

export function T({ children, as: Tag = 'span', className }: TProps) {
  const translated = useTranslatedText(children);

  return <Tag className={className}>{translated}</Tag>;
}
