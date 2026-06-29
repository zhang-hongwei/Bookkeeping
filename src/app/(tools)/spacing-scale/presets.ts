/**
 * Spacing Scale Presets
 */

import type { ScalePreset } from './types';

export const SPACING_PRESETS: ScalePreset[] = [
  {
    name: '4px Linear',
    description: 'Simple 4px increments',
    config: {
      baseline: 4,
      ratio: 'linear',
      steps: 12,
      unit: 'px',
    },
  },
  {
    name: '8px Standard',
    description: 'Classic 8px grid system',
    config: {
      baseline: 8,
      ratio: 'linear',
      steps: 10,
      unit: 'px',
    },
  },
  {
    name: 'Tailwind Default',
    description: 'Based on 4px with various increments',
    config: {
      baseline: 4,
      ratio: 'linear',
      steps: 12,
      unit: 'rem',
    },
  },
  {
    name: 'Minor Third',
    description: '1.2 ratio for harmonious spacing',
    config: {
      baseline: 8,
      ratio: 'minor-third',
      steps: 8,
      unit: 'px',
    },
  },
  {
    name: 'Golden Ratio',
    description: '1.618 ratio for natural proportions',
    config: {
      baseline: 8,
      ratio: 'golden-ratio',
      steps: 8,
      unit: 'px',
    },
  },
];

export function getPresetByName(name: string): ScalePreset | undefined {
  return SPACING_PRESETS.find((p) => p.name === name);
}
