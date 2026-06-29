/**
 * Easing Curve Types
 */

export interface EasingPoint {
  x: number; // 0-1
  y: number; // 0-1
}

export interface EasingConfig {
  name: string;
  p1: EasingPoint;
  p2: EasingPoint;
}

export interface EasingPreset {
  name: string;
  description: string;
  config: EasingConfig;
  cssValue: string;
}

export type EasingExportFormat = 'css' | 'scss' | 'tailwind' | 'json';
