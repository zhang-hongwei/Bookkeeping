/**
 * useColorBlindness Hook
 * Color blindness simulation for accessibility testing
 */

import { useMemo, useCallback } from 'react';
import {
  simulateColorBlindness,
  simulateAllTypes,
  simulatePalette,
  findConfusablePairs,
} from '../utils/colorBlindness';
import type { ColorBlindnessType } from '../types';

interface UseColorBlindnessOptions {
  colors: string[];
  activeType: ColorBlindnessType | null;
  threshold?: number;
}

interface UseColorBlindnessReturn {
  simulatedColors: string[];
  allSimulations: Record<ColorBlindnessType, string[]>;
  confusablePairs: Array<{ color1: string; color2: string }>;
  hasIssues: boolean;
  simulateSingle: (hex: string, type?: ColorBlindnessType) => string;
}

export function useColorBlindness(options: UseColorBlindnessOptions): UseColorBlindnessReturn {
  const { colors, activeType, threshold = 30 } = options;

  // Simulate colors for active type
  const simulatedColors = useMemo(() => {
    if (!activeType) return colors;
    return simulatePalette(colors, activeType);
  }, [colors, activeType]);

  // Simulate for all types
  const allSimulations = useMemo(() => {
    const result: Record<ColorBlindnessType, string[]> = {
      protanopia: [],
      deuteranopia: [],
      tritanopia: [],
      achromatopsia: [],
    };

    if (colors.length === 0) return result;

    for (const type of Object.keys(result) as ColorBlindnessType[]) {
      result[type] = simulatePalette(colors, type);
    }

    return result;
  }, [colors]);

  // Find confusable pairs
  const confusablePairs = useMemo(() => {
    if (!activeType || colors.length < 2) return [];
    return findConfusablePairs(colors, activeType, threshold);
  }, [colors, activeType, threshold]);

  // Check if there are accessibility issues
  const hasIssues = confusablePairs.length > 0;

  // Simulate single color
  const simulateSingle = useCallback((hex: string, type?: ColorBlindnessType): string => {
    return simulateColorBlindness(hex, type || activeType || 'protanopia');
  }, [activeType]);

  return {
    simulatedColors,
    allSimulations,
    confusablePairs,
    hasIssues,
    simulateSingle,
  };
}

/**
 * Hook for single color blindness simulation
 */
export function useSingleColorBlindness(hex: string) {
  const simulations = useMemo(() => simulateAllTypes(hex), [hex]);

  return {
    original: hex,
    protanopia: simulations.protanopia,
    deuteranopia: simulations.deuteranopia,
    tritanopia: simulations.tritanopia,
    achromatopsia: simulations.achromatopsia,
  };
}
