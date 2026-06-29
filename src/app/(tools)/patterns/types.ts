/**
 * Background Pattern Types
 */

export type PatternType =
  | 'stripes'
  | 'diagonalStripes'
  | 'grid'
  | 'dots'
  | 'zigzag'
  | 'waves'
  | 'triangles'
  | 'squares'
  | 'circles'
  | 'hexagons';

export interface PatternConfig {
  type: PatternType;
  foreground: string;
  background: string;
  size: number;
  opacity: number;
  strokeWidth?: number;
  rotation?: number;
  spacing?: number;
}

export interface PatternPreset {
  name: string;
  description: string;
  config: PatternConfig;
}

export type PatternExportFormat = 'svg' | 'css' | 'cssGradient' | 'json';
