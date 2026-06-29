/**
 * Gradient Border Utilities
 * Helper functions for generating CSS code
 */

import type { BorderImageOptions, ColorStop, GradientBorderConfig, GradientType } from './types';

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
 * Format a color stop value (hex + opacity → CSS color string)
 */
export function formatStopColor(stop: ColorStop): string {
  if (stop.opacity >= 100) return stop.color;
  return hexToRGBA(stop.color, stop.opacity);
}

/**
 * Build the inner background CSS value (first gradient layer) from stops
 */
export function buildInnerBgCSS(config: GradientBorderConfig): string {
  const stops = config.innerBgStops;
  if (!stops || stops.length === 0) return 'linear-gradient(#ffffff, #ffffff)';

  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopsCSS = sorted
    .map((s) => {
      const color = formatStopColor(s);
      if (s.positionEnd !== undefined) return `${color} ${s.position}% ${s.positionEnd}%`;
      return s.position === 0 || s.position === 100 ? color : `${color} ${s.position}%`;
    })
    .join(', ');

  return `linear-gradient(${config.innerBgAngle ?? 180}deg, ${stopsCSS})`;
}

/**
 * Generate CSS gradient string from color stops
 */
export function buildGradientCSS(colorStops: ColorStop[], type: GradientType, angle: number): string {
  const sorted = [...colorStops].sort((a, b) => a.position - b.position);
  const stops = sorted
    .map((s, i, arr) => {
      const color = formatStopColor(s);
      // Omit position for first (0%) and last (100%) stop to match design specs
      const isFirst = i === 0 && s.position === 0;
      const isLast = i === arr.length - 1 && s.position === 100 && s.positionEnd === undefined;
      if (isFirst || isLast) return color;
      // Dual position: color pos% posEnd%
      if (s.positionEnd !== undefined) return `${color} ${s.position}% ${s.positionEnd}%`;
      return `${color} ${s.position}%`;
    })
    .join(', ');

  switch (type) {
    case 'radial':
      return `radial-gradient(circle, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${stops})`;
    case 'linear':
    default:
      return `linear-gradient(${angle}deg, ${stops})`;
  }
}

/**
 * Build border-image source value (gradient or image URL)
 */
export function buildBorderImageSource(config: GradientBorderConfig): string {
  const opts = config.borderImageOptions;
  if (opts.sourceMode === 'image' && opts.imageUrl) {
    return `url("${opts.imageUrl}")`;
  }
  return buildGradientCSS(config.colorStops, config.gradientType, config.angle);
}

/**
 * Build border-image slice value (includes optional 'fill' keyword)
 */
function buildSliceValue(opts: GradientBorderConfig['borderImageOptions']): string {
  return opts.sliceFill ? `${opts.slice} fill` : opts.slice;
}

/**
 * Build border-image shorthand value
 */
function buildBorderImageShorthand(config: GradientBorderConfig): string {
  const source = buildBorderImageSource(config);
  const opts = config.borderImageOptions;
  const slice = buildSliceValue(opts);
  // border-image: source slice / width / outset repeat
  return `${source} ${slice} / ${opts.width} / ${opts.outset} ${opts.repeat}`;
}

/**
 * Generate CSS code using background-clip technique
 */
export function generateBackgroundClipCSS(config: GradientBorderConfig): string {
  const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
  const innerBg = buildInnerBgCSS(config);
  const lines = [
    `border: ${config.borderWidth}px solid transparent;`,
    `border-radius: ${config.borderRadius}px;`,
    `background: ${innerBg} padding-box,`,
    `  ${gradient} border-box;`,
  ];
  return lines.join('\n');
}

/**
 * Generate CSS code using border-image technique (with full properties)
 */
export function generateBorderImageCSS(config: GradientBorderConfig): string {
  const shorthand = buildBorderImageShorthand(config);
  const lines = [
    `border: ${config.borderWidth}px solid;`,
    `border-image: ${shorthand};`,
  ];
  return lines.join('\n');
}

/**
 * Generate CSS code using pseudo-element technique
 */
