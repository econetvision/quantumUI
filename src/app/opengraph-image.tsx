import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

/**
 * The card that appears when the site is shared on Slack, X, LinkedIn or in a
 * messaging app.
 *
 * Generated rather than a checked-in PNG so it stays in step with the site's
 * own palette, and so the copy is edited here rather than in an image editor.
 * Statically rendered at build time — it reads no request data — so serving it
 * costs nothing at runtime.
 *
 * The colours are the dark-theme tokens from globals.css written out literally:
 * `ImageResponse` renders in Satori, which has no CSS custom properties and no
 * stylesheet to read them from.
 */

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#07090d',
          // Satori supports linear-gradient on backgroundImage; this is the
          // same accent wash the hero uses, kept subtle so the text stays the
          // brightest thing in the frame.
          backgroundImage:
            'radial-gradient(circle at 78% 18%, rgba(77,141,255,0.28), transparent 55%), radial-gradient(circle at 12% 88%, rgba(167,139,250,0.20), transparent 55%)',
          color: '#f2f5f9',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 68,
              height: 68,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #4d8dff, #a78bfa)',
              color: '#06101f',
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            Q
          </div>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 700 }}>
            <span>Quantum</span>
            <span style={{ color: '#4d8dff' }}>UI</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 900,
            }}
          >
            Learn quantum computing by running it
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: '#a4aebd',
              maxWidth: 880,
              lineHeight: 1.35,
            }}
          >
            12 guided tracks, hands-on labs, and a playground that executes real
            circuits — free, no registration required.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 28,
            fontSize: 26,
            color: '#6d7787',
          }}
        >
          <span>Bloch spheres · statevectors · IBM certification prep</span>
          <span style={{ color: '#4d8dff', fontSize: 44 }}>|ψ⟩</span>
        </div>
      </div>
    ),
    size,
  );
}
