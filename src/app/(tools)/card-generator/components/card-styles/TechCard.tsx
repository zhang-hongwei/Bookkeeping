'use client';

import type { CardData } from '../../types';

interface CardStyleProps {
  data: CardData;
  width: number;
  height: number;
}

/**
 * Tech Future Card — 科技未来
 * Dark background, neon glow lines, grid overlay, monospace elements
 */
export function TechCard({ data, width, height }: CardStyleProps) {
  const { text, keywords, tags } = data;

  const renderedText = highlightKeywords(text, keywords, '#00ff88');

  const gridSize = 40;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a14',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${height * 0.1}px ${width * 0.08}px`,
        fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
        color: '#e0e0e0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid overlay */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.06,
        }}
      >
        <defs>
          <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#00ff88" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Horizontal neon lines */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.15,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: height * 0.15,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
          opacity: 0.4,
        }}
      />

      {/* Main text */}
      <div
        style={{
          fontSize: Math.max(14, width * 0.023),
          lineHeight: 1.8,
          textAlign: 'center',
          letterSpacing: '0.02em',
          maxWidth: '80%',
          position: 'relative',
          zIndex: 1,
        }}
        dangerouslySetInnerHTML={{ __html: renderedText }}
      />

      {/* Corner accents */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.08,
          left: width * 0.06,
          width: 20,
          height: 20,
          borderTop: '2px solid #00ff88',
          borderLeft: '2px solid #00ff88',
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: height * 0.08,
          right: width * 0.06,
          width: 20,
          height: 20,
          borderBottom: '2px solid #00ff88',
          borderRight: '2px solid #00ff88',
          opacity: 0.5,
        }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.04,
            display: 'flex',
            gap: width * 0.02,
            fontSize: Math.max(9, width * 0.009),
            color: '#00ff88',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
            opacity: 0.6,
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
      `<span style="color:${color};text-shadow:0 0 8px ${color}40">${keyword}</span>`
    );
  }
  return result;
}
