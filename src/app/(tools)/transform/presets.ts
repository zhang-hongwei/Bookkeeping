/**
 * Transform Presets
 * Common transform configurations
 */

import type { TransformPreset, TransformValues } from './types';

const DEFAULT_VALUES: TransformValues = {
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  skewX: 0,
  skewY: 0,
  perspective: 0,
};

export const TRANSFORM_PRESETS: TransformPreset[] = [
  {
    name: 'None',
    description: 'No transformation',
    values: DEFAULT_VALUES,
  },
  {
    name: 'Rotate 45°',
    description: 'Simple 45 degree rotation',
    values: { ...DEFAULT_VALUES, rotateZ: 45 },
  },
  {
    name: 'Rotate 90°',
    description: '90 degree rotation',
    values: { ...DEFAULT_VALUES, rotateZ: 90 },
  },
  {
    name: 'Rotate 180°',
    description: 'Half rotation',
    values: { ...DEFAULT_VALUES, rotateZ: 180 },
  },
  {
    name: 'Flip Horizontal',
    description: 'Mirror horizontally',
    values: { ...DEFAULT_VALUES, scaleX: -1 },
  },
  {
    name: 'Flip Vertical',
    description: 'Mirror vertically',
    values: { ...DEFAULT_VALUES, scaleY: -1 },
  },
  {
    name: 'Scale Up',
    description: 'Scale to 150%',
    values: { ...DEFAULT_VALUES, scaleX: 1.5, scaleY: 1.5 },
  },
  {
    name: 'Scale Down',
    description: 'Scale to 50%',
    values: { ...DEFAULT_VALUES, scaleX: 0.5, scaleY: 0.5 },
  },
  {
    name: 'Skew X',
    description: 'Horizontal skew effect',
    values: { ...DEFAULT_VALUES, skewX: 20 },
  },
  {
    name: 'Skew Y',
    description: 'Vertical skew effect',
    values: { ...DEFAULT_VALUES, skewY: 20 },
  },
  {
    name: '3D Rotate X',
    description: '3D rotation on X axis',
    values: { ...DEFAULT_VALUES, rotateX: 45, perspective: 1000 },
  },
  {
    name: '3D Rotate Y',
    description: '3D rotation on Y axis',
    values: { ...DEFAULT_VALUES, rotateY: 45, perspective: 1000 },
  },
  {
    name: '3D Card Flip',
    description: 'Card flip effect',
    values: { ...DEFAULT_VALUES, rotateY: 180, perspective: 1000 },
  },
  {
    name: 'Perspective Tilt',
    description: 'Subtle 3D perspective tilt',
    values: { ...DEFAULT_VALUES, rotateX: 10, rotateY: -10, perspective: 800 },
  },
  {
    name: 'Zoom In',
    description: 'Move closer',
    values: { ...DEFAULT_VALUES, translateZ: 100, perspective: 1000 },
  },
];

export const getPresetByName = (name: string): TransformPreset | undefined => {
  return TRANSFORM_PRESETS.find((preset) => preset.name === name);
};
