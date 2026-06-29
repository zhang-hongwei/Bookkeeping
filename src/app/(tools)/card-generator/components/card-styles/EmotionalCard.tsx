'use client';

import type { CardData } from '../../types';

interface CardStyleProps {
  data: CardData;
  width: number;
  height: number;
}

/**
 * Emotional Atmosphere Card — 情绪氛围
 * Soft gradient, warm tones, dreamy glow effect
 */
export function EmotionalCard({ data, width, height }: CardStyleProps) {
  const { text, keywords, tags } = data;

  const renderedText = highlightKeywords(text, keywords, '#ffd700');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${height * 0.12}px ${width * 0.08}px`,
        fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blurred circle decorations */}
      <div
        style={{
          position: 'absolute',
          top: -height * 0.15,
          right: -width * 0.1,
          width: width * 0.5,
          height: width * 0.5,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -height * 0.1,
          left: -width * 0.1,
          width: width * 0.4,
          height: width * 0.4,
          borderRadius: '50%',
          background: 'rgba(255,215,0,0.06)',
          filter: 'blur(30px)',
        }}
      />

      {/* Text with subtle shadow */}
      <div
        style={{
          fontSize: Math.max(14, width * 0.024),
          lineHeight: 1.9,
          textAlign: 'center',
          letterSpacing: '0.03em',
          maxWidth: '85%',
          textShadow: '0 2px 12px rgba(0,0,0,0.15)',
          position: 'relative',
          zIndex: 1,
        }}
        dangerouslySetInnerHTML={{ __html: renderedText }}
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
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.05em',
            zIndex: 1,
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
