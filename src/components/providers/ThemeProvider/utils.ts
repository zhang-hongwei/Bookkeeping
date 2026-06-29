/**
 * Theme utility functions
 * Replaces minimal-shared/utils dependencies with local implementations
 */

// Re-export color utilities from centralized color module
export { varAlpha, createPaletteChannel } from '@/utils/color/color';
export type { InputPalette, ChannelPalette } from '@/utils/color/color';

/**
 * Converts pixels to rem units
 * @param px - Pixel value
 * @returns rem string
 */
export function pxToRem(px: number): string {
  return `${px / 16}rem`;
}

/**
 * Sets font family with fallbacks
 * @param fontName - Primary font name
 * @returns Font family string with fallbacks
 */
export function setFont(fontName: string): string {
  return `"${fontName}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`;
}
