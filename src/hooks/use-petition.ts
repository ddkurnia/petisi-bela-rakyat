"use client";

import { useState, useEffect, useCallback } from "react";

// ============================================================
// useDeviceFingerprint — generate unique ID per device
// ============================================================
// Strategy:
//   - Check localStorage for existing fingerprint
//   - If not found, generate new one (crypto.randomUUID + timestamp + random)
//   - Combine with browser info (userAgent, language, timezone) for extra entropy
//   - Persist to localStorage for future visits
//
// This prevents same device from signing petition twice.
// ============================================================
const STORAGE_KEY = 'pbr-device-fp';

export function useDeviceFingerprint(): string {
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      let fp = localStorage.getItem(STORAGE_KEY);
      if (!fp) {
        // Generate new fingerprint
        const random = crypto.randomUUID?.() || Math.random().toString(36).substring(2);
        const timestamp = Date.now().toString(36);
        const browserInfo = [
          navigator.userAgent,
          navigator.language,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
          String(screen.width) + 'x' + String(screen.height),
        ].join('|');
        // Hash browserInfo for shorter, consistent format
        fp = `${random}_${timestamp}_${btoa(browserInfo).substring(0, 32)}`;
        localStorage.setItem(STORAGE_KEY, fp);
      }
      setFingerprint(fp);
    } catch {
      // localStorage might be blocked — use session-only fallback
      const fallback = `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      setFingerprint(fallback);
    }
  }, []);

  return fingerprint;
}

// ============================================================
// usePetitionSignatures — realtime signatures for a campaign
// ============================================================
interface PublicSignature {
  id: string;
  name: string;
  city: string;
  province: string;
  locationLabel: string;
  comment: string;
  createdAt: string;
  emailMasked: string;
}

interface PetitionSignaturesState {
  signatures: PublicSignature[];
  count: number;
  loading: boolean;
  hasSigned: boolean;
  error: string | null;
  refresh: () => void;
  sign: (data: SignData) => Promise<{ ok: boolean; error?: string; code?: string }>;
}

interface SignData {
  campaignId: string;
  name: string;
  email: string;
  address: string;
  city: string;
  province: string;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string;
  comment?: string;
}

export function usePetitionSignatures(campaignId: string, pollMs: number = 5000): PetitionSignaturesState {
  const [signatures, setSignatures] = useState<PublicSignature[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasSigned, setHasSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deviceFingerprint = useDeviceFingerprint();

  const fetchSignatures = useCallback(async () => {
    try {
      const res = await fetch(`/api/sign-petition?campaignId=${encodeURIComponent(campaignId)}&limit=50`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok) {
        setSignatures(data.signatures || []);
        setCount(data.count || 0);
        // Check if current device has signed (by looking at localStorage)
        if (typeof window !== 'undefined') {
          const signedKey = `pbr-signed-${campaignId}`;
          setHasSigned(localStorage.getItem(signedKey) === '1');
        }
      }
      setError(null);
    } catch (err) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchSignatures();
    const id = setInterval(fetchSignatures, pollMs);
    return () => clearInterval(id);
  }, [fetchSignatures, pollMs]);

  const sign = useCallback(async (data: SignData): Promise<{ ok: boolean; error?: string; code?: string }> => {
    try {
      const res = await fetch('/api/sign-petition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          deviceFingerprint,
        }),
      });
      const result = await res.json();
      if (result.ok) {
        // Mark as signed in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`pbr-signed-${campaignId}`, '1');
        }
        setHasSigned(true);
        // Refresh signatures list immediately
        fetchSignatures();
        return { ok: true };
      }
      return { ok: false, error: result.error, code: result.code };
    } catch (err: any) {
      return { ok: false, error: 'Gagal mengirim tanda tangan. Coba lagi.' };
    }
  }, [deviceFingerprint, campaignId, fetchSignatures]);

  return {
    signatures,
    count,
    loading,
    hasSigned,
    error,
    refresh: fetchSignatures,
    sign,
  };
}

// ============================================================
// useGeolocation — get user location via browser API
// ============================================================
export function useGeolocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    label?: string;
    loading: boolean;
    error: string | null;
  }>({ latitude: 0, longitude: 0, loading: false, error: null });

  const getLocation = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocation((prev) => ({ ...prev, error: 'Geolocation tidak didukung browser ini' }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let label = '';
        // Reverse geocode using free OpenStreetMap Nominatim API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&accept-language=id`,
            { headers: { 'Accept': 'application/json' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const state = addr.state || '';
            label = [city, state].filter(Boolean).join(', ') || data.display_name || '';
          }
        } catch {
          // Silent fail — label optional
        }
        setLocation({ latitude, longitude, label, loading: false, error: null });
      },
      (err) => {
        let msg = 'Gagal mendapatkan lokasi';
        if (err.code === 1) msg = 'Akses lokasi ditolak. Anda tetap bisa isi manual.';
        else if (err.code === 2) msg = 'Lokasi tidak tersedia';
        else if (err.code === 3) msg = 'Timeout. Coba lagi.';
        setLocation((prev) => ({ ...prev, loading: false, error: msg }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { location, getLocation };
}
