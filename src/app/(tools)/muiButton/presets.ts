import type { ButtonThemePreset } from './types';
import { MUI_DEFAULTS } from './types';

export const BUTTON_THEME_PRESETS: ButtonThemePreset[] = [
  {
    name: 'MUI Default',
    description: 'Standard Material Design button tokens',
    config: { ...MUI_DEFAULTS },
  },
  {
    name: 'Soft Rounded',
    description: 'Rounded corners, no uppercase, relaxed spacing',
    config: {
      root: { borderRadius: 8, textTransform: 'none', fontWeight: 500, minWidth: 64, letterSpacing: 'normal' },
      small: { containedPadding: '6px 14px', outlinedPadding: '5px 13px', textPadding: '6px 10px', fontSize: '0.8125rem', iconSize: 16 },
      medium: { containedPadding: '8px 20px', outlinedPadding: '7px 19px', textPadding: '8px 14px', fontSize: '0.875rem', iconSize: 20 },
      large: { containedPadding: '10px 28px', outlinedPadding: '9px 27px', textPadding: '10px 18px', fontSize: '1rem', iconSize: 24 },
      elevation: { boxShadow: '0 1px 3px rgba(0,0,0,0.12)', hoverBoxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    },
  },
  {
    name: 'Pill',
    description: 'Fully rounded pill-shaped buttons',
    config: {
      root: { borderRadius: 999, textTransform: 'none', fontWeight: 600, minWidth: 48, letterSpacing: '0.02em' },
      small: { containedPadding: '5px 16px', outlinedPadding: '4px 15px', textPadding: '5px 12px', fontSize: '0.75rem', iconSize: 16 },
      medium: { containedPadding: '8px 24px', outlinedPadding: '7px 23px', textPadding: '8px 16px', fontSize: '0.875rem', iconSize: 20 },
      large: { containedPadding: '10px 32px', outlinedPadding: '9px 31px', textPadding: '10px 20px', fontSize: '1rem', iconSize: 22 },
      elevation: { boxShadow: 'none', hoverBoxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
    },
  },
  {
    name: 'Compact',
    description: 'Tight spacing for dense UIs',
    config: {
      root: { borderRadius: 4, textTransform: 'none', fontWeight: 500, minWidth: 32, letterSpacing: 'normal' },
      small: { containedPadding: '2px 6px', outlinedPadding: '1px 5px', textPadding: '2px 4px', fontSize: '0.75rem', iconSize: 14 },
      medium: { containedPadding: '4px 10px', outlinedPadding: '3px 9px', textPadding: '4px 6px', fontSize: '0.8125rem', iconSize: 16 },
      large: { containedPadding: '6px 16px', outlinedPadding: '5px 15px', textPadding: '6px 10px', fontSize: '0.875rem', iconSize: 20 },
      elevation: { boxShadow: '0 1px 2px rgba(0,0,0,0.1)', hoverBoxShadow: '0 2px 4px rgba(0,0,0,0.15)' },
    },
  },
  {
    name: 'Large Touch',
    description: 'Generous spacing for touch-friendly interfaces',
    config: {
      root: { borderRadius: 12, textTransform: 'none', fontWeight: 600, minWidth: 80, letterSpacing: '0.01em' },
      small: { containedPadding: '10px 20px', outlinedPadding: '9px 19px', textPadding: '10px 16px', fontSize: '0.875rem', iconSize: 20 },
      medium: { containedPadding: '14px 28px', outlinedPadding: '13px 27px', textPadding: '14px 22px', fontSize: '1rem', iconSize: 24 },
      large: { containedPadding: '18px 36px', outlinedPadding: '17px 35px', textPadding: '18px 28px', fontSize: '1.125rem', iconSize: 28 },
      elevation: { boxShadow: '0 2px 6px rgba(0,0,0,0.12)', hoverBoxShadow: '0 6px 16px rgba(0,0,0,0.18)' },
    },
  },
  {
    name: 'Sharp',
    description: 'No border radius, angular style',
    config: {
      root: { borderRadius: 0, textTransform: 'uppercase', fontWeight: 700, minWidth: 64, letterSpacing: '0.05em' },
      small: { containedPadding: '4px 10px', outlinedPadding: '3px 9px', textPadding: '4px 5px', fontSize: '0.75rem', iconSize: 16 },
      medium: { containedPadding: '6px 16px', outlinedPadding: '5px 15px', textPadding: '6px 8px', fontSize: '0.875rem', iconSize: 20 },
      large: { containedPadding: '8px 22px', outlinedPadding: '7px 21px', textPadding: '8px 11px', fontSize: '1rem', iconSize: 22 },
      elevation: { boxShadow: '0 2px 4px rgba(0,0,0,0.2)', hoverBoxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
    },
  },
  {
    name: 'Subtle',
    description: 'Lightweight, minimal visual weight',
    config: {
      root: { borderRadius: 6, textTransform: 'none', fontWeight: 400, minWidth: 48, letterSpacing: 'normal' },
      small: { containedPadding: '4px 12px', outlinedPadding: '3px 11px', textPadding: '4px 8px', fontSize: '0.8125rem', iconSize: 16 },
      medium: { containedPadding: '6px 18px', outlinedPadding: '5px 17px', textPadding: '6px 12px', fontSize: '0.875rem', iconSize: 18 },
      large: { containedPadding: '8px 24px', outlinedPadding: '7px 23px', textPadding: '8px 16px', fontSize: '0.9375rem', iconSize: 20 },
      elevation: { boxShadow: 'none', hoverBoxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    },
  },
];

export const getPresetByName = (name: string): ButtonThemePreset | undefined => {
  return BUTTON_THEME_PRESETS.find((p) => p.name === name);
};
