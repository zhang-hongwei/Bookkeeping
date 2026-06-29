/**
 * Box Shadow Presets
 * Common shadow preset configurations
 */

import { ShadowPreset } from './types';

/**
 * Preset shadow template collection
 */
export const shadowPresets: ShadowPreset[] = [
  {
    name: 'None',
    description: 'Remove all shadow effects',
    layers: [],
  },
  {
    name: 'Subtle',
    description: 'Light floating effect for cards, buttons',
    layers: [
      {
        offsetX: 0,
        offsetY: 1,
        blur: 3,
        spread: 0,
        color: '#000000',
        opacity: 0.12,
        inset: false,
      },
      {
        offsetX: 0,
        offsetY: 1,
        blur: 2,
        spread: 0,
        color: '#000000',
        opacity: 0.24,
        inset: false,
      },
    ],
  },
  {
    name: 'Standard Card',
    description: 'Material Design style card shadow',
    layers: [
      {
        offsetX: 0,
        offsetY: 2,
        blur: 4,
        spread: -1,
        color: '#000000',
        opacity: 0.2,
        inset: false,
      },
      {
        offsetX: 0,
        offsetY: 4,
        blur: 5,
        spread: 0,
        color: '#000000',
        opacity: 0.14,
        inset: false,
      },
      {
        offsetX: 0,
        offsetY: 1,
        blur: 10,
        spread: 0,
        color: '#000000',
        opacity: 0.12,
        inset: false,
      },
    ],
  },
  {
    name: 'Medium Elevation',
    description: 'For floating menus, dialogs',
    layers: [
      {
        offsetX: 0,
        offsetY: 8,
        blur: 16,
        spread: -4,
        color: '#000000',
        opacity: 0.15,
        inset: false,
      },
      {
        offsetX: 0,
        offsetY: 4,
        blur: 8,
        spread: 0,
        color: '#000000',
        opacity: 0.1,
        inset: false,
      },
    ],
  },
  {
    name: 'High Elevation',
    description: 'For modals, drawers and high-level components',
    layers: [
      {
        offsetX: 0,
        offsetY: 12,
        blur: 24,
        spread: -8,
        color: '#000000',
        opacity: 0.2,
        inset: false,
      },
      {
        offsetX: 0,
        offsetY: 8,
        blur: 16,
        spread: 0,
        color: '#000000',
        opacity: 0.14,
        inset: false,
      },
    ],
  },
  {
    name: 'Inset',
    description: 'Inner shadow for inputs, sunken areas',
    layers: [
      {
        offsetX: 0,
        offsetY: 2,
        blur: 4,
        spread: 0,
        color: '#000000',
        opacity: 0.1,
        inset: true,
      },
    ],
  },
  {
    name: 'Soft Diffused',
    description: 'Large soft shadow for primary action buttons',
    layers: [
      {
        offsetX: 0,
        offsetY: 4,
        blur: 20,
        spread: 0,
        color: '#000000',
        opacity: 0.08,
        inset: false,
      },
      {
        offsetX: 0,
        offsetY: 8,
        blur: 40,
        spread: 0,
        color: '#000000',
        opacity: 0.06,
        inset: false,
      },
    ],
  },
  {
    name: 'Colored Shadow',
    description: 'Shadow with color effect',
    layers: [
      {
        offsetX: 0,
        offsetY: 4,
        blur: 16,
        spread: 0,
        color: '#3B82F6',
        opacity: 0.3,
        inset: false,
      },
      {
        offsetX: 0,
        offsetY: 8,
        blur: 24,
        spread: 0,
        color: '#3B82F6',
        opacity: 0.15,
        inset: false,
      },
    ],
  },
  {
    name: 'Neumorphism',
    description: 'Neumorphic style (dual inner/outer shadows)',
    layers: [
      {
        offsetX: -8,
        offsetY: -8,
        blur: 16,
        spread: 0,
        color: '#FFFFFF',
        opacity: 0.7,
        inset: false,
      },
      {
        offsetX: 8,
        offsetY: 8,
        blur: 16,
        spread: 0,
        color: '#000000',
        opacity: 0.1,
        inset: false,
      },
    ],
  },
  {
    name: 'Bottom Emphasis',
    description: 'Shadow only at bottom, for navigation bars',
    layers: [
      {
        offsetX: 0,
        offsetY: 4,
        blur: 8,
        spread: -2,
        color: '#000000',
        opacity: 0.1,
        inset: false,
      },
    ],
  },
];

/**
 * Get preset by name
 * @param name - Preset name
 * @returns Preset configuration, or undefined if not found
 */
export function getPresetByName(name: string): ShadowPreset | undefined {
  return shadowPresets.find(preset => preset.name === name);
}

/**
 * Get all preset names
 * @returns Array of preset names
 */
export function getPresetNames(): string[] {
  return shadowPresets.map(preset => preset.name);
}
