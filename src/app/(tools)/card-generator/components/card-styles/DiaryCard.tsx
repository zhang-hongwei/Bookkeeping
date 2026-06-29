'use client';

import type { CardData } from '../../types';

interface CardStyleProps {
  data: CardData;
  width: number;
  height: number;
}

/**
 * Diary Handwritten Card — 日记手写
 * Warm cream background, handwriting feel, timestamp, personal vibe
 */
export function DiaryCard({ data, width, height }: CardStyleProps) {
  const { text, keywords, tags } = data;

  const renderedText = highlightKeywords(text, keywords, '#d4813b');

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

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
        padding: `${height * 0.1}px ${width * 0.1}px`,
        fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
        color: '#5c4b37',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Paper texture lines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.08,
        }}
      >
        {Array.from({ length: Math.ceil(height / 30) }, (_, i) => (
          <line
            key={i}
            x1={width * 0.08}
            y1={height * 0.18 + i * 30}
            x2={width * 0.92}
            y2={height * 0.18 + i * 30}
            stroke="#5c4b37"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Date stamp */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.08,
          right: width * 0.08,
          fontSize: Math.max(9, width * 0.01),
          color: '#b8a08a',
          letterSpacing: '0.05em',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {dateStr}
      </div>

      {/* Main text with slight rotation for hand-written feel */}
      <div
        style={{
          fontSize: Math.max(14, width * 0.023),
          lineHeight: 2,
          textAlign: 'center',
          letterSpacing: '0.04em',
          maxWidth: '80%',
          position: 'relative',
          zIndex: 1,
          transform: 'rotate(-0.5deg)',
        }}
        dangerouslySetInnerHTML={{ __html: renderedText }}
      />

      {/* Small hand-drawn underline */}
      <svg
        style={{
          marginTop: height * 0.02,
          width: width * 0.15,
          height: 8,
          opacity: 0.3,
        }}
        viewBox="0 0 100 8"
      >
        <path
          d="M 0 5 Q 25 2 50 5 Q 75 8 100 5"
          fill="none"
          stroke="#d4813b"
          strokeWidth="1.5"
        />
      </svg>

      {/* Tags */}
      {tags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.05,
            display: 'flex',
            gap: width * 0.02,
            fontSize: Math.max(9, width * 0.01),
            color: '#b8a08a',
            letterSpacing: '0.03em',
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
