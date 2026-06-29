/**
 * Color Harmonies Utilities
 * Generate harmonious color schemes using color theory
 */

import chroma from 'chroma-js';
import type { HarmonyType, HarmonyInfo, HarmonyResult } from './types';

/**
 * All available harmony types with metadata
 */
export const HARMONY_TYPES: HarmonyInfo[] = [
  {
    type: 'complementary',
    name: 'Complementary',
    description: 'Two colors opposite on the color wheel (180°)',
    colorCount: 2,
  },
  {
    type: 'triadic',
    name: 'Triadic',
    description: 'Three colors evenly spaced (120°)',
    colorCount: 3,
  },
  {
    type: 'tetradic',
    name: 'Tetradic / Square',
    description: 'Four colors evenly spaced (90°)',
    colorCount: 4,
  },
  {
    type: 'analogous',
    name: 'Analogous',
    description: 'Colors adjacent on the color wheel (30°)',
    colorCount: 5,
  },
  {
    type: 'split-complementary',
    name: 'Split Complementary',
    description: 'Base color + two colors adjacent to complement',
    colorCount: 3,
  },
  {
    type: 'compound',
    name: 'Compound',
    description: 'Base + complement + two analogous colors',
    colorCount: 4,
  },
];

/**
 * Get base hue from color
 */
function getHue(color: string): number {
  try {
    const [h] = chroma(color).hsl();
    return isNaN(h) ? 0 : h;
  } catch {
    return 0;
  }
}

/**
 * Create color from HSL values
 */
function hslToHex(h: number, s: number, l: number): string {
  try {
    return chroma.hsl(h % 360, s, l).hex();
  } catch {
    return '#808080';
  }
}

/**
 * Generate complementary colors (180° apart)
 */
function getComplementary(baseColor: string, s: number, l: number): string[] {
  const h = getHue(baseColor);
  return [
    baseColor,
    hslToHex(h + 180, s, l),
  ];
}

/**
 * Generate triadic colors (120° apart)
 */
function getTriadic(baseColor: string, s: number, l: number): string[] {
  const h = getHue(baseColor);
  return [
    baseColor,
    hslToHex(h + 120, s, l),
    hslToHex(h + 240, s, l),
  ];
}

/**
 * Generate tetradic/square colors (90° apart)
 */
function getTetradic(baseColor: string, s: number, l: number): string[] {
  const h = getHue(baseColor);
  return [
    baseColor,
    hslToHex(h + 90, s, l),
    hslToHex(h + 180, s, l),
    hslToHex(h + 270, s, l),
  ];
}

/**
 * Generate analogous colors (30° apart)
 */
function getAnalogous(baseColor: string, s: number, l: number): string[] {
  const h = getHue(baseColor);
  return [
    hslToHex(h - 60, s, l),
    hslToHex(h - 30, s, l),
    baseColor,
    hslToHex(h + 30, s, l),
    hslToHex(h + 60, s, l),
  ];
}

/**
 * Generate split-complementary colors
 */
function getSplitComplementary(baseColor: string, s: number, l: number): string[] {
  const h = getHue(baseColor);
  return [
    baseColor,
    hslToHex(h + 150, s, l),
    hslToHex(h + 210, s, l),
  ];
}

/**
 * Generate compound colors (base + complement + analogous)
 */
function getCompound(baseColor: string, s: number, l: number): string[] {
  const h = getHue(baseColor);
  return [
    baseColor,
    hslToHex(h + 30, s, l),
    hslToHex(h + 180, s, l),
    hslToHex(h + 210, s, l),
  ];
}

/**
 * Get labels for harmony colors
 */
function getLabels(type: HarmonyType): string[] {
  switch (type) {
    case 'complementary':
      return ['Base', 'Complement'];
    case 'triadic':
      return ['Base', 'Triad 2', 'Triad 3'];
    case 'tetradic':
      return ['Base', 'Square 2', 'Complement', 'Square 4'];
    case 'analogous':
      return ['Analog 1', 'Analog 2', 'Base', 'Analog 3', 'Analog 4'];
    case 'split-complementary':
      return ['Base', 'Split 1', 'Split 2'];
    case 'compound':
      return ['Base', 'Analogous', 'Complement', 'Complement Analog'];
    default:
      return [];
  }
}

/**
 * Generate harmony colors based on type
 */
export function generateHarmony(
  baseColor: string,
  type: HarmonyType,
  saturation: number = 0.7,
  lightness: number = 0.5
): HarmonyResult {
  let colors: string[];

  switch (type) {
    case 'complementary':
      colors = getComplementary(baseColor, saturation, lightness);
      break;
    case 'triadic':
      colors = getTriadic(baseColor, saturation, lightness);
      break;
    case 'tetradic':
      colors = getTetradic(baseColor, saturation, lightness);
      break;
    case 'analogous':
      colors = getAnalogous(baseColor, saturation, lightness);
      break;
    case 'split-complementary':
      colors = getSplitComplementary(baseColor, saturation, lightness);
      break;
    case 'compound':
      colors = getCompound(baseColor, saturation, lightness);
      break;
    default:
      colors = [baseColor];
  }

  return {
    type,
    baseColor,
    colors,
    labels: getLabels(type),
  };
}

/**
 * Get harmony info by type
 */
export function getHarmonyInfo(type: HarmonyType): HarmonyInfo | undefined {
  return HARMONY_TYPES.find(h => h.type === type);
}

/**
 * Generate CSS custom properties
 */
export function generateCSS(result: HarmonyResult): string {
  const lines = result.colors.map((color, i) => {
    return `  --color-harmony-${i + 1}: ${color};`;
  });
  return `:root {\n${lines.join('\n')}\n}`;
}

/**
 * Generate Tailwind config
 */
export function generateTailwind(result: HarmonyResult): string {
  const colors = result.colors.map((color, i) => {
    return `      '${i + 1}': '${color}',`;
  });
  return `module.exports = {
  theme: {
    extend: {
      colors: {
        harmony: {
${colors.join('\n')}
        },
      },
    },
  },
};`;
}

/**
 * Generate JSON
 */
export function generateJSON(result: HarmonyResult): string {
  const obj = {
    type: result.type,
    baseColor: result.baseColor,
    colors: result.colors.map((color, i) => ({
      label: result.labels[i],
      hex: color,
      rgb: chroma(color).rgb(),
      hsl: chroma(color).hsl().map(v => Math.round(v * 100) / 100),
    })),
  };
  return JSON.stringify(obj, null, 2);
}

/**
 * Generate SCSS variables
 */
export function generateSCSS(result: HarmonyResult): string {
  const lines = result.colors.map((color, i) => {
    return `$color-harmony-${i + 1}: ${color};`;
  });
  return lines.join('\n');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
