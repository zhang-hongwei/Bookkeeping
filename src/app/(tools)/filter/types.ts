/**
 * CSS Filter Types
 * Type definitions for filter generator
 */

export interface FilterValues {
  blur: number; // px
  brightness: number; // 0-200%
  contrast: number; // 0-200%
  saturate: number; // 0-200%
  grayscale: number; // 0-100%
  sepia: number; // 0-100%
  hueRotate: number; // 0-360deg
  invert: number; // 0-100%
  opacity: number; // 0-100%
  dropShadow: {
    enabled: boolean;
    x: number;
    y: number;
    blur: number;
    color: string;
  };
}

export interface FilterPreset {
  name: string;
  description: string;
  values: Partial<FilterValues>;
}

export type FilterExportFormat = 'css' | 'scss' | 'tailwind' | 'json';
