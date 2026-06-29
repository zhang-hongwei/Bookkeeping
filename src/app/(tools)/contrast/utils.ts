/**
 * Contrast Checker Utilities
 * Helper functions for calculating color contrast ratios
 */

import type { ContrastResult, WCAGLevel } from './types';

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # and any whitespace
  hex = hex.replace(/^#?\s*/, '').trim();

  // Expand shorthand hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Calculate relative luminance
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(
  foreground: string,
  background: string
): number {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  const fgLum = getLuminance(fg.r, fg.g, fg.b);
  const bgLum = getLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return ratio;
}

/**
 * Get WCAG level from contrast ratio
 */
export function getWCAGLevel(ratio: number): WCAGLevel {
  if (ratio >= 7) {
    return 'AAA';
  }
  if (ratio >= 4.5) {
    return 'AA';
  }
  if (ratio >= 3) {
    return 'AA Large';
  }
  return 'AAA Large';
}

/**
 * Check if contrast passes WCAG requirements
 */
export function checkContrast(
  foreground: string,
  background: string
): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);
  const level = getWCAGLevel(ratio);

  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    passing: level === 'AAA' || level === 'AA',
    foreground,
    background,
  };
}