export function generatePseudoElementCSS(config: GradientBorderConfig): string {
  const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
  return [
    `position: relative;`,
    `border-radius: ${config.borderRadius}px;`,
    ``,
    `&::before {`,
    `  content: '';`,
    `  position: absolute;`,
    `  inset: 0;`,
    `  padding: ${config.borderWidth}px;`,
    `  border-radius: ${config.borderRadius}px;`,
    `  background: ${gradient};`,
    `  mask-image:`,
    `    linear-gradient(#000 0 0) content-box,`,
    `    linear-gradient(#000 0 0);`,
    `  mask-clip: content-box, padding-box;`,
    `  mask-composite: exclude;`,
    `  -webkit-mask-image:`,
    `    linear-gradient(#000 0 0) content-box,`,
    `    linear-gradient(#000 0 0);`,
    `  -webkit-mask-clip: content-box, padding-box;`,
    `  -webkit-mask-composite: destination-out;`,
    `}`,
  ].join('\n');
}

/**
 * Generate CSS code based on implementation method
 */
export function generateCSS(config: GradientBorderConfig): string {
  switch (config.implementation) {
    case 'border-image':
      return generateBorderImageCSS(config);
    case 'pseudo-element':
      return generatePseudoElementCSS(config);
    case 'background-clip':
    default:
      return generateBackgroundClipCSS(config);
  }
}

/**
 * Generate MUI sx prop code
 */
export function generateMUISx(config: GradientBorderConfig): string {
  switch (config.implementation) {
    case 'border-image': {
      const shorthand = buildBorderImageShorthand(config);
      return [
        `sx={{`,
        `  border: '${config.borderWidth}px solid',`,
        `  borderImage: '${shorthand}',`,
        `}}`,
      ].join('\n');
    }
    case 'background-clip': {
      const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
      const innerBg = buildInnerBgCSS(config);
      return [
        `sx={{`,
        `  border: '${config.borderWidth}px solid transparent',`,
        `  borderRadius: '${config.borderRadius}px',`,
        `  background: \`${innerBg} padding-box, ${gradient} border-box\`,`,
        `}}`,
      ].join('\n');
    }
    case 'pseudo-element':
      return `// Pseudo-element approach requires styled-components or a CSS file\n${generatePseudoElementCSS(config)}`;
  }
}

/**
 * Generate React inline style object
 */
export function generateReactStyle(config: GradientBorderConfig): string {
  if (config.implementation === 'background-clip') {
    const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
    const innerBg = buildInnerBgCSS(config);
    return [
      `style={{`,
      `  border: '${config.borderWidth}px solid transparent',`,
      `  borderRadius: '${config.borderRadius}px',`,
      `  background: \`${innerBg} padding-box, ${gradient} border-box\`,`,
      `}}`,
    ].join('\n');
  }

  if (config.implementation === 'border-image') {
    const shorthand = buildBorderImageShorthand(config);
    return [
      `style={{`,
      `  border: '${config.borderWidth}px solid',`,
      `  borderImage: '${shorthand}',`,
      `}}`,
    ].join('\n');
  }

  return `// Pseudo-element approach requires CSS, not inline styles`;
}

/**
 * Generate Tailwind + custom CSS approach
 */
export function generateTailwind(config: GradientBorderConfig): string {
  const lines: string[] = ["/* Tailwind doesn't natively support gradient borders. */", "/* Use custom CSS with Tailwind utility classes: */", ""];

  if (config.implementation === 'background-clip') {
    const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
    const innerBg = buildInnerBgCSS(config);
    lines.push('.gradient-border {');
    lines.push(`  border-radius: ${config.borderRadius}px;`);
    lines.push(`  border: ${config.borderWidth}px solid transparent;`);
    lines.push(`  background: ${innerBg} padding-box,`);
    lines.push(`    ${gradient} border-box;`);
    lines.push('}');
  } else {
    lines.push(generateCSS(config));
  }

  return lines.join('\n');
}

/**
 * Generate a complete standalone HTML file with the gradient border applied
 */
