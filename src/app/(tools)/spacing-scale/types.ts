/**
 * Spacing Scale Types
 */

export type ScaleRatio =
  | 'linear' // base * n
  | 'major-second' // 1.125
  | 'minor-third' // 1.2
  | 'perfect-fourth' // 1.333
  | 'golden-ratio'; // 1.618

export interface RatioInfo {
  type: ScaleRatio;
  name: string;
  value: number;
  description: string;
}

export interface ScaleConfig {
  baseline: number;
  ratio: ScaleRatio;
  steps: number;
  unit: 'px' | 'rem';
}

export interface ScaleStep {
  index: number;
  name: string;
  value: number;
  px: number;
  rem: string;
}

export type ExportFormat = 'css' | 'tailwind' | 'mui' | 'json';

export interface ScalePreset {
  name: string;
  description: string;
  config: ScaleConfig;
}
