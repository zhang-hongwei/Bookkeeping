'use client';

import type { RoastCardData } from '../../types';

interface RoastCardStyleProps {
  data: RoastCardData;
  width: number;
  height: number;
}

/**
 * Handwritten Roast Card — 手写风
 * Notebook-style with handwritten font and paper texture
 */
export function HandwrittenRoast({ data, width, height }: RoastCardStyleProps) {
  const { text, tags, date, referralText } = data;
  const formattedDate = formatDate(date);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fdf6e3',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${height * 0.12}px ${width * 0.1}px`,
        fontFamily: "'Ma Shan Zheng', 'ZCOOL KuaiLe', cursive",
        color: '#5c4b37',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Paper line decorations */}
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((ratio, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: height * ratio,
            left: width * 0.08,
            right: width * 0.08,
            height: 1,
            background: 'rgba(139,115,85,0.1)',
          }}
        />
      ))}

      {/* Red margin line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: width * 0.12,
          width: 1,
          background: 'rgba(220,80,80,0.15)',
        }}
      />

      {/* Date stamp - handwritten style */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.06,
          right: width * 0.08,
          fontSize: Math.max(12, width * 0.015),
          color: '#8b7355',
          transform: 'rotate(-2deg)',
        }}
      >
        {formattedDate}
      </div>

      {/* Main text */}
      <div
        style={{
          fontSize: Math.max(20, width * 0.036),
          lineHeight: 1.6,
          textAlign: 'center',
          letterSpacing: '0.02em',
          maxWidth: '80%',
          transform: 'rotate(-0.5deg)',
        }}
      >
        {text}
      </div>

      {/* Tags - handwritten style */}
      {tags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.08,
            display: 'flex',
            gap: width * 0.025,
            fontSize: Math.max(11, width * 0.015),
            color: '#8b7355',
            transform: 'rotate(1deg)',
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
          color: 'rgba(92,75,55,0.3)',
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
