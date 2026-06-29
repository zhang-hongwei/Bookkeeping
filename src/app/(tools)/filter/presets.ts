/**
 * Filter Presets
 * Popular Instagram-like filter effects
 */

import type { FilterPreset } from './types';

export const FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'None',
    description: 'No filter applied',
    values: {},
  },
  {
    name: 'Grayscale',
    description: 'Black and white effect',
    values: { grayscale: 100 },
  },
  {
    name: 'Sepia',
    description: 'Vintage brown tone',
    values: { sepia: 100 },
  },
  {
    name: 'Blur',
    description: 'Gaussian blur effect',
    values: { blur: 8 },
  },
  {
    name: 'Brightness Up',
    description: 'Increase brightness',
    values: { brightness: 150 },
  },
  {
    name: 'Brightness Down',
    description: 'Decrease brightness',
    values: { brightness: 70 },
  },
  {
    name: 'High Contrast',
    description: 'Enhanced contrast',
    values: { contrast: 150 },
  },
  {
    name: 'Low Contrast',
    description: 'Muted contrast',
    values: { contrast: 70 },
  },
  {
    name: 'Saturate',
    description: 'Vivid colors',
    values: { saturate: 200 },
  },
  {
    name: 'Desaturate',
    description: 'Muted colors',
    values: { saturate: 50 },
  },
  {
    name: 'Invert',
    description: 'Color inversion',
    values: { invert: 100 },
  },
  {
    name: 'Hue Rotate 90°',
    description: 'Shift colors by 90 degrees',
    values: { hueRotate: 90 },
  },
  {
    name: 'Hue Rotate 180°',
    description: 'Shift colors by 180 degrees',
    values: { hueRotate: 180 },
  },
  {
    name: 'Hue Rotate 270°',
    description: 'Shift colors by 270 degrees',
    values: { hueRotate: 270 },
  },
  {
    name: 'Vintage',
    description: 'Nostalgic vintage look',
    values: { sepia: 40, contrast: 90, brightness: 90, saturate: 80 },
  },
  {
    name: 'Cool',
    description: 'Cool blue tones',
    values: { hueRotate: 180, saturate: 80, brightness: 95 },
  },
  {
    name: 'Warm',
    description: 'Warm orange tones',
    values: { sepia: 30, saturate: 120, brightness: 105 },
  },
  {
    name: 'Dramatic',
    description: 'High contrast dramatic effect',
    values: { contrast: 150, brightness: 90, saturate: 120 },
  },
  {
    name: 'Fade',
    description: 'Soft faded look',
    values: { contrast: 80, brightness: 110, saturate: 70 },
  },
  {
    name: 'Noir',
    description: 'Classic black and white film look',
    values: { grayscale: 100, contrast: 120, brightness: 90 },
  },
];

export const getPresetByName = (name: string): FilterPreset | undefined => {
  return FILTER_PRESETS.find((preset) => preset.name === name);
};
