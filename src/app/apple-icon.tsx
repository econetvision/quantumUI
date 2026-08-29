import { ImageResponse } from 'next/og';

/**
 * Home-screen icon for iOS. Drawn from plain divs — a border-ring "Q" on the
 * brand gradient — rather than text, because Satori renders no glyphs without
 * an embedded font and the mark must not depend on one.
 *
 * Mirrors src/app/icon.svg; change them together.
 */

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #4d8dff 0%, #a78bfa 100%)',
          position: 'relative',
        }}
      >
        {/* Q ring */}
        <div
          style={{
            position: 'absolute',
            left: 44,
            top: 41,
            width: 80,
            height: 80,
            borderRadius: 9999,
            border: '17px solid #06101f',
          }}
        />
        {/* Q tail */}
        <div
          style={{
            position: 'absolute',
            left: 104,
            top: 104,
            width: 44,
            height: 17,
            borderRadius: 9999,
            background: '#06101f',
            transform: 'rotate(45deg)',
          }}
        />
        {/* Orbiting electron dot */}
        <div
          style={{
            position: 'absolute',
            left: 122,
            top: 36,
            width: 22,
            height: 22,
            borderRadius: 9999,
            background: '#ffffff',
          }}
        />
      </div>
    ),
    size,
  );
}
