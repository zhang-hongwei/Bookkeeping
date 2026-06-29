/**
 * Color Harmony Utilities
 * Generate harmonious color combinations using color theory
 */

import chroma from 'chroma-js';
import type { HarmonyType, HarmonyColor, HarmonyOption } from '../types';

// ==================== Constants ====================

export const HARMONY_OPTIONS: HarmonyOption[] = [
  {
    type: 'complementary',
    label: 'Complementary',
    description: 'Two colors opposite on the color wheel',
    icon: '◐',
  },
  {
    type: 'triadic',
    label: 'Triadic',
    description: 'Three colors equally spaced (120° apart)',
    icon: '△',
  },
  {
    type: 'analogous',
    label: 'Analogous',
    description: 'Three colors adjacent on the color wheel',
    icon: '≋',
  },
  {
    type: 'split-complementary',
    label: 'Split Complementary',
    description: 'Base color plus two colors adjacent to its complement',
    icon: '⫿',
  },
  {
    type: 'tetradic',
    label: 'Tetradic (Rectangle)',
    description: 'Four colors forming a rectangle on the wheel',
    icon: '⬡',
  },
  {
    type: 'square',
    label: 'Square',
    description: 'Four colors equally spaced (90° apart)',
    icon: '◇',
  },
];

// ==================== Harmony Generation ====================

/**
 * Get HCL values from hex color
 */
function getHCL(hex: string): [number, number, number] {
  try {
    const color = chroma(hex);
    const [h, c, l] = color.hcl();
    // Handle NaN hue (for achromatic colors)
    return [isNaN(h) ? 0 : h, c, l];
  } catch {
    return [0, 0, 50];
  }
}

/**
 * Create a hex color from HCL values
 */
function hclToHex(h: number, c: number, l: number): string {
  try {
    return chroma.hcl(h, c, l).hex();
  } catch {
    // If color is out of gamut, clamp chroma
    const clampedC = Math.min(c, 100);
    return chroma.hcl(h, clampedC, l).hex();
  }
}

/**
 * Normalize angle to 0-360 range
 */
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Generate complementary colors (opposite on the color wheel)
 */
function generateComplementary(hex: string): HarmonyColor[] {
  const [h, c, l] = getHCL(hex);

  return [
    {
      hex,
      type: 'complementary',
      relationship: 'Base',
      angle: h,
    },
    {
      hex: hclToHex(normalizeAngle(h + 180), c, l),
      type: 'complementary',
      relationship: 'Complement',
      angle: normalizeAngle(h + 180),
    },
  ];
}

/**
 * Generate triadic colors (120° apart)
 */
function generateTriadic(hex: string): HarmonyColor[] {
  const [h, c, l] = getHCL(hex);

  return [
    {
      hex,
      type: 'triadic',
      relationship: 'Base',
      angle: h,
    },
    {
      hex: hclToHex(normalizeAngle(h + 120), c, l),
      type: 'triadic',
      relationship: 'Triad 1',
      angle: normalizeAngle(h + 120),
    },
    {
      hex: hclToHex(normalizeAngle(h + 240), c, l),
      type: 'triadic',
      relationship: 'Triad 2',
      angle: normalizeAngle(h + 240),
    },
  ];
}

/**
 * Generate analogous colors (adjacent on the wheel)
 */
function generateAnalogous(hex: string): HarmonyColor[] {
  const [h, c, l] = getHCL(hex);

  return [
    {
      hex: hclToHex(normalizeAngle(h - 30), c, l),
      type: 'analogous',
      relationship: 'Analogous -30°',
      angle: normalizeAngle(h - 30),
    },
    {
      hex,
      type: 'analogous',
      relationship: 'Base',
      angle: h,
    },
    {
      hex: hclToHex(normalizeAngle(h + 30), c, l),
      type: 'analogous',
      relationship: 'Analogous +30°',
      angle: normalizeAngle(h + 30),
    },
  ];
}

/**
 * Generate split-complementary colors
 */
