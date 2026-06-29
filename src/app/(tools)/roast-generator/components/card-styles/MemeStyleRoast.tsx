'use client';

import type { RoastCardData } from '../../types';

interface RoastCardStyleProps {
  data: RoastCardData;
  width: number;
  height: number;
}

/**
 * Meme Style Roast Card — 搞笑风
 * Classic internet meme format with bold borders and bright colors
 */
export function MemeStyleRoast({ data, width, height }: RoastCardStyleProps) {
  const { text, tags, date, referralText } = data;
  const formattedDate = formatDate(date);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fff9c4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${height * 0.08}px ${width * 0.08}px`,
        fontFamily: "'Arial Black', 'Noto Sans SC', sans-serif",
        color: '#333333',
        position: 'relative',
        overflow: 'hidden',
        border: `${Math.max(6, width * 0.008)}px solid #000000`,
        boxSizing: 'border-box',
      }}
    >
      {/* Date in white bubble */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.04,
          left: width * 0.06,
          background: '#ffffff',
          padding: `${height * 0.008}px ${width * 0.02}px`,
          borderRadius: width * 0.02,
          fontSize: Math.max(10, width * 0.012),
          fontWeight: 700,
          border: `2px solid #000000`,
        }}
      >
        {formattedDate}
      </div>

      {/* Main text */}
      <div
        style={{
          fontSize: Math.max(20, width * 0.038),
          lineHeight: 1.4,
          textAlign: 'center',
          letterSpacing: '0.01em',
          maxWidth: '85%',
          fontWeight: 900,
          textTransform: 'uppercase' as const,
          WebkitTextStroke: '0.5px #000',
        }}
      >
        {text}
      </div>

      {/* Decorative underline */}
      <div
        style={{
          width: width * 0.15,
          height: Math.max(4, width * 0.006),
          background: '#ff6f00',
          marginTop: height * 0.03,
          borderRadius: 2,
        }}
      />

      {/* Tags as colored pills */}
      {tags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.07,
            display: 'flex',
            gap: width * 0.015,
          }}
        >
          {tags.map((tag, i) => (
            <span
              key={tag}
              style={{
                background: i % 2 === 0 ? '#ff6f00' : '#000000',
                color: '#ffffff',
                padding: `${height * 0.006}px ${width * 0.015}px`,
                borderRadius: width * 0.02,
                fontSize: Math.max(10, width * 0.013),
                fontWeight: 700,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Referral text - black bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: Math.max(9, width * 0.01),
          color: '#ffffff',
          background: '#000000',
          padding: `${height * 0.008}px 0`,
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
