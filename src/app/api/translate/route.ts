// API Route: /api/translate
// ============================================================
// Auto-translate text using Google Translate free endpoint.
// No API key required — uses the public gtx client endpoint.
//
// POST /api/translate
// Body: { text: string, target: 'id'|'en'|'zh', source?: 'id' }
// Response: { ok: true, translated: string, detected?: string }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TARGETS = ['id', 'en', 'zh', 'zh-CN'];

// In-memory cache (per server instance, clears on cold start)
// Format: `${target}:${hash(text)}` → translated text
const cache = new Map<string, string>();
const MAX_CACHE = 500;

function cacheKey(target: string, text: string): string {
  return `${target}:${text.substring(0, 100)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, target, source } = body as any;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ ok: false, error: 'text required' }, { status: 400 });
    }
    if (!target || !VALID_TARGETS.includes(target)) {
      return NextResponse.json({ ok: false, error: 'invalid target' }, { status: 400 });
    }

    // Don't translate if target is same as source
    if (source === target) {
      return NextResponse.json({ ok: true, translated: text, detected: source });
    }

    // Check cache
    const key = cacheKey(target, text);
    if (cache.has(key)) {
      return NextResponse.json({ ok: true, translated: cache.get(key), cached: true });
    }

    // Google Translate free endpoint (gtx client, no API key)
    // Source: 'id' (Indonesian), Target: target locale
    // Use 'zh-CN' for Mandarin
    const tl = target === 'zh' ? 'zh-CN' : target;
    const sl = source || 'id';

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('[api/translate] Google API error:', res.status);
      return NextResponse.json({ ok: false, error: 'Translation service unavailable' }, { status: 502 });
    }

    const data = await res.json() as any[];

    // Response format: [[["translated","original",...],...], ..., ["detected_source_lang"]]
    // Concatenate all translated segments
    let translated = '';
    if (Array.isArray(data) && Array.isArray(data[0])) {
      for (const segment of data[0]) {
        if (segment && segment[0]) {
          translated += segment[0];
        }
      }
    }

    const detected = data[2] || sl;

    // Cache the result
    if (cache.size >= MAX_CACHE) {
      // Clear oldest entries (simple FIFO)
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(key, translated);

    return NextResponse.json({ ok: true, translated, detected });
  } catch (err: any) {
    console.error('[api/translate] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