function generateSplitComplementary(hex: string): HarmonyColor[] {
  const [h, c, l] = getHCL(hex);

  return [
    {
      hex,
      type: 'split-complementary',
      relationship: 'Base',
      angle: h,
    },
    {
      hex: hclToHex(normalizeAngle(h + 150), c, l),
      type: 'split-complementary',
      relationship: 'Split 1',
      angle: normalizeAngle(h + 150),
    },
    {
      hex: hclToHex(normalizeAngle(h + 210), c, l),
      type: 'split-complementary',
      relationship: 'Split 2',
      angle: normalizeAngle(h + 210),
    },
  ];
}

/**
 * Generate tetradic colors (rectangle on the wheel)
 */
function generateTetradic(hex: string): HarmonyColor[] {
  const [h, c, l] = getHCL(hex);

  return [
    {
      hex,
      type: 'tetradic',
      relationship: 'Base',
      angle: h,
    },
    {
      hex: hclToHex(normalizeAngle(h + 90), c, l),
      type: 'tetradic',
      relationship: 'Tetrad 1',
      angle: normalizeAngle(h + 90),
    },
    {
      hex: hclToHex(normalizeAngle(h + 180), c, l),
      type: 'tetradic',
      relationship: 'Tetrad 2',
      angle: normalizeAngle(h + 180),
    },
    {
      hex: hclToHex(normalizeAngle(h + 270), c, l),
      type: 'tetradic',
      relationship: 'Tetrad 3',
      angle: normalizeAngle(h + 270),
    },
  ];
}

/**
 * Generate square harmony (90° apart)
 */
function generateSquare(hex: string): HarmonyColor[] {
  const [h, c, l] = getHCL(hex);

  return [
    {
      hex,
      type: 'square',
      relationship: 'Base',
      angle: h,
    },
    {
      hex: hclToHex(normalizeAngle(h + 90), c, l),
      type: 'square',
      relationship: 'Square 1',
      angle: normalizeAngle(h + 90),
    },
    {
      hex: hclToHex(normalizeAngle(h + 180), c, l),
      type: 'square',
      relationship: 'Square 2',
      angle: normalizeAngle(h + 180),
    },
    {
      hex: hclToHex(normalizeAngle(h + 270), c, l),
      type: 'square',
      relationship: 'Square 3',
      angle: normalizeAngle(h + 270),
    },
  ];
}

// ==================== Main Function ====================

/**
 * Generate harmonious colors based on the specified harmony type
 */
export function generateHarmony(hex: string, type: HarmonyType): HarmonyColor[] {
  const normalizedHex = chroma(hex).hex().toUpperCase();

  switch (type) {
    case 'complementary':
      return generateComplementary(normalizedHex);
    case 'triadic':
      return generateTriadic(normalizedHex);
    case 'analogous':
      return generateAnalogous(normalizedHex);
    case 'split-complementary':
      return generateSplitComplementary(normalizedHex);
    case 'tetradic':
      return generateTetradic(normalizedHex);
    case 'square':
      return generateSquare(normalizedHex);
    default:
      return generateComplementary(normalizedHex);
  }
}

/**
 * Generate all harmony types for a color
 */
export function generateAllHarmonies(hex: string): Record<HarmonyType, HarmonyColor[]> {
  return {
    complementary: generateComplementary(hex),
    triadic: generateTriadic(hex),
    analogous: generateAnalogous(hex),
    'split-complementary': generateSplitComplementary(hex),
    tetradic: generateTetradic(hex),
    square: generateSquare(hex),
  };
}

/**
 * Get harmony type option by type
 */
export function getHarmonyOption(type: HarmonyType): HarmonyOption | undefined {
  return HARMONY_OPTIONS.find((option) => option.type === type);
}

/**
 * Calculate the angle between two colors on the color wheel
 */
export function getColorAngle(hex1: string, hex2: string): number {
  const [h1] = getHCL(hex1);
  const [h2] = getHCL(hex2);
  return normalizeAngle(h2 - h1);
}

/**
 * Check if two colors are complementary
 */
export function isComplementary(hex1: string, hex2: string, tolerance = 10): boolean {
  const angle = getColorAngle(hex1, hex2);
  return Math.abs(angle - 180) <= tolerance || Math.abs(angle - 180) >= 360 - tolerance;
}
