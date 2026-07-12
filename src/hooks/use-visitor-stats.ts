"use client";

import { useState, useEffect } from "react";

// ============================================================
// useVisitorStats — realtime visitor counter
// ============================================================
// Polls /api/track-visit (GET) every 5 seconds for live updates.
// Returns { totalVisitors, todayVisitors, lastVisitAt, loading }.
// ============================================================
interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  lastVisitAt: string;
  loading: boolean;
}

export function useVisitorStats(intervalMs: number = 5000): VisitorStats {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    lastVisitAt: '',
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/track-visit', { method: 'GET' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.ok) {
          setStats({
            totalVisitors: data.totalVisitors || 0,
            todayVisitors: data.todayVisitors || 0,
            lastVisitAt: data.lastVisitAt || '',
            loading: false,
          });
        }
      } catch {
        // Silent fail
      }
    };

    fetchStats();
    const id = setInterval(fetchStats, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return stats;
}
