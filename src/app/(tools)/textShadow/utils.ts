/**
 * Text Shadow Utilities
 * Helper functions for generating text-shadow CSS
 */

import type { TextShadowLayer, TextShadowExportFormat } from './types';

/**
 * Convert hex to rgba
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generate single shadow layer CSS
 */
export function generateShadowLayer(layer: TextShadowLayer): string {
  const color = layer.color.startsWith('#')
    ? hexToRgba(layer.color, layer.opacity)
    : layer.color;
  return `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${color}`;
}

/**
 * Generate text-shadow CSS string
 */
export function generateTextShadowCSS(layers: TextShadowLayer[]): string {
  if (layers.length === 0) return 'none';
  return layers.map(generateShadowLayer).join(', ');
}

/**
 * Generate complete CSS
 */
export function generateCSS(layers: TextShadowLayer[]): string {
  return `.text-shadow {
  text-shadow: ${generateTextShadowCSS(layers)};
}`;
}

/**
 * Generate MUI sx prop
 */
export function generateMUI(layers: TextShadowLayer[]): string {
  return `<Typography
  sx={{
    textShadow: '${generateTextShadowCSS(layers)}',
  }}
>
  Your Text
</Typography>`;
}

/**
 * Generate Tailwind classes (arbitrary values)
 */
export function generateTailwind(layers: TextShadowLayer[]): string {
  if (layers.length === 0) return 'text-shadow-none';
  const shadow = generateTextShadowCSS(layers).replace(/\s+/g, '_');
  return `text-shadow-[${shadow}]`;
}

/**
 * Generate JSON output
 */
export function generateJSON(layers: TextShadowLayer[]): string {
  return JSON.stringify(
    {
      textShadow: generateTextShadowCSS(layers),
      layers: layers.map((layer) => ({
        offsetX: `${layer.offsetX}px`,
        offsetY: `${layer.offsetY}px`,
        blur: `${layer.blur}px`,
        color: layer.color,
        opacity: layer.opacity,
      })),
    },
    null,
    2
  );
}

/**
 * Generate code by format
 */
export function generateCode(layers: TextShadowLayer[], format: TextShadowExportFormat): string {
  switch (format) {
    case 'css':
      return generateCSS(layers);
    case 'mui':
      return generateMUI(layers);
    case 'tailwind':
      return generateTailwind(layers);
    case 'json':
      return generateJSON(layers);
    default:
      return generateCSS(layers);
  }
}
