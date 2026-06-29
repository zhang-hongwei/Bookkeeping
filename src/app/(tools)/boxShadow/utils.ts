/**
 * Box Shadow Editor Utilities
 * Utility function collection
 */

import { ShadowLayer, RgbColor, ExportFormat } from './types';

/**
 * Convert HEX color to RGB values
 * @param hex - HEX color string (supports #RGB, #RRGGBB formats)
 * @returns RGB color object
 */
export function hexToRgb(hex: string): RgbColor {
  // Remove # symbol
  const cleanHex = hex.replace(/^#/, '');

  // Handle short format (#RGB)
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }

  // Handle standard format (#RRGGBB)
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }

  // Default to black
  return { r: 0, g: 0, b: 0 };
}

/**
 * Convert a single shadow layer to CSS string
 * @param layer - Shadow layer configuration
 * @returns CSS box-shadow string fragment
 */
export function layerToCss(layer: ShadowLayer): string {
  const { offsetX, offsetY, blur, spread, color, opacity, inset } = layer;
  const rgb = hexToRgb(color);
  const insetPrefix = inset ? 'inset ' : '';

  return `${insetPrefix}${offsetX}px ${offsetY}px ${blur}px ${spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Generate complete box-shadow CSS string
 * @param layers - Shadow layer array
 * @returns Complete box-shadow value
 */
export function buildBoxShadow(layers: ShadowLayer[]): string {
  const enabledLayers = layers.filter(layer => layer.enabled);

  if (enabledLayers.length === 0) {
    return 'none';
  }

  return enabledLayers
    .map(layer => layerToCss(layer))
    .join(', ');
}

/**
 * Export shadow code in different formats
 * @param layers - Shadow layer array
 * @param format - Export format
 * @returns Formatted code string
 */
export function exportShadow(layers: ShadowLayer[], format: ExportFormat): string {
  const shadow = buildBoxShadow(layers);

  switch (format) {
    case 'css':
      return `box-shadow: ${shadow};`;

    case 'mui':
      return `boxShadow: '${shadow}',`;

    case 'tailwind':
      return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'custom': '${shadow}',
      },
    },
  },
};`;

    case 'json':
      return JSON.stringify(
        layers.map(({ id, enabled, ...rest }) => rest),
        null,
        2
      );

    default:
      return shadow;
  }
}

/**
 * Create a default shadow layer
 * @returns Default shadow layer configuration
 */
export function createDefaultLayer(): ShadowLayer {
  return {
    id: generateId(),
    offsetX: 0,
    offsetY: 4,
    blur: 8,
    spread: 0,
    color: '#000000',
    opacity: 0.15,
    inset: false,
    enabled: true,
  };
}

/**
 * Duplicate a shadow layer
 * @param layer - Layer to duplicate
 * @returns New shadow layer (with new ID)
 */
export function duplicateLayer(layer: ShadowLayer): ShadowLayer {
  return {
    ...layer,
    id: generateId(),
  };
}

/**
 * Generate unique ID
 * @returns Unique identifier
 */
export function generateId(): string {
  return `shadow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate HEX color format
 * @param hex - HEX color string
 * @returns Whether it's a valid HEX color
 */
export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Format number (limit decimal places)
 * @param value - Number value
 * @param decimals - Decimal places
 * @returns Formatted number
 */
export function formatNumber(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
