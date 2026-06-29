'use client';

import type { CardData } from '../../types';

interface CardStyleProps {
  data: CardData;
  width: number;
  height: number;
}

/**
 * Minimal Premium Card — 极简高级
 * White/off-white background, large serif font, thin accent line, lots of whitespace
 */
export function MinimalCard({ data, width, height }: CardStyleProps) {
  const { text, keywords, tags } = data;

  // Highlight keywords in text
  const renderedText = highlightKeywords(text, keywords, '#643DFF');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${height * 0.12}px ${width * 0.1}px`,
        fontFamily: "'Noto Serif SC', 'Georgia', serif",
        color: '#1a1a1a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative thin line top */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.08,
          left: width * 0.15,
          right: width * 0.15,
          height: 1,
          background: '#e0e0e0',
        }}
      />

      {/* Main text */}
      <div
        style={{
          fontSize: Math.max(14, width * 0.026),
          lineHeight: 1.8,
          textAlign: 'center',
          letterSpacing: '0.02em',
          maxWidth: '85%',
        }}
        dangerouslySetInnerHTML={{ __html: renderedText }}
      />

      {/* Accent dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#643DFF',
          marginTop: height * 0.04,
        }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.06,
            display: 'flex',
            gap: width * 0.02,
            fontSize: Math.max(9, width * 0.01),
            color: '#999',
            letterSpacing: '0.05em',
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
      `<span style="color:${color};font-weight:600">${keyword}</span>`
    );
  }
  return result;
}
