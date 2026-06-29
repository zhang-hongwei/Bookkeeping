/**
 * Contrast Checker Types
 * Type definitions for color contrast checker
 */

export type WCAGLevel = 'AAA' | 'AA' | 'AAA Large' | 'AA Large';

export interface ContrastResult {
  ratio: number;
  level: WCAGLevel;
  passing: boolean;
  foreground: string;
  background: string;
}

export interface ContrastPreset {
  name: string;
  foreground: string;
  background: string;
  description?: string;
}

export type ContrastExportFormat = 'css' | 'json';
