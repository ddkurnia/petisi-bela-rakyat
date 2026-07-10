// ============================================================
// Default Open Graph Image — 1200x630 (standar WhatsApp/FB)
// ============================================================
// Generate secara dynamic pakai @vercel/og ImageResponse.
// URL: /opengraph-image (atau /opengraph-image.png)
//
// Tampil di preview saat share homepage ke WhatsApp/Facebook/Twitter.
// ============================================================
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Petisi Bela Rakyat — Menyatukan Suara Rakyat Menjadi Perubahan';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #D62828 0%, #8B0000 50%, #111827 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        {/* Logo / Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '30px',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            marginBottom: '40px',
            fontSize: '60px',
            fontWeight: 800,
            color: 'white',
          }}
        >
          PBR
        </div>

        {/* Main headline */}
        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            padding: '0 80px',
            letterSpacing: '-0.02em',
          }}
        >
          Petisi Bela Rakyat
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            color: 'rgba(255,255,255,0.85)',
            marginTop: '20px',
            textAlign: 'center',
            padding: '0 80px',
            fontWeight: 400,
          }}
        >
          Menyatukan Suara Rakyat Menjadi Perubahan
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            borderRadius: '100px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#D62828',
            }}
          />
          <span style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>
            belarakyat.org
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