export function generateHTML(config: GradientBorderConfig): string {
  const css = generateCSS(config);
  const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);

  let elementStyle: string;
  let extraCSS = '';

  if (config.implementation === 'pseudo-element') {
    elementStyle = [
      `position: relative;`,
      `border-radius: ${config.borderRadius}px;`,
    ].join('\n    ');
    extraCSS = `.gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: ${config.borderWidth}px;
    border-radius: ${config.borderRadius}px;
    background: ${gradient};
    mask-image:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-clip: content-box, padding-box;
    mask-composite: exclude;
    -webkit-mask-image:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-clip: content-box, padding-box;
    -webkit-mask-composite: destination-out;
  }`;
  } else {
    elementStyle = css;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gradient Border</title>
  <style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1a2e;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .gradient-border {
    width: 320px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    ${elementStyle}
  }

  ${extraCSS}

  .gradient-border span {
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.5px;
    ${config.implementation === 'pseudo-element' ? 'position: relative;\n    z-index: 1;' : ''}
  }
  </style>
</head>
<body>
  <div class="gradient-border">
    <span>Gradient Border</span>
  </div>
</body>
</html>`;
}

/**
 * Generate unique ID for color stops
 */
export function createColorStop(color: string = '#6366f1', position: number = 50, opacity: number = 100) {
  return {
    id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    color,
    opacity,
    position,
  };
}

// ── CSS Import Parser ───────────────────────────────────────

/**
 * Find the closing paren matching the one at `openIndex`.
 */
function findMatchingParen(str: string, openIndex: number): number {
  let depth = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Split by commas while respecting nested parentheses.
 */
function splitGradientArgs(content: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of content) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Convert a CSS color string to { hex, opacity }.
 */
function parseCSSColor(str: string): { hex: string; opacity: number } | null {
  const s = str.trim().toLowerCase();

  // rgba(r, g, b, a) or rgb(r, g, b)
  const rgbaMatch = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgbaMatch) {
    const toHex = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
    const hex = '#' + toHex(+rgbaMatch[1]) + toHex(+rgbaMatch[2]) + toHex(+rgbaMatch[3]);
    const opacity = rgbaMatch[4] !== undefined ? Math.round(parseFloat(rgbaMatch[4]) * 100) : 100;
    return { hex, opacity };
  }

  // #rrggbb / #rgb / #rrggbbaa
  const hexMatch = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hexMatch) {
    let h = hexMatch[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length === 8) {
      const alpha = parseInt(h.slice(6, 8), 16) / 255;
      return { hex: '#' + h.slice(0, 6), opacity: Math.round(alpha * 100) };
    }
    return { hex: '#' + h, opacity: 100 };
  }

  if (s === 'transparent') return { hex: '#000000', opacity: 0 };

  const NAMED: Record<string, string> = {
    white: '#ffffff', black: '#000000', red: '#ff0000', green: '#008000',
    blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
    orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', gray: '#808080',
  };
  if (NAMED[s]) return { hex: NAMED[s], opacity: 100 };

  return null;
}

/**
 * Parse a single color-stop token like "rgba(0,106,158,0.8) 50%".
 */
function parseColorStopToken(str: string, index: number, total: number): ColorStop | null {
  const posMatch = str.match(/\s+([\d.]+)%\s*$/);
  const position = posMatch
    ? parseFloat(posMatch[1])
    : (total <= 1 ? 50 : Math.round((index / (total - 1)) * 100));
  const colorStr = posMatch ? str.slice(0, str.length - posMatch[0].length).trim() : str.trim();
  const parsed = parseCSSColor(colorStr);
  if (!parsed) return null;
  return {
    id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    color: parsed.hex,
    opacity: parsed.opacity,
    position: Math.round(position),
  };
}

/**
 * Parse border-image suffix: `slice [/ width [/ outset]] [repeat]`
 */
function parseBorderImageSuffix(suffix: string): Partial<BorderImageOptions> | null {
  const trimmed = suffix.trim();
  if (!trimmed) return null;

  const result: Partial<BorderImageOptions> = {};
  const REPEAT_KW = ['stretch', 'repeat', 'round', 'space'] as const;
  const slashParts = trimmed.split(/\s*\/\s*/);

  let slicePart = slashParts[0].trim();

  // When no slashes, last token might be a repeat keyword
  if (slashParts.length === 1) {
    const tokens = slicePart.split(/\s+/);
    if (REPEAT_KW.includes(tokens[tokens.length - 1] as BorderImageRepeat)) {
      result.repeat = tokens.pop() as BorderImageRepeat;
      slicePart = tokens.join(' ');
    }
  }

  result.sliceFill = /\bfill\b/.test(slicePart);
  result.slice = slicePart.replace(/\bfill\b/, '').trim() || '1';

  if (slashParts.length > 1) result.width = slashParts[1].trim();

  if (slashParts.length > 2) {
    const last = slashParts[slashParts.length - 1].trim();
    const tokens = last.split(/\s+/);
    if (REPEAT_KW.includes(tokens[tokens.length - 1] as BorderImageRepeat)) {
      result.repeat = tokens.pop() as BorderImageRepeat;
      result.outset = tokens.join(' ') || '0';
    } else {
      result.outset = last;
    }
  }

  return result;
}

/**
 * Parse a border-image CSS value and return a partial config.
 *
 * Supported inputs:
 * - `border-image: linear-gradient(154deg, rgba(0,106,158,0.8), rgba(7,59,98,0.35)) 1 1;`
 * - `linear-gradient(90deg, #ff0000, #00ff00 50%, #0000ff) 1 / 2px / 0 stretch`
 * - `radial-gradient(circle, #fff, transparent)`
 */
export function parseBorderImageCSS(input: string): {
  config: Partial<GradientBorderConfig>;
  error?: string;
} {
  let value = input.trim()
    .replace(/^border-image\s*:\s*/i, '')
    .replace(/;\s*$/, '')
    .trim();

  const funcMatch = value.match(/^(linear-gradient|radial-gradient|conic-gradient)\(/i);
  if (!funcMatch) {
    return { config: {}, error: 'No gradient function found (expected linear-gradient / radial-gradient / conic-gradient)' };
  }

  const gradientType = funcMatch[1].replace('-gradient', '').toLowerCase() as GradientType;
  const openParen = value.indexOf('(');
  const closeParen = findMatchingParen(value, openParen);
  if (closeParen === -1) return { config: {}, error: 'Malformed gradient — unmatched parenthesis' };

  const gradientContent = value.slice(openParen + 1, closeParen);
  const remaining = value.slice(closeParen + 1).trim();

  const args = splitGradientArgs(gradientContent);
  let angle = 180;
  let startIdx = 0;

  if (gradientType === 'linear') {
    const first = args[0].trim();
    const degMatch = first.match(/^([\d.]+)deg$/i);
    if (degMatch) { angle = parseFloat(degMatch[1]); startIdx = 1; }
    else if (/^to\s+/i.test(first)) { startIdx = 1; }
  } else if (gradientType === 'conic') {
    const fromMatch = args[0].trim().match(/^from\s+([\d.]+)deg$/i);
    if (fromMatch) { angle = parseFloat(fromMatch[1]); startIdx = 1; }
  } else if (gradientType === 'radial') {
    if (/^(circle|ellipse|closest|farthest|at\s)/i.test(args[0].trim())) { startIdx = 1; }
  }

  const stopCount = args.length - startIdx;
  const colorStops: ColorStop[] = [];
  for (let i = startIdx; i < args.length; i++) {
    const parsed = parseColorStopToken(args[i].trim(), i - startIdx, stopCount);
    if (parsed) colorStops.push(parsed);
  }

  if (colorStops.length < 2) {
    return { config: {}, error: 'Need at least 2 valid color stops' };
  }

  const result: Partial<GradientBorderConfig> = {
    gradientType,
    angle: Math.round(angle),
    colorStops,
  };

  if (remaining) {
    const opts = parseBorderImageSuffix(remaining);
    if (opts) {
      result.implementation = 'border-image';
      result.borderImageOptions = {
        sourceMode: 'gradient',
        imageUrl: '',
        slice: opts.slice ?? '1',
        sliceFill: opts.sliceFill ?? false,
        width: opts.width ?? '1',
        outset: opts.outset ?? '0',
        repeat: opts.repeat ?? 'stretch',
      };
    }
  }

  return { config: result };
}
