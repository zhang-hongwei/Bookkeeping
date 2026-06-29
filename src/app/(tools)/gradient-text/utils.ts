/**
 * Gradient Text Utilities
 * CSS generation for gradient text effects
 */

import type { ColorStop, GradientTextConfig, GradientType } from './types';

/**
 * Convert hex color + opacity to rgba string
 */
export function hexToRGBA(hex: string, opacity: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const a = Math.round((opacity / 100) * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Format a color stop value (hex + opacity -> CSS color string)
 */
export function formatStopColor(stop: ColorStop): string {
  if (stop.opacity >= 100) return stop.color;
  return hexToRGBA(stop.color, stop.opacity);
}

/**
 * Build CSS gradient string from color stops
 */
export function buildGradientCSS(colorStops: ColorStop[], type: GradientType, angle: number): string {
  const sorted = [...colorStops].sort((a, b) => a.position - b.position);
  const stops = sorted
    .map((s, i, arr) => {
      const color = formatStopColor(s);
      const isFirst = i === 0 && s.position === 0;
      const isLast = i === arr.length - 1 && s.position === 100;
      if (isFirst || isLast) return color;
      return `${color} ${s.position}%`;
    })
    .join(', ');

  switch (type) {
    case 'radial-circle':
      return `radial-gradient(circle, ${stops})`;
    case 'radial-ellipse':
      return `radial-gradient(ellipse, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${stops})`;
    case 'linear':
    default:
      return `linear-gradient(${angle}deg, ${stops})`;
  }
}

/**
 * Build the inline style object for the preview text
 */
export function buildTextStyle(config: GradientTextConfig): React.CSSProperties {
  const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
  return {
    background: gradient,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: `${config.fontSize}px`,
    fontWeight: config.fontWeight,
    fontFamily: config.fontFamily,
    letterSpacing: `${config.letterSpacing}px`,
    lineHeight: config.lineHeight,
    textAlign: config.textAlign,
    display: 'inline-block',
    width: '100%',
    wordBreak: 'break-word' as const,
  };
}

/**
 * Generate plain CSS code
 */
export function generateCSS(config: GradientTextConfig): string {
  const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
  return [
    `.gradient-text {`,
    `  background: ${gradient};`,
    `  -webkit-background-clip: text;`,
    `  background-clip: text;`,
    `  -webkit-text-fill-color: transparent;`,
    `}`,
  ].join('\n');
}

/**
 * Generate CSS with font properties included
 */
export function generateFullCSS(config: GradientTextConfig): string {
  const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
  return [
    `.gradient-text {`,
    `  background: ${gradient};`,
    `  -webkit-background-clip: text;`,
    `  background-clip: text;`,
    `  -webkit-text-fill-color: transparent;`,
    `  font-size: ${config.fontSize}px;`,
    `  font-weight: ${config.fontWeight};`,
    `  font-family: ${config.fontFamily};`,
    `  letter-spacing: ${config.letterSpacing}px;`,
    `  line-height: ${config.lineHeight};`,
    `  text-align: ${config.textAlign};`,
    `}`,
  ].join('\n');
}

/**
 * Generate MUI sx prop code
 */
export function generateMUISx(config: GradientTextConfig): string {
  const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
  return [
    `sx={{`,
    `  background: '${gradient}',`,
    `  WebkitBackgroundClip: 'text',`,
    `  backgroundClip: 'text',`,
    `  WebkitTextFillColor: 'transparent',`,
    `  fontSize: ${config.fontSize},`,
    `  fontWeight: ${config.fontWeight},`,
    `}}`,
  ].join('\n');
}

/**
 * Generate React inline style object
 */
export function generateReactStyle(config: GradientTextConfig): string {
  const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
  return [
    `style={{`,
    `  background: '${gradient}',`,
    `  WebkitBackgroundClip: 'text',`,
    `  backgroundClip: 'text',`,
    `  WebkitTextFillColor: 'transparent',`,
    `  fontSize: ${config.fontSize},`,
    `  fontWeight: ${config.fontWeight},`,
    `}}`,
  ].join('\n');
}

/**
 * Generate Tailwind CSS code
 */
export function generateTailwind(config: GradientTextConfig): string {
  return [
    `/* Apply these Tailwind classes to a <span> or <div>: */`,
    `/* Then add the gradient background via custom CSS or inline style */`,
    ``,
    `<span class="bg-clip-text text-transparent" style={{`,
    `  backgroundImage: '${buildGradientCSS(config.colorStops, config.gradientType, config.angle)}',`,
    `  fontSize: '${config.fontSize}px',`,
    `  fontWeight: ${config.fontWeight},`,
    `}}>`,
    `  ${config.text}`,
    `</span>`,
  ].join('\n');
}

/**
 * Generate unique ID for color stops
 */
export function createColorStop(color: string = '#6366f1', position: number = 50, opacity: number = 100): ColorStop {
  return {
    id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    color,
    opacity,
    position,
  };
}
