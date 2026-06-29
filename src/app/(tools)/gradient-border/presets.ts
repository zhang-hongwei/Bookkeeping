/**
 * Gradient Border Presets
 * Common gradient border configurations
 */

import type { GradientBorderPreset, BorderImageOptions } from './types';

const defaultBorderImage: BorderImageOptions = {
  sourceMode: 'gradient',
  imageUrl: '',
  slice: '1',
  sliceFill: false,
  width: '1',
  outset: '0',
  repeat: 'stretch',
};

let idCounter = 0;
const stop = (color: string, position: number, opacity: number = 100) => ({
  id: `stop-${++idCounter}`,
  color,
  opacity,
  position,
});

export const GRADIENT_BORDER_PRESETS: GradientBorderPreset[] = [
  {
    name: 'Sunset Glow',
    description: 'Warm sunset gradient border',
    config: {
      colorStops: [stop('#ff6b6b', 0), stop('#ffa500', 50), stop('#ffd93d', 100)],
      gradientType: 'linear',
      angle: 135,
      borderWidth: 3,
      borderRadius: 16,

      implementation: 'background-clip',
      borderImageOptions: { ...defaultBorderImage },
    },
  },
  {
    name: 'Ocean Blue',
    description: 'Cool ocean-inspired gradient',
    config: {
      colorStops: [stop('#667eea', 0), stop('#764ba2', 100)],
      gradientType: 'linear',
      angle: 135,
      borderWidth: 3,
      borderRadius: 12,

      implementation: 'background-clip',
      borderImageOptions: { ...defaultBorderImage },
    },
  },
  {
    name: 'Neon Pulse',
    description: 'Vibrant neon glow effect',
    config: {
      colorStops: [stop('#00f5a0', 0), stop('#00d9f5', 100)],
      gradientType: 'linear',
      angle: 90,
      borderWidth: 4,
      borderRadius: 8,

      implementation: 'background-clip',
      borderImageOptions: { ...defaultBorderImage },
    },
  },
  {
    name: 'Fire Edge',
    description: 'Hot fire gradient border',
    config: {
      colorStops: [stop('#f12711', 0), stop('#f5af19', 100)],
      gradientType: 'linear',
      angle: 0,
      borderWidth: 3,
      borderRadius: 12,

      implementation: 'background-clip',
      borderImageOptions: { ...defaultBorderImage },
    },
  },
  {
    name: 'Purple Dream',
    description: 'Ethereal purple gradient',
    config: {
      colorStops: [stop('#a855f7', 0), stop('#ec4899', 50), stop('#6366f1', 100)],
      gradientType: 'linear',
      angle: 180,
      borderWidth: 3,
      borderRadius: 16,

      implementation: 'background-clip',
      borderImageOptions: { ...defaultBorderImage },
    },
  },
  {
    name: 'Rainbow Ring',
    description: 'Full rainbow conic gradient',
    config: {
      colorStops: [
        stop('#ff0000', 0),
        stop('#ff8800', 17),
        stop('#ffff00', 33),
        stop('#00ff00', 50),
        stop('#0088ff', 67),
        stop('#8800ff', 83),
        stop('#ff0000', 100),
      ],
      gradientType: 'conic',
      angle: 0,
      borderWidth: 4,
      borderRadius: 50,

      implementation: 'pseudo-element',
      borderImageOptions: { ...defaultBorderImage },
    },
  },
  {
    name: 'Aurora',
    description: 'Northern lights radial effect',
    config: {
      colorStops: [stop('#43e97b', 0), stop('#38f9d7', 50), stop('#667eea', 100)],
      gradientType: 'radial',
      angle: 0,
      borderWidth: 3,
      borderRadius: 20,

      implementation: 'pseudo-element',
      borderImageOptions: { ...defaultBorderImage },
    },
  },
  {
    name: 'Thin Elegant',
    description: 'Minimal thin gradient border',
    config: {
      colorStops: [stop('#e0e0e0', 0), stop('#667eea', 50), stop('#e0e0e0', 100)],
      gradientType: 'linear',
      angle: 90,
      borderWidth: 1,
      borderRadius: 8,

      implementation: 'border-image',
      borderImageOptions: { ...defaultBorderImage, slice: '30', repeat: 'round' },
    },
  },
  {
    name: 'Semi-transparent',
    description: 'Gradient with transparent edges',
    config: {
      colorStops: [stop('#6366f1', 0, 40), stop('#ec4899', 50), stop('#6366f1', 100, 40)],
      gradientType: 'linear',
      angle: 135,
      borderWidth: 3,
      borderRadius: 16,

      implementation: 'background-clip',
      borderImageOptions: { ...defaultBorderImage },
    },
  },
];

export const getPresetByName = (name: string): GradientBorderPreset | undefined => {
  return GRADIENT_BORDER_PRESETS.find((preset) => preset.name === name);
};
