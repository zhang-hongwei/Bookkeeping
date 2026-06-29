/**
 * useContrastChecker Hook
 * WCAG contrast checking for color combinations
 */

import { useMemo, useCallback } from 'react';
import { hexToRgb, getLuminance, calculateContrastRatio, getWCAGLevel } from '@/app/(tools)/contrast/utils';
import type { ContrastInfo, WCAGLevel } from '../types';

interface UseContrastCheckerOptions {
  foreground: string;
  background: string;
}

interface UseContrastCheckerReturn {
  ratio: number;
  level: WCAGLevel;
  passing: boolean;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  info: ContrastInfo;
  checkAgainst: (color: string) => ContrastInfo;
}

/**
 * Check contrast between two colors
 */
export function useContrastChecker(options: UseContrastCheckerOptions): UseContrastCheckerReturn {
  const { foreground, background } = options;

  const info = useMemo<ContrastInfo>(() => {
    const ratio = calculateContrastRatio(foreground, background);
    const level = getWCAGLevel(ratio);

    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      passing: level === 'AAA' || level === 'AA',
      foreground,
      background,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }, [foreground, background]);

  const checkAgainst = useCallback((color: string): ContrastInfo => {
    const ratio = calculateContrastRatio(foreground, color);
    const level = getWCAGLevel(ratio);

    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      passing: level === 'AAA' || level === 'AA',
      foreground,
      background: color,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }, [foreground]);

  return {
    ratio: info.ratio,
    level: info.level,
    passing: info.passing,
    aaNormal: info.aaNormal,
    aaLarge: info.aaLarge,
    aaaNormal: info.aaaNormal,
    aaaLarge: info.aaaLarge,
    info,
    checkAgainst,
  };
}

/**
 * Get contrast level badge color
 */
export function getContrastBadgeColor(level: WCAGLevel): 'success' | 'warning' | 'error' {
  if (level === 'AAA' || level === 'AA') return 'success';
  if (level === 'AA Large' || level === 'AAA Large') return 'warning';
  return 'error';
}

/**
 * Get contrast level label with description
 */
export function getContrastLevelDescription(level: WCAGLevel): string {
  switch (level) {
    case 'AAA':
      return 'Enhanced (7:1) - Passes all WCAG levels';
    case 'AA':
      return 'Minimum (4.5:1) - Passes normal text';
    case 'AA Large':
      return 'Large Text Only (3:1) - Passes large text';
    case 'AAA Large':
      return 'Enhanced Large (4.5:1) - Passes large text AAA';
    default:
      return 'Fails WCAG requirements';
  }
}
