'use client';

import type { RoastCardData } from '../../types';

interface RoastCardStyleProps {
  data: RoastCardData;
  width: number;
  height: number;
}

/**
 * Dark Gold Toxic Roast Card — 黑金毒舌风
 * Dark background with gold accents, luxurious toxic vibe
 */
export function DarkGoldToxicRoast({ data, width, height }: RoastCardStyleProps) {
  const { text, tags, date, referralText } = data;
  const formattedDate = formatDate(date);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${height * 0.12}px ${width * 0.1}px`,
        fontFamily: "'Noto Sans SC', 'Helvetica Neue', sans-serif",
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gold glow decoration */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.05,
          right: width * 0.05,
          width: width * 0.3,
          height: width * 0.3,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Gold accent line top */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.08,
          left: width * 0.15,
          right: width * 0.15,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
        }}
      />

      {/* Date stamp */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.1,
          right: width * 0.1,
          fontSize: Math.max(10, width * 0.012),
          color: '#d4af37',
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
          fontWeight: 600,
          textShadow: '0 0 40px rgba(212,175,55,0.2)',
        }}
      >
        {text}
      </div>

      {/* Gold accent line bottom */}
      <div
        style={{
          width: width * 0.08,
          height: 2,
          background: '#d4af37',
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
            color: '#d4af37',
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
          color: 'rgba(212,175,55,0.4)',
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
