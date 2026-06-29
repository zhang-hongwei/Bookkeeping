/**
 * Color Blindness Simulation Utilities
 * Simulate how colors appear to people with different types of color vision deficiency
 */

import {
  protanopia,
  deuteranopia,
  tritanopia,
  achromatopsia,
} from 'color-blind';
import type { ColorBlindnessType, BlindnessTypeInfo } from '../types';

// ==================== Constants ====================

export const BLINDNESS_TYPES: BlindnessTypeInfo[] = [
  {
    type: 'protanopia',
    label: 'Protanopia',
    description: 'Red-blind - Cannot perceive red light',
    prevalence: '~1% of males',
  },
  {
    type: 'deuteranopia',
    label: 'Deuteranopia',
    description: 'Green-blind - Cannot perceive green light',
    prevalence: '~1% of males',
  },
  {
    type: 'tritanopia',
    label: 'Tritanopia',
    description: 'Blue-blind - Cannot perceive blue light',
    prevalence: '~0.01% of population',
  },
  {
    type: 'achromatopsia',
    label: 'Achromatopsia',
    description: 'Complete color blindness - Sees only grayscale',
    prevalence: '~0.003% of population',
  },
];

// ==================== Simulation Functions ====================

/**
 * Simulate how a color appears to someone with protanopia (red-blind)
 */
export function simulateProtanopia(hex: string): string {
  return protanopia(hex);
}

/**
 * Simulate how a color appears to someone with deuteranopia (green-blind)
 */
export function simulateDeuteranopia(hex: string): string {
  return deuteranopia(hex);
}

/**
 * Simulate how a color appears to someone with tritanopia (blue-blind)
 */
export function simulateTritanopia(hex: string): string {
  return tritanopia(hex);
}

/**
 * Simulate how a color appears to someone with achromatopsia (complete color blindness)
 */
export function simulateAchromatopsia(hex: string): string {
  return achromatopsia(hex);
}

// ==================== Main Function ====================

/**
 * Simulate color blindness for a single color
 */
export function simulateColorBlindness(
  hex: string,
  type: ColorBlindnessType
): string {
  const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;

  switch (type) {
    case 'protanopia':
      return simulateProtanopia(normalizedHex);
    case 'deuteranopia':
      return simulateDeuteranopia(normalizedHex);
    case 'tritanopia':
      return simulateTritanopia(normalizedHex);
    case 'achromatopsia':
      return simulateAchromatopsia(normalizedHex);
    default:
      return normalizedHex;
  }
}

/**
 * Simulate color blindness for multiple colors
 */
export function simulatePalette(
  colors: string[],
  type: ColorBlindnessType
): string[] {
  return colors.map((color) => simulateColorBlindness(color, type));
}

/**
 * Simulate all types of color blindness for a single color
 */
export function simulateAllTypes(hex: string): Record<ColorBlindnessType, string> {
  const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;

  return {
    protanopia: simulateProtanopia(normalizedHex),
    deuteranopia: simulateDeuteranopia(normalizedHex),
    tritanopia: simulateTritanopia(normalizedHex),
    achromatopsia: simulateAchromatopsia(normalizedHex),
  };
}

/**
 * Get blindness type info by type
 */
export function getBlindnessTypeInfo(
  type: ColorBlindnessType
): BlindnessTypeInfo | undefined {
  return BLINDNESS_TYPES.find((info) => info.type === type);
}

/**
 * Check if two colors might be confused by color blind users
 * Returns true if the simulated colors are very similar
 */
export function areColorsConfusable(
  hex1: string,
  hex2: string,
  type: ColorBlindnessType,
  threshold = 30
): boolean {
  const simulated1 = simulateColorBlindness(hex1, type);
  const simulated2 = simulateColorBlindness(hex2, type);

  // Calculate color difference using RGB distance
  const r1 = parseInt(simulated1.slice(1, 3), 16);
  const g1 = parseInt(simulated1.slice(3, 5), 16);
  const b1 = parseInt(simulated1.slice(5, 7), 16);

  const r2 = parseInt(simulated2.slice(1, 3), 16);
  const g2 = parseInt(simulated2.slice(3, 5), 16);
  const b2 = parseInt(simulated2.slice(5, 7), 16);

  const distance = Math.sqrt(
    Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
  );

  return distance < threshold;
}

/**
 * Find potentially problematic color pairs in a palette
 */
export function findConfusablePairs(
  colors: string[],
  type: ColorBlindnessType,
  threshold = 30
): Array<{ color1: string; color2: string }> {
  const pairs: Array<{ color1: string; color2: string }> = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      if (areColorsConfusable(colors[i], colors[j], type, threshold)) {
        pairs.push({ color1: colors[i], color2: colors[j] });
      }
    }
  }

  return pairs;
}
