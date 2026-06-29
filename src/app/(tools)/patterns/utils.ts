/**
 * Background Pattern Utilities
 * Generate SVG patterns and CSS backgrounds
 */

import type { PatternConfig, PatternType } from './types';

/**
 * Generate SVG pattern by type
 */
export function generateSVGPattern(config: PatternConfig): string {
  const { type, foreground, background, size, opacity, strokeWidth = 1, spacing = 0 } = config;
  const patternSize = size + spacing;
  const halfSize = patternSize / 2;
  const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');

  const patterns: Record<PatternType, string> = {
    stripes: `
      <pattern id="stripes" patternUnits="userSpaceOnUse" width="${patternSize * 2}" height="${patternSize}" patternTransform="rotate(0)">
        <rect width="${patternSize}" height="${patternSize * 2}" fill="${foreground}${opacityHex}"/>
      </pattern>`,

    diagonalStripes: `
      <pattern id="diagonalStripes" patternUnits="userSpaceOnUse" width="${patternSize * 2}" height="${patternSize * 2}">
        <rect width="${patternSize * 2}" height="${patternSize * 2}" fill="${background}"/>
        <path d="M0 ${patternSize}L${patternSize} 0L${patternSize * 2} ${patternSize}Z${patternSize * 2} 0" stroke="${foreground}${opacityHex}" stroke-width="${strokeWidth}"/>
        <path d="M0 0L${patternSize * 2} ${patternSize * 2}" stroke="${foreground}${opacityHex}" stroke-width="${strokeWidth}"/>
      </pattern>`,

    grid: `
      <pattern id="grid" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}">
        <rect width="${patternSize}" height="${patternSize}" fill="${background}"/>
        <path d="M${patternSize} 0L0 0 0 ${patternSize}" fill="none" stroke="${foreground}${opacityHex}" stroke-width="${strokeWidth}"/>
      </pattern>`,

    dots: `
      <pattern id="dots" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}">
        <circle cx="${halfSize}" cy="${halfSize}" r="${size / 6}" fill="${foreground}${opacityHex}"/>
      </pattern>`,

    zigzag: `
      <pattern id="zigzag" patternUnits="userSpaceOnUse" width="${patternSize * 2}" height="${patternSize}">
        <path d="M0 ${halfSize}L${halfSize} 0L${patternSize} ${halfSize}L${patternSize * 2} 0" fill="none" stroke="${foreground}${opacityHex}" stroke-width="${strokeWidth}"/>
      </pattern>`,

    waves: `
      <pattern id="waves" patternUnits="userSpaceOnUse" width="${patternSize * 2}" height="${patternSize}">
        <path d="M0 ${halfSize}Q${halfSize} 0 ${patternSize} ${halfSize}T${patternSize * 2} ${halfSize}" fill="none" stroke="${foreground}${opacityHex}" stroke-width="${strokeWidth}"/>
      </pattern>`,

    triangles: `
      <pattern id="triangles" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}">
        <polygon points="${halfSize},0 ${patternSize},${patternSize} 0,${patternSize}" fill="${foreground}${opacityHex}"/>
      </pattern>`,

    squares: `
      <pattern id="squares" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}">
        <rect x="${patternSize / 4}" y="${patternSize / 4}" width="${patternSize / 2}" height="${patternSize / 2}" fill="${foreground}${opacityHex}"/>
      </pattern>`,

    circles: `
      <pattern id="circles" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}">
        <circle cx="${halfSize}" cy="${halfSize}" r="${size / 3}" fill="none" stroke="${foreground}${opacityHex}" stroke-width="${strokeWidth}"/>
      </pattern>`,

    hexagons: `
      <pattern id="hexagons" patternUnits="userSpaceOnUse" width="${patternSize}" height="${patternSize}">
        <polygon points="${halfSize},0 ${patternSize},${patternSize/4} ${patternSize},${patternSize*3/4} ${halfSize},${patternSize} 0,${patternSize*3/4} 0,${patternSize/4}" fill="${foreground}${opacityHex}"/>
      </pattern>`,
  };

  return patterns[type] || patterns.dots;
}

/**
 * Generate complete SVG
 */
export function generateSVG(config: PatternConfig): string {
  const { background } = config;
  const pattern = generateSVGPattern(config);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    ${pattern}
  </defs>
  <rect width="100%" height="100%" fill="${background}"/>
  <rect width="100%" height="100%" fill="url(#${config.type})"/>
</svg>`;
}

/**
 * Generate SVG data URL
 */
export function generateSVGDataURL(config: PatternConfig): string {
  const svg = generateSVG(config);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Generate CSS background-image
 */
export function generateCSS(config: PatternConfig): string {
  const dataURL = generateSVGDataURL(config);
  return `background-image: url("${dataURL}");`;
}

/**
 * Generate CSS Gradient alternative (for some patterns)
 */
export function generateCSSGradient(config: PatternConfig): string {
  const { type, foreground, background, size } = config;
  const opacityHex = Math.round(config.opacity * 255).toString(16).padStart(2, '0');

  switch (type) {
    case 'stripes':
      return `background: repeating-linear-gradient(
  0deg,
  ${background},
  ${background} ${size}px,
  ${foreground}${opacityHex} ${size}px,
  ${foreground}${opacityHex} ${size * 2}px
);`;

    case 'diagonalStripes':
      return `background: repeating-linear-gradient(
  45deg,
  ${background},
  ${background} ${size}px,
  ${foreground}${opacityHex} ${size}px,
  ${foreground}${opacityHex} ${size * 2}px
);`;

    case 'grid':
      return `background-image:
  linear-gradient(${foreground}${opacityHex} 1px, transparent 1px),
  linear-gradient(90deg, ${foreground}${opacityHex} 1px, transparent 1px);
background-size: ${size}px ${size}px;`;

    case 'dots':
      return `background-image: radial-gradient(
  ${foreground}${opacityHex} 1px,
  ${background} 1px
);
background-size: ${size}px ${size}px;`;

    default:
      return generateCSS(config);
  }
}

/**
 * Generate JSON output
 */
export function generateJSON(config: PatternConfig): string {
  return JSON.stringify(
    {
      type: config.type,
      svg: generateSVG(config),
      css: generateCSS(config),
      cssGradient: generateCSSGradient(config),
      dataURL: generateSVGDataURL(config),
      config: {
        foreground: config.foreground,
        background: config.background,
        size: config.size,
        opacity: config.opacity,
      },
    },
    null,
    2
  );
}
