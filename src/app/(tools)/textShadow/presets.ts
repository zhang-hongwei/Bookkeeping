/**
 * Text Shadow Presets
 * Common text shadow configurations
 */

import type { TextShadowLayer, TextShadowPreset } from './types';

export const TEXT_SHADOW_PRESETS: TextShadowPreset[] = [
  {
    name: 'None',
    description: 'No shadow',
    layers: [],
  },
  {
    name: 'Basic',
    description: 'Simple drop shadow',
    layers: [{ offsetX: 2, offsetY: 2, blur: 4, color: '#000000', opacity: 0.25 }],
  },
  {
    name: 'Soft',
    description: 'Soft blurred shadow',
    layers: [{ offsetX: 0, offsetY: 4, blur: 8, color: '#000000', opacity: 0.15 }],
  },
  {
    name: 'Sharp',
    description: 'Sharp shadow without blur',
    layers: [{ offsetX: 3, offsetY: 3, blur: 0, color: '#000000', opacity: 0.5 }],
  },
  {
    name: 'Outlined',
    description: 'Text outline effect',
    layers: [
      { offsetX: 1, offsetY: 0, blur: 0, color: '#000000', opacity: 1 },
      { offsetX: -1, offsetY: 0, blur: 0, color: '#000000', opacity: 1 },
      { offsetX: 0, offsetY: 1, blur: 0, color: '#000000', opacity: 1 },
      { offsetX: 0, offsetY: -1, blur: 0, color: '#000000', opacity: 1 },
    ],
  },
  {
    name: 'Neon',
    description: 'Neon glow effect',
    layers: [
      { offsetX: 0, offsetY: 0, blur: 10, color: '#00ffff', opacity: 1 },
      { offsetX: 0, offsetY: 0, blur: 20, color: '#00ffff', opacity: 0.5 },
      { offsetX: 0, offsetY: 0, blur: 40, color: '#00ffff', opacity: 0.2 },
    ],
  },
  {
    name: 'Retro',
    description: 'Vintage retro style',
    layers: [
      { offsetX: 2, offsetY: 2, blur: 0, color: '#8b4513', opacity: 1 },
      { offsetX: 4, offsetY: 4, blur: 0, color: '#654321', opacity: 0.8 },
    ],
  },
  {
    name: '3D Effect',
    description: '3D extruded text',
    layers: [
      { offsetX: 1, offsetY: 1, blur: 0, color: '#666666', opacity: 1 },
      { offsetX: 2, offsetY: 2, blur: 0, color: '#555555', opacity: 1 },
      { offsetX: 3, offsetY: 3, blur: 0, color: '#444444', opacity: 1 },
      { offsetX: 4, offsetY: 4, blur: 0, color: '#333333', opacity: 1 },
    ],
  },
  {
    name: 'Long Shadow',
    description: 'Long diagonal shadow',
    layers: Array.from({ length: 10 }, (_, i) => ({
      offsetX: i + 1,
      offsetY: i + 1,
      blur: 0,
      color: '#000000',
      opacity: 0.1 - i * 0.01,
    })),
  },
  {
    name: 'Double',
    description: 'Two-layer shadow',
    layers: [
      { offsetX: 2, offsetY: 2, blur: 2, color: '#ff0000', opacity: 0.3 },
      { offsetX: 4, offsetY: 4, blur: 4, color: '#0000ff', opacity: 0.3 },
    ],
  },
  {
    name: 'Embossed',
    description: 'Embossed text effect',
    layers: [
      { offsetX: 1, offsetY: 1, blur: 0, color: '#ffffff', opacity: 0.8 },
      { offsetX: -1, offsetY: -1, blur: 0, color: '#000000', opacity: 0.3 },
    ],
  },
  {
    name: 'Fire',
    description: 'Fire-like glow',
    layers: [
      { offsetX: 0, offsetY: 0, blur: 10, color: '#ff6600', opacity: 0.8 },
      { offsetX: 0, offsetY: 0, blur: 20, color: '#ff0000', opacity: 0.5 },
      { offsetX: 0, offsetY: 0, blur: 30, color: '#990000', opacity: 0.3 },
    ],
  },
];

export const getPresetByName = (name: string): TextShadowPreset | undefined => {
  return TEXT_SHADOW_PRESETS.find((preset) => preset.name === name);
};
