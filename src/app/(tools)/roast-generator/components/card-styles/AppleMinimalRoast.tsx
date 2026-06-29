'use client';

import type { RoastCardData } from '../../types';

interface RoastCardStyleProps {
  data: RoastCardData;
  width: number;
  height: number;
}

/**
 * Apple Minimal Roast Card — 极简风
 * Clean Apple-style design with lots of whitespace, thin lines
 */
export function AppleMinimalRoast({ data, width, height }: RoastCardStyleProps) {
  const { text, tags, date, referralText } = data;
  const formattedDate = formatDate(date);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#f5f5f7',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${height * 0.12}px ${width * 0.1}px`,
        fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#1d1d1f',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Thin accent line top */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.08,
          left: width * 0.15,
          right: width * 0.15,
          height: 1,
          background: '#d2d2d7',
        }}
      />

      {/* Date stamp */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.1,
          right: width * 0.1,
          fontSize: Math.max(10, width * 0.012),
          color: '#86868b',
          letterSpacing: '0.05em',
        }}
      >
        {formattedDate}
      </div>

      {/* Main text */}
      <div
        style={{
          fontSize: Math.max(18, width * 0.032),
          lineHeight: 1.6,
          textAlign: 'center',
          letterSpacing: '0.02em',
          maxWidth: '80%',
          fontWeight: 400,
        }}
      >
        {text}
      </div>

      {/* Accent dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#1d1d1f',
          marginTop: height * 0.04,
        }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.08,
            display: 'flex',
            gap: width * 0.02,
            fontSize: Math.max(10, width * 0.013),
            color: '#86868b',
            letterSpacing: '0.03em',
          }}
        >
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      {/* Referral text */}
      <div
        style={{
          position: 'absolute',
          bottom: height * 0.02,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: Math.max(9, width * 0.01),
          color: '#aeaeb2',
        }}
      >
        {referralText}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
