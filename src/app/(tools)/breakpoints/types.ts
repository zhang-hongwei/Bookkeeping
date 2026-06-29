/**
 * Breakpoint Types
 */

export type FrameworkType = 'tailwind' | 'mui' | 'bootstrap' | 'custom';

export interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  color?: string;
}

export interface BreakpointPreset {
  name: string;
  framework: FrameworkType;
  breakpoints: Breakpoint[];
}

export type ExportFormat = 'css' | 'scss' | 'tailwind' | 'json';

export interface BreakpointConfig {
  selectedPreset: FrameworkType;
  customBreakpoints: Breakpoint[];
}
