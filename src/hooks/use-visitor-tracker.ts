"use client";

import { useEffect, useRef } from "react";

// ============================================================
// useVisitorTracker — track page visits to /api/track-visit
// ============================================================
// Calls /api/track-visit on first page load only (once per session).
// Uses sessionStorage to avoid double-counting within same session.
// Doesn't block page render (fire and forget).
// ============================================================
const SESSION_KEY = 'pbr-visit-tracked';

export function useVisitorTracker() {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    if (typeof window === 'undefined') return;

    // Only track once per browser session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // sessionStorage might be blocked (incognito, etc) — track anyway
    }

    trackedRef.current = true;

    // Fire and forget — don't await
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer: document.referrer || '',
        path: window.location.pathname || '/',
      }),
    }).catch(() => {
      // Silent fail — don't break page
    });
  }, []);
}
