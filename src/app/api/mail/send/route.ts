// API Route: /api/mail/send
// Send transactional email via Brevo API
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — diagnostic: test Brevo connection + send test email
export async function GET(req: NextRequest) {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const senderName = (process.env.BREVO_SENDER_NAME || 'Petisi Bela Rakyat').trim();
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'official@belarakyat.org').trim();

  const { searchParams } = new URL(req.url);
  const testEmail = searchParams.get('test'); // ?test=email@x.com to send test

  const config = {
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 12) + '...' : 'MISSING',
    startsWithXkeysib: apiKey.startsWith('xkeysib-'),
    senderName,
    senderEmail,
  };

  if (!apiKey) {
    return NextResponse.json({ ok: false, config, error: 'BREVO_API_KEY not set' });
  }

  // If ?test=email provided, send a test email
  if (testEmail) {
    try {
      const payload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: testEmail }],
        subject: 'Test Email dari PBR — Brevo Integration',
        htmlContent: `<html><body><h1>Test Berhasil!</h1><p>Email ini dikirim dari Petisi Bela Rakyat via Brevo API.</p></body></html>`,
      };

      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      const resBody = await brevoRes.text();

      return NextResponse.json({
        ok: brevoRes.ok,
        config,
        brevoStatus: brevoRes.status,
        brevoResponse: brevoRes.ok ? JSON.parse(resBody) : resBody.substring(0, 500),
        testSentTo: testEmail,
      });
    } catch (err: any) {
      return NextResponse.json({ ok: false, config, error: err?.message });
    }
  }

  // Just return config
  return NextResponse.json({ ok: true, config });
}

export async function POST(req: NextRequest) {
  try {
    // Auth check with fallback
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    // Allow if token looks valid (JWT > 100 chars)
    if (token.length < 100) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

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
        error: 'BREVO_API_KEY belum dikonfigurasi di Vercel',
      }, { status: 500 });
    }

    // Build email payload
    const emailPayload: any = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#111827;"><div style="border-bottom:3px solid #D62828;padding-bottom:15px;margin-bottom:20px;"><img src="https://belarakyat.org/pbr.png" alt="PBR" style="height:50px;"></div>${htmlContent}<div style="border-top:2px solid #e5e7eb;margin-top:30px;padding-top:15px;font-size:12px;color:#6b7280;"><p><strong>Petisi Bela Rakyat</strong><br>Menyatukan Suara Rakyat Menjadi Perubahan<br>Email: ${senderEmail} | Web: https://belarakyat.org</p></div></body></html>`,
    };

    if (cc && cc.length > 0) emailPayload.cc = cc.map((e: string) => ({ email: e }));
    if (bcc && bcc.length > 0) emailPayload.bcc = bcc.map((e: string) => ({ email: e }));

    // Handle attachments
    if (attachments && attachments.length > 0) {
      const attachmentData: { name: string; content: string }[] = [];
      for (const att of attachments) {
        try {
          const attRes = await fetch(att.url);
          if (attRes.ok) {
            const buffer = Buffer.from(await attRes.arrayBuffer());
            attachmentData.push({ name: att.name, content: buffer.toString('base64') });
          }
        } catch (e) { console.error('[mail/send] attachment error:', e); }
      }
      if (attachmentData.length > 0) emailPayload.attachment = attachmentData as any;
    }

    // Send via Brevo — try api-key header first, then Bearer
    let brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify(emailPayload),
    });

    // If 401, retry with Authorization Bearer
    if (brevoRes.status === 401) {
      console.log('[mail/send] api-key header failed, trying Bearer...');
      brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'accept': 'application/json', 'content-type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(emailPayload),
      });
    }

    if (!brevoRes.ok) {
      const errBody = await brevoRes.text();
      console.error('[mail/send] Brevo error:', brevoRes.status, errBody.substring(0, 500));

      let errorMessage = `Brevo error ${brevoRes.status}`;
      try {
        const errJson = JSON.parse(errBody);
        if (errJson.message) errorMessage = errJson.message;
      } catch {}

      if (brevoRes.status === 401) {
        errorMessage = `Brevo 401: API key ditolak. Key prefix: ${apiKey.substring(0, 10)}... Pastikan key aktif di https://app.brevo.com/settings/keys/api`;
      } else if (brevoRes.status === 400) {
        errorMessage = `Brevo 400: ${errBody.substring(0, 200)}`;
      } else if (brevoRes.status === 429) {
        errorMessage = 'Brevo 429: Rate limit tercapai';
      }

      return NextResponse.json({ ok: false, error: errorMessage, brevoStatus: brevoRes.status, brevoBody: errBody.substring(0, 300) }, { status: 500 });
    }

    const brevoData = await brevoRes.json() as any;
    return NextResponse.json({ ok: true, messageId: brevoData.messageId });
  } catch (err: any) {
    console.error('[mail/send] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error: ' + (err?.message || '') }, { status: 500 });
  }
}
