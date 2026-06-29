/**
 * Border Radius Presets
 * Common border radius configurations
 */

import type { BorderRadiusPreset } from './types';

export const BORDER_RADIUS_PRESETS: BorderRadiusPreset[] = [
  {
    name: 'None',
    description: 'No border radius (sharp corners)',
    values: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
  },
  {
    name: 'Small',
    description: 'Subtle rounded corners',
    values: { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4 },
  },
  {
    name: 'Medium',
    description: 'Standard rounded corners',
    values: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
  },
  {
    name: 'Large',
    description: 'Prominent rounded corners',
    values: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
  },
  {
    name: 'Extra Large',
    description: 'Very rounded corners',
    values: { topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 24 },
  },
  {
    name: 'Pill',
    description: 'Full pill shape',
    values: { topLeft: 999, topRight: 999, bottomRight: 999, bottomLeft: 999 },
  },
  {
    name: 'Circle',
    description: 'Perfect circle (use with square element)',
    values: { topLeft: 50, topRight: 50, bottomRight: 50, bottomLeft: 50 },
  },
  {
    name: 'Top Rounded',
    description: 'Rounded top corners only',
    values: { topLeft: 16, topRight: 16, bottomRight: 0, bottomLeft: 0 },
  },
  {
    name: 'Bottom Rounded',
    description: 'Rounded bottom corners only',
    values: { topLeft: 0, topRight: 0, bottomRight: 16, bottomLeft: 16 },
  },
  {
    name: 'Left Rounded',
    description: 'Rounded left corners only',
    values: { topLeft: 16, topRight: 0, bottomRight: 0, bottomLeft: 16 },
  },
  {
    name: 'Right Rounded',
    description: 'Rounded right corners only',
    values: { topLeft: 0, topRight: 16, bottomRight: 16, bottomLeft: 0 },
  },
  {
    name: 'Asymmetric',
    description: 'Creative asymmetric corners',
    values: { topLeft: 32, topRight: 8, bottomRight: 32, bottomLeft: 8 },
  },
  {
    name: 'Blob Shape',
    description: 'Organic blob-like shape',
    values: { topLeft: 60, topRight: 40, bottomRight: 60, bottomLeft: 40 },
  },
];

export const getPresetByName = (name: string): BorderRadiusPreset | undefined => {
  return BORDER_RADIUS_PRESETS.find((preset) => preset.name === name);
};
