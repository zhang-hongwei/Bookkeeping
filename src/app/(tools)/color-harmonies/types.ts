/**
 * Color Harmonies Types
 */

export type HarmonyType =
  | 'complementary'     // 2 colors, 180° apart
  | 'triadic'           // 3 colors, 120° apart
  | 'tetradic'          // 4 colors, 90° apart (square)
  | 'analogous'         // 3-5 colors, 30° apart
  | 'split-complementary' // 3 colors: base + 2 colors adjacent to complement
  | 'compound';         // 4 colors: base + complement + 2 analogous

export interface HarmonyInfo {
  type: HarmonyType;
  name: string;
  description: string;
  colorCount: number;
}

export interface HarmonyResult {
  type: HarmonyType;
  baseColor: string;
  colors: string[];
  labels: string[];
}

export type ExportFormat = 'css' | 'json' | 'tailwind' | 'scss';

export interface ColorHarmonyState {
  baseColor: string;
  harmonyType: HarmonyType;
  saturation: number;
  lightness: number;
}
