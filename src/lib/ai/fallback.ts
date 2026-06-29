/**
 * Fallback Color Palettes
 * Pre-defined palettes for when AI service is unavailable
 */

import type { FallbackPalette, ColorStyle } from '@/types/ai';

export const FALLBACK_PALETTES: Record<ColorStyle, FallbackPalette> = {
  modern: {
    name: 'Modern Tech',
    colors: [
      { hex: '#2563EB', name: 'Royal Blue', description: 'Primary brand color' },
      { hex: '#7C3AED', name: 'Violet', description: 'Accent for highlights' },
      { hex: '#06B6D4', name: 'Cyan', description: 'Secondary accent' },
      { hex: '#1F2937', name: 'Dark Gray', description: 'Text and headings' },
      { hex: '#F9FAFB', name: 'Off White', description: 'Background' },
      { hex: '#E5E7EB', name: 'Light Gray', description: 'Borders and dividers' },
    ],
  },
  minimalist: {
    name: 'Minimal Clean',
    colors: [
      { hex: '#000000', name: 'Black', description: 'Primary text' },
      { hex: '#FFFFFF', name: 'White', description: 'Background' },
      { hex: '#F5F5F5', name: 'Light Gray', description: 'Secondary background' },
      { hex: '#333333', name: 'Charcoal', description: 'Secondary text' },
      { hex: '#2563EB', name: 'Blue', description: 'Accent color' },
    ],
  },
  vibrant: {
    name: 'Vibrant Energy',
    colors: [
      { hex: '#FF6B6B', name: 'Coral Red', description: 'Primary vibrant' },
      { hex: '#4ECDC4', name: 'Turquoise', description: 'Fresh accent' },
      { hex: '#FFE66D', name: 'Sunny Yellow', description: 'Highlight' },
      { hex: '#95E1D3', name: 'Mint', description: 'Secondary accent' },
      { hex: '#F38181', name: 'Salmon', description: 'Warm accent' },
      { hex: '#2C3E50', name: 'Dark Blue Gray', description: 'Text' },
    ],
  },
  pastel: {
    name: 'Pastel Dreams',
    colors: [
      { hex: '#FFB5BA', name: 'Pastel Pink', description: 'Soft primary' },
      { hex: '#B5DEFF', name: 'Baby Blue', description: 'Calm accent' },
      { hex: '#FFFACD', name: 'Lemon Chiffon', description: 'Light highlight' },
      { hex: '#C3B1E1', name: 'Lavender', description: 'Secondary accent' },
      { hex: '#98D8C8', name: 'Mint Green', description: 'Fresh touch' },
      { hex: '#FFFFFF', name: 'White', description: 'Background' },
    ],
  },
  dark: {
    name: 'Dark Mode',
    colors: [
      { hex: '#0D1117', name: 'Deep Black', description: 'Main background' },
      { hex: '#161B22', name: 'Dark Gray', description: 'Card background' },
      { hex: '#21262D', name: 'Medium Gray', description: 'Secondary background' },
      { hex: '#58A6FF', name: 'Sky Blue', description: 'Primary accent' },
      { hex: '#7EE787', name: 'Green', description: 'Success indicator' },
      { hex: '#C9D1D9', name: 'Light Gray', description: 'Text color' },
    ],
  },
  earthy: {
    name: 'Earth Tones',
    colors: [
      { hex: '#8B4513', name: 'Saddle Brown', description: 'Primary earthy' },
      { hex: '#D2691E', name: 'Chocolate', description: 'Warm accent' },
      { hex: '#556B2F', name: 'Dark Olive', description: 'Natural green' },
      { hex: '#F5DEB3', name: 'Wheat', description: 'Light background' },
      { hex: '#2F4F4F', name: 'Dark Slate', description: 'Text' },
      { hex: '#DEB887', name: 'Burlywood', description: 'Secondary accent' },
    ],
  },
  ocean: {
    name: 'Ocean Depths',
    colors: [
      { hex: '#0077B6', name: 'Ocean Blue', description: 'Primary color' },
      { hex: '#00B4D8', name: 'Sky Blue', description: 'Bright accent' },
      { hex: '#90E0EF', name: 'Light Cyan', description: 'Soft highlight' },
      { hex: '#03045E', name: 'Navy', description: 'Dark background' },
      { hex: '#CAF0F8', name: 'Pale Blue', description: 'Light background' },
      { hex: '#023E8A', name: 'Deep Blue', description: 'Secondary' },
    ],
  },
  sunset: {
    name: 'Sunset Glow',
    colors: [
      { hex: '#FF7E5F', name: 'Coral', description: 'Primary warm' },
      { hex: '#FEB47B', name: 'Peach', description: 'Secondary' },
      { hex: '#FF6B6B', name: 'Sunset Red', description: 'Accent' },
      { hex: '#C44569', name: 'Rose', description: 'Deep accent' },
      { hex: '#2C3E50', name: 'Dark Blue', description: 'Text' },
      { hex: '#FFE66D', name: 'Golden', description: 'Highlight' },
    ],
  },
  forest: {
    name: 'Forest Greens',
    colors: [
      { hex: '#2D5016', name: 'Forest Green', description: 'Primary' },
      { hex: '#4A7C23', name: 'Grass Green', description: 'Secondary' },
      { hex: '#8B7355', name: 'Wood Brown', description: 'Accent' },
      { hex: '#90EE90', name: 'Light Green', description: 'Highlight' },
      { hex: '#1A3003', name: 'Dark Forest', description: 'Background' },
      { hex: '#F5F5DC', name: 'Beige', description: 'Light accent' },
    ],
  },
  tech: {
    name: 'Tech Future',
    colors: [
      { hex: '#00D4FF', name: 'Electric Blue', description: 'Primary accent' },
      { hex: '#7B2CBF', name: 'Electric Purple', description: 'Secondary' },
      { hex: '#E100FF', name: 'Neon Pink', description: 'Highlight' },
      { hex: '#0A0A0A', name: 'Deep Black', description: 'Background' },
      { hex: '#1A1A2E', name: 'Dark Navy', description: 'Card background' },
      { hex: '#00FF88', name: 'Neon Green', description: 'Success' },
    ],
  },
  retro: {
    name: 'Retro Vibes',
    colors: [
      { hex: '#E63946', name: 'Retro Red', description: 'Primary' },
      { hex: '#F4A261', name: 'Sandy Orange', description: 'Secondary' },
      { hex: '#E9C46A', name: 'Mustard', description: 'Accent' },
      { hex: '#2A9D8F', name: 'Teal', description: 'Cool accent' },
      { hex: '#264653', name: 'Dark Teal', description: 'Background' },
      { hex: '#F1FAEE', name: 'Off White', description: 'Text' },
    ],
  },
  luxury: {
    name: 'Luxury Gold',
    colors: [
      { hex: '#D4AF37', name: 'Gold', description: 'Primary luxury' },
      { hex: '#000000', name: 'Black', description: 'Background' },
      { hex: '#1A1A1A', name: 'Dark Gray', description: 'Card' },
      { hex: '#FFFFFF', name: 'White', description: 'Text' },
      { hex: '#B8860B', name: 'Dark Goldenrod', description: 'Secondary' },
      { hex: '#2C2C2C', name: 'Charcoal', description: 'Secondary background' },
    ],
  },
};

/**
 * Get fallback palette by style
 */
export function getFallbackPalette(style: ColorStyle): FallbackPalette {
  return FALLBACK_PALETTES[style] || FALLBACK_PALETTES.modern;
}

/**
 * Get random fallback palette
 */
export function getRandomFallbackPalette(): FallbackPalette {
  const styles = Object.keys(FALLBACK_PALETTES) as ColorStyle[];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  return FALLBACK_PALETTES[randomStyle];
}
