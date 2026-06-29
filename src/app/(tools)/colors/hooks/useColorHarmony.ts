/**
 * useColorHarmony Hook
 * Color harmony generation for creating harmonious color palettes
 */

import { useMemo, useCallback } from 'react';
import { generateHarmony, generateAllHarmonies, HARMONY_OPTIONS } from '../utils/colorHarmony';
import type { HarmonyType, HarmonyColor, HarmonyOption } from '../types';

interface UseColorHarmonyOptions {
  baseColor: string | null;
  harmonyType: HarmonyType;
}

interface UseColorHarmonyReturn {
  harmonyColors: HarmonyColor[];
  allHarmonies: Record<HarmonyType, HarmonyColor[]>;
  options: HarmonyOption[];
  generate: (color: string, type?: HarmonyType) => HarmonyColor[];
  setBaseColor: (color: string) => void;
  setHarmonyType: (type: HarmonyType) => void;
}

export function useColorHarmony(options: UseColorHarmonyOptions): UseColorHarmonyReturn {
  const { baseColor, harmonyType } = options;

  // Generate harmony colors for current base and type
  const harmonyColors = useMemo(() => {
    if (!baseColor) return [];
    return generateHarmony(baseColor, harmonyType);
  }, [baseColor, harmonyType]);

  // Generate all harmony types for current base color
  const allHarmonies = useMemo(() => {
    if (!baseColor) {
      return {
        complementary: [],
        triadic: [],
        analogous: [],
        'split-complementary': [],
        tetradic: [],
        square: [],
      };
    }
    return generateAllHarmonies(baseColor);
  }, [baseColor]);

  // Generate harmony for a specific color and type
  const generate = useCallback((color: string, type?: HarmonyType): HarmonyColor[] => {
    return generateHarmony(color, type || harmonyType);
  }, [harmonyType]);

  // These are just placeholders - actual state management should be in parent component
  const setBaseColor = useCallback(() => {}, []);
  const setHarmonyType = useCallback(() => {}, []);

  return {
    harmonyColors,
    allHarmonies,
    options: HARMONY_OPTIONS,
    generate,
    setBaseColor,
    setHarmonyType,
  };
}

/**
 * Get harmony option by type
 */
export function getHarmonyOption(type: HarmonyType): HarmonyOption | undefined {
  return HARMONY_OPTIONS.find((opt) => opt.type === type);
}
