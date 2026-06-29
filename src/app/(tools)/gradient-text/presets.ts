/**
 * Gradient Text Presets
 */

import type { GradientTextPreset } from './types';
import { createColorStop } from './utils';

export const gradientTextPresets: GradientTextPreset[] = [
  {
    name: 'Sunset Glow',
    description: 'Warm orange to pink gradient',
    config: {
      colorStops: [
        { ...createColorStop('#f97316', 0), position: 0 },
        { ...createColorStop('#ec4899', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 135,
    },
  },
  {
    name: 'Ocean Blue',
    description: 'Deep blue to cyan gradient',
    config: {
      colorStops: [
        { ...createColorStop('#1e3a8a', 0), position: 0 },
        { ...createColorStop('#06b6d4', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 90,
    },
  },
  {
    name: 'Purple Dream',
    description: 'Purple to pink fantasy gradient',
    config: {
      colorStops: [
        { ...createColorStop('#7c3aed', 0), position: 0 },
        { ...createColorStop('#db2777', 0), position: 50 },
        { ...createColorStop('#f59e0b', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 135,
    },
  },
  {
    name: 'Emerald',
    description: 'Green to teal gradient',
    config: {
      colorStops: [
        { ...createColorStop('#10b981', 0), position: 0 },
        { ...createColorStop('#0d9488', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 90,
    },
  },
  {
    name: 'Rainbow',
    description: 'Full rainbow spectrum',
    config: {
      colorStops: [
        { ...createColorStop('#ef4444', 0), position: 0 },
        { ...createColorStop('#f97316', 0), position: 17 },
        { ...createColorStop('#eab308', 0), position: 33 },
        { ...createColorStop('#22c55e', 0), position: 50 },
        { ...createColorStop('#3b82f6', 0), position: 67 },
        { ...createColorStop('#8b5cf6', 0), position: 83 },
        { ...createColorStop('#ec4899', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 90,
    },
  },
  {
    name: 'Fire',
    description: 'Red to yellow hot gradient',
    config: {
      colorStops: [
        { ...createColorStop('#dc2626', 0), position: 0 },
        { ...createColorStop('#f97316', 0), position: 50 },
        { ...createColorStop('#fbbf24', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 0,
    },
  },
  {
    name: 'Neon',
    description: 'Bright neon pink to cyan',
    config: {
      colorStops: [
        { ...createColorStop('#f0abfc', 0), position: 0 },
        { ...createColorStop('#22d3ee', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 90,
    },
  },
  {
    name: 'Midnight',
    description: 'Dark blue to purple night sky',
    config: {
      colorStops: [
        { ...createColorStop('#1e1b4b', 0), position: 0 },
        { ...createColorStop('#581c87', 0), position: 50 },
        { ...createColorStop('#1e1b4b', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 135,
    },
  },
  {
    name: 'Gold',
    description: 'Rich golden gradient',
    config: {
      colorStops: [
        { ...createColorStop('#b45309', 0), position: 0 },
        { ...createColorStop('#f59e0b', 0), position: 50 },
        { ...createColorStop('#fde68a', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 135,
    },
  },
  {
    name: 'Cotton Candy',
    description: 'Soft pink and blue',
    config: {
      colorStops: [
        { ...createColorStop('#fda4af', 0), position: 0 },
        { ...createColorStop('#c4b5fd', 0), position: 100 },
      ],
      gradientType: 'linear',
      angle: 90,
    },
  },
];

export const getPresetByName = (name: string): GradientTextPreset | undefined =>
  gradientTextPresets.find((p) => p.name === name);
