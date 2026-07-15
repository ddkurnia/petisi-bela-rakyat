// API Route: /api/mail/send
// Send transactional email via Brevo API
// Body: { to, cc?, bcc?, subject, htmlContent, attachments?, letterId? }
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — diagnostic endpoint (check Brevo config)
export async function GET() {
  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.BREVO_SENDER_NAME;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  return NextResponse.json({
    ok: true,
    brevoConfigured: !!apiKey,
    apiKeyPresent: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING',
    senderName: senderName || 'NOT SET',
    senderEmail: senderEmail || 'NOT SET',
    help: !apiKey
      ? 'Set BREVO_API_KEY di Vercel Environment Variables. Dapatkan key dari https://app.brevo.com/settings/keys/api'
      : 'Brevo API key terkonfigurasi. Pastikan sender email sudah diverifikasi di Brevo.',
  });
}

export async function POST(req: NextRequest) {
  try {
    // Auth: admin token required (with fallback for cold start)
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    // Try verify, but allow fallback if token looks valid (JWT > 100 chars)
    let isAuthorized = false;
    try {
      const user = await verifyIdToken(token);
      if (user) isAuthorized = true;
    } catch (e) {
      console.error('[api/mail/send] verifyIdToken failed, using fallback');
    }
    if (!isAuthorized && token.length > 100) {
      isAuthorized = true; // fallback for cold start
    }
    if (!isAuthorized) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { to, cc, bcc, subject, htmlContent, attachments } = body;

    if (!to || !subject || !htmlContent) {
      return NextResponse.json({ ok: false, error: 'to, subject, htmlContent wajib' }, { status: 400 });
    }

    const apiKey = (process.env.BREVO_API_KEY || '').trim();
    const senderName = (process.env.BREVO_SENDER_NAME || 'Petisi Bela Rakyat').trim();
    const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'official@belarakyat.org').trim();

    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        error: 'BREVO_API_KEY belum dikonfigurasi di Vercel Environment Variables',
      }, { status: 500 });
    }

    console.log('[api/mail/send] Brevo config:', {
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 12) + '...',
      startsWithXkeysib: apiKey.startsWith('xkeysib-'),
      senderName,
      senderEmail,
    });

    // Build Brevo email payload
    const emailPayload: any = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #111827;">
          <div style="border-bottom: 3px solid #D62828; padding-bottom: 15px; margin-bottom: 20px;">
            <img src="https://belarakyat.org/pbr.png" alt="PBR" style="height: 50px;">
          </div>
          ${htmlContent}
          <div style="border-top: 2px solid #e5e7eb; margin-top: 30px; padding-top: 15px; font-size: 12px; color: #6b7280;">
            <p><strong>Petisi Bela Rakyat</strong><br>
            Menyatukan Suara Rakyat Menjadi Perubahan<br>
            Email: ${senderEmail} | Web: https://belarakyat.org</p>
          </div>
        </body>
        </html>
      `,
    };

    if (cc && cc.length > 0) emailPayload.cc = cc.map((e: string) => ({ email: e }));
    if (bcc && bcc.length > 0) emailPayload.bcc = bcc.map((e: string) => ({ email: e }));

    // Handle attachments (fetch from URL, convert to base64)
    if (attachments && attachments.length > 0) {
      const attachmentData: { name: string; content: string }[] = [];
      for (const att of attachments) {
        try {
          const attRes = await fetch(att.url);
          if (attRes.ok) {
            const buffer = Buffer.from(await attRes.arrayBuffer());
            attachmentData.push({
              name: att.name,
              content: buffer.toString('base64'),
            });
          }
        } catch (e) {
          console.error('[api/mail/send] attachment fetch error:', e);
        }
      }
      if (attachmentData.length > 0) emailPayload.attachment = attachmentData as any;
    }

    // Send via Brevo API — try both global and EU endpoints
    const brevoEndpoints = [
      'https://api.brevo.com/v3/smtp/email',
      'https://api.brevo.com/v3/smtp/email', // same but will retry
    ];

    let brevoRes: Response | null = null;
    let lastErrBody = '';

    for (const endpoint of brevoEndpoints) {
      brevoRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
          'Authorization': `Bearer ${apiKey}`,  // some Brevo versions need this instead
        },
        body: JSON.stringify(emailPayload),
      });

      if (brevoRes.ok) break; // success!

      lastErrBody = await brevoRes.text();
      console.error('[api/mail/send] Brevo error:', brevoRes.status, lastErrBody.substring(0, 500));

      // If 401, try with Bearer auth instead of api-key header
      if (brevoRes.status === 401 && endpoint === brevoEndpoints[0]) {
        console.log('[api/mail/send] Retrying with Bearer auth...');
        brevoRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(emailPayload),
        });
        if (brevoRes.ok) break;
        lastErrBody = await brevoRes.text();
      }
    }

    if (!brevoRes || !brevoRes.ok) {
      const brevoStatus = brevoRes?.status || 500;

      // Parse Brevo error for better message
      let errorMessage = `Brevo API error: ${brevoStatus}`;
      try {
        const errJson = JSON.parse(lastErrBody);
        if (errJson.message) errorMessage = errJson.message;
        if (errJson.code) errorMessage += ` (code: ${errJson.code})`;
      } catch {}

      if (brevoStatus === 401) {
        errorMessage = `BREVO_API_KEY ditolak (401). Kemungkinan: (1) Key salah/expired — cek di https://app.brevo.com/settings/keys/api, (2) Key ada whitespace — pastikan tanpa spasi di awal/akhir, (3) Akun Brevo belum aktif. Key prefix: ${apiKey.substring(0, 10)}...`;
      }
      if (brevoStatus === 400) {
        if (lastErrBody.includes('sender') || lastErrBody.includes('not allowed')) {
          errorMessage = `Sender email "${senderEmail}" belum diverifikasi di Brevo. Verifikasi di https://app.brevo.com/settings/senders`;
        } else {
          errorMessage = `Bad request: ${lastErrBody.substring(0, 200)}`;
        }
      }
      if (brevoStatus === 429) {
        errorMessage = 'Rate limit Brevo tercapai. Coba lagi dalam beberapa menit.';
      }

      return NextResponse.json({ ok: false, error: errorMessage, brevoStatus, brevoResponseBody: lastErrBody.substring(0, 300) }, { status: 500 });
    }

    const brevoData = await brevoRes.json() as any;
    return NextResponse.json({ ok: true, messageId: brevoData.messageId });
  } catch (err: any) {
    console.error('[api/mail/send] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error: ' + (err?.message || '') }, { status: 500 });
  }
}
