/**
 * Breakpoint Data Constants
 * Predefined breakpoint presets for popular frameworks
 */

import type { BreakpointPreset } from './types';

export const BREAKPOINT_PRESETS: BreakpointPreset[] = [
  {
    name: 'Tailwind CSS',
    framework: 'tailwind',
    breakpoints: [
      { name: 'xs', minWidth: 0, maxWidth: 639, color: '#ef4444' },
      { name: 'sm', minWidth: 640, maxWidth: 767, color: '#f97316' },
      { name: 'md', minWidth: 768, maxWidth: 1023, color: '#eab308' },
      { name: 'lg', minWidth: 1024, maxWidth: 1279, color: '#22c55e' },
      { name: 'xl', minWidth: 1280, maxWidth: 1535, color: '#3b82f6' },
      { name: '2xl', minWidth: 1536, color: '#8b5cf6' },
    ],
  },
  {
    name: 'Material UI',
    framework: 'mui',
    breakpoints: [
      { name: 'xs', minWidth: 0, maxWidth: 599, color: '#ef4444' },
      { name: 'sm', minWidth: 600, maxWidth: 899, color: '#f97316' },
      { name: 'md', minWidth: 900, maxWidth: 1199, color: '#eab308' },
      { name: 'lg', minWidth: 1200, maxWidth: 1535, color: '#22c55e' },
      { name: 'xl', minWidth: 1536, color: '#3b82f6' },
    ],
  },
  {
    name: 'Bootstrap',
    framework: 'bootstrap',
    breakpoints: [
      { name: 'xs', minWidth: 0, maxWidth: 575, color: '#ef4444' },
      { name: 'sm', minWidth: 576, maxWidth: 767, color: '#f97316' },
      { name: 'md', minWidth: 768, maxWidth: 991, color: '#eab308' },
      { name: 'lg', minWidth: 992, maxWidth: 1199, color: '#22c55e' },
      { name: 'xl', minWidth: 1200, maxWidth: 1399, color: '#3b82f6' },
      { name: 'xxl', minWidth: 1400, color: '#8b5cf6' },
    ],
  },
];

export function getPresetByFramework(framework: string): BreakpointPreset | undefined {
  return BREAKPOINT_PRESETS.find((p) => p.framework === framework);
}

// Common device widths for reference
export const DEVICE_WIDTHS = {
  phones: [320, 375, 414, 428],
  tablets: [768, 834, 1024],
  laptops: [1280, 1366, 1440],
  desktops: [1920, 2560],
};

// Breakpoint colors (auto-assigned)
export const BREAKPOINT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];
