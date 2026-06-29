/**
 * Glass Effect Store Initial State
 */

import type { GlassState } from './types';
import type { GlassConfig } from '@/app/(tools)/glassmorphism/types';
import { BACKGROUND_PRESETS } from '@/app/(tools)/glassmorphism/presets';

const DEFAULT_CONFIG: GlassConfig = {
  effectType: 'glassmorphism',
  previewTemplate: 'card',

  // Common
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.18)',
  padding: 24,

  // Glassmorphism / Liquid Glass
  blur: 16,
  opacity: 0.25,
  saturation: 180,
  backgroundColor: '#ffffff',

  // Shadow
  shadowX: 0,
  shadowY: 8,
  shadowBlur: 32,
  shadowSpread: 0,
  shadowColor: '#000000',
  shadowOpacity: 10,

  // Liquid Glass
  innerShadowOpacity: 0,

  // Neumorphism
  neumorphDistance: 8,
  neumorphBlur: 16,
  surfaceColor: '#e0e0e0',
  lightShadowColor: '#ffffff',
  darkShadowColor: '#bebebe',
  neumorphInset: false,

  // Background
  backgroundPreset: BACKGROUND_PRESETS[0].value,
  backgroundImage: '',
};

export const glassInitialState: GlassState = {
  config: DEFAULT_CONFIG,
  exportDialogOpen: false,
  copied: false,
  objectUrl: '',
};
