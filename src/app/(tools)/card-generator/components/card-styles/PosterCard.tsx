'use client';

import type { CardData } from '../../types';

interface CardStyleProps {
  data: CardData;
  width: number;
  height: number;
}

/**
 * Poster Style Card — 海报风
 * Bold oversized text, strong contrast, solid color background
 */
export function PosterCard({ data, width, height }: CardStyleProps) {
  const { text, keywords, tags } = data;

  const renderedText = highlightKeywords(text, keywords, '#ffd32a');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#ff4757',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${height * 0.08}px ${width * 0.06}px`,
        fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Bold diagonal stripe decoration */}
      <div
        style={{
          position: 'absolute',
          top: -height * 0.05,
          right: -width * 0.3,
          width: width * 0.7,
          height: height * 0.15,
          background: 'rgba(0,0,0,0.1)',
          transform: 'rotate(-3deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -height * 0.05,
          left: -width * 0.3,
          width: width * 0.7,
          height: height * 0.15,
          background: 'rgba(0,0,0,0.1)',
          transform: 'rotate(-3deg)',
        }}
      />

      {/* Main text — bold and oversized */}
      <div
        style={{
          fontSize: Math.max(18, width * 0.034),
          lineHeight: 1.5,
          textAlign: 'center',
          letterSpacing: '0.04em',
          maxWidth: '90%',
          fontWeight: 900,
          textTransform: 'uppercase' as const,
          position: 'relative',
          zIndex: 1,
          textShadow: '2px 2px 0 rgba(0,0,0,0.15)',
        }}
        dangerouslySetInnerHTML={{ __html: renderedText }}
      />

      {/* Bold underline */}
      <div
        style={{
          marginTop: height * 0.03,
          width: width * 0.12,
          height: 4,
          background: '#ffd32a',
          borderRadius: 2,
        }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.05,
            display: 'flex',
            gap: width * 0.025,
            fontSize: Math.max(10, width * 0.011),
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}
        >
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function highlightKeywords(text: string, keywords: string[], color: string): string {
  if (!keywords.length) return text;
  let result = text;
  for (const keyword of keywords) {
    result = result.replace(
      keyword,
      `<span style="color:${color};font-weight:900">${keyword}</span>`
    );
  }
  return result;
}
