/**
 * Theme Engine - Color Extraction & Design Token Generation
 *
 * Step 1: Extract palette from image (node-vibrant)
 * Step 2: Map to semantic design tokens
 * Step 3: Auto-generate color scales 50-900 (chroma-js)
 */

import { Vibrant } from 'node-vibrant/browser';
import chroma from 'chroma-js';

import type { ColorScale, ColorScaleStep, DesignTokenTheme, SemanticTheme, VibrantPalette } from '@/types/ai';

const SCALE_STEPS: ColorScaleStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

/**
 * Step 1: Extract color palette from image using node-vibrant
 */
export async function extractFromImage(imageSource: string): Promise<VibrantPalette> {
  const palette = await Vibrant.from(imageSource).getPalette();

  const getHex = (swatch: { hex: string } | null, fallback: string): string => {
    if (!swatch) return fallback;
    return swatch.hex;
  };

  return {
    vibrant: getHex(palette.Vibrant, '#4A90E2'),
    muted: getHex(palette.Muted, '#A0AEC0'),
    darkVibrant: getHex(palette.DarkVibrant, '#1A202C'),
    lightVibrant: getHex(palette.LightVibrant, '#EBF8FF'),
    lightMuted: getHex(palette.LightMuted, '#F7FAFC'),
    darkMuted: getHex(palette.DarkMuted, '#2D3748'),
  };
}

/**
 * Step 2: Map vibrant palette to semantic design tokens
 */
export function mapToSemantic(palette: VibrantPalette): SemanticTheme {
  return {
    primary: palette.vibrant,
    secondary: palette.muted,
    accent: palette.lightVibrant,
    background: palette.lightMuted,
    surface: adjustBrightness(palette.lightMuted, 0.05),
    text: palette.darkVibrant,
  };
}

/**
 * Step 3: Generate color scale (50-900) from a single color using chroma.js
 */
export function generateScale(hex: string): ColorScale {
  const base = chroma(hex);

  // Generate scale from very light to very dark
  const scale = chroma
    .scale([
      chroma.mix('#ffffff', base, 0.1).hex(),
      chroma.mix('#ffffff', base, 0.3).hex(),
      base.hex(),
      chroma.mix('#000000', base, 0.3).hex(),
      chroma.mix('#000000', base, 0.6).hex(),
    ])
    .mode('lab');

  const scaleMap = {} as ColorScale;
  for (const step of SCALE_STEPS) {
    // Map 50-900 to 0-1 range
    const t = (step - 50) / 850;
    scaleMap[step] = scale(t).hex();
  }

  return scaleMap;
}

/**
 * Build complete design token theme from an image
 */
export async function buildDesignTheme(imageSource: string, imageName = 'image'): Promise<DesignTokenTheme> {
  const palette = await extractFromImage(imageSource);
  const semantic = mapToSemantic(palette);

  const scales: Record<keyof SemanticTheme, ColorScale> = {
    primary: generateScale(semantic.primary),
    secondary: generateScale(semantic.secondary),
    accent: generateScale(semantic.accent),
    background: generateScale(semantic.background),
    surface: generateScale(semantic.surface),
    text: generateScale(semantic.text),
  };

  return {
    source: imageName,
    palette,
    semantic,
    scales,
  };
}

/**
 * Adjust brightness of a hex color
 */
function adjustBrightness(hex: string, amount: number): string {
  const color = chroma(hex);
  const currentLuminance = color.luminance();
  const newLuminance = Math.min(1, Math.max(0, currentLuminance + amount));
  return color.luminance(newLuminance).hex();
}

/**
 * Get contrast text color (black or white) for a given background
 */
export function getContrastText(hex: string): string {
  return chroma(hex).luminance() > 0.5 ? '#000000' : '#FFFFFF';
}
