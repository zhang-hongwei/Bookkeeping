'use client';

import type { CardData } from '../../types';

interface CardStyleProps {
  data: CardData;
  width: number;
  height: number;
}

/**
 * Business Quote Card — 商业金句
 * Clean white, bold serif heading, horizontal rule, CEO quote style
 */
export function BusinessCard({ data, width, height }: CardStyleProps) {
  const { text, keywords, tags } = data;

  const renderedText = highlightKeywords(text, keywords, '#c9a84c');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${height * 0.1}px ${width * 0.1}px`,
        fontFamily: "'Noto Serif SC', 'Georgia', serif",
        color: '#1a1a1a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gold accent line top */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: width * 0.06,
          height: 2,
          background: '#c9a84c',
        }}
      />

      {/* Opening quote mark */}
      <div
        style={{
          fontSize: Math.max(40, width * 0.06),
          color: '#c9a84c',
          lineHeight: 1,
          marginBottom: height * 0.02,
          opacity: 0.4,
          fontFamily: 'Georgia, serif',
        }}
      >
        &ldquo;
      </div>

      {/* Main text */}
      <div
        style={{
          fontSize: Math.max(14, width * 0.024),
          lineHeight: 1.9,
          textAlign: 'center',
          letterSpacing: '0.02em',
          maxWidth: '80%',
          fontWeight: 500,
        }}
        dangerouslySetInnerHTML={{ __html: renderedText }}
      />

      {/* Closing quote mark */}
      <div
        style={{
          fontSize: Math.max(40, width * 0.06),
          color: '#c9a84c',
          lineHeight: 1,
          marginTop: height * 0.02,
          opacity: 0.4,
          fontFamily: 'Georgia, serif',
        }}
      >
        &rdquo;
      </div>

      {/* Bottom gold line */}
      <div
        style={{
          position: 'absolute',
          bottom: height * 0.12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: width * 0.06,
          height: 2,
          background: '#c9a84c',
        }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.05,
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
