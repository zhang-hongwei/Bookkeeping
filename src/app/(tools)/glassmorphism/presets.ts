/**
 * Glass Effect Presets
 * Popular configurations for glassmorphism, liquid glass, and neumorphism
 */

import type { GlassPreset, BackgroundOption } from './types';

// ─── Glassmorphism Presets ─────────────────────────────────────────────

const GLASSMORPHISM_PRESETS: GlassPreset[] = [
  {
    name: 'Classic Glass',
    description: 'iOS-style frosted glass',
    effectType: 'glassmorphism',
    config: {
      blur: 16,
      opacity: 0.25,
      saturation: 180,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      borderRadius: 16,
      shadowX: 0,
      shadowY: 8,
      shadowBlur: 32,
      shadowSpread: 0,
      shadowColor: '#000000',
      shadowOpacity: 10,
    },
  },
  {
    name: 'Dark Glass',
    description: 'Elegant dark mode glass',
    effectType: 'glassmorphism',
    config: {
      blur: 20,
      opacity: 0.1,
      saturation: 100,
      backgroundColor: '#000000',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      shadowX: 0,
      shadowY: 4,
      shadowBlur: 24,
      shadowSpread: 0,
      shadowColor: '#000000',
      shadowOpacity: 25,
    },
  },
  {
    name: 'Frosted',
    description: 'Heavy blur with low opacity',
    effectType: 'glassmorphism',
    config: {
      blur: 32,
      opacity: 0.15,
      saturation: 200,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
      borderRadius: 12,
      shadowX: 0,
      shadowY: 12,
      shadowBlur: 40,
      shadowSpread: 0,
      shadowColor: '#000000',
      shadowOpacity: 8,
    },
  },
  {
    name: 'Crystal Clear',
    description: 'Minimal blur, high transparency',
    effectType: 'glassmorphism',
    config: {
      blur: 8,
      opacity: 0.35,
      saturation: 150,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
      borderRadius: 24,
      shadowX: 0,
      shadowY: 4,
      shadowBlur: 16,
      shadowSpread: 0,
      shadowColor: '#000000',
      shadowOpacity: 6,
    },
  },
  {
    name: 'Neon Glow',
    description: 'Vibrant colored glass with glow',
    effectType: 'glassmorphism',
    config: {
      blur: 12,
      opacity: 0.2,
      saturation: 200,
      backgroundColor: '#8b5cf6',
      borderWidth: 2,
      borderColor: 'rgba(139, 92, 246, 0.5)',
      borderRadius: 16,
      shadowX: 0,
      shadowY: 0,
      shadowBlur: 24,
      shadowSpread: 2,
      shadowColor: '#8b5cf6',
      shadowOpacity: 40,
    },
  },
  {
    name: 'Windows 11',
    description: 'Mica-style material effect',
    effectType: 'glassmorphism',
    config: {
      blur: 24,
      opacity: 0.7,
      saturation: 120,
      backgroundColor: '#f3f3f3',
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: 8,
      shadowX: 0,
      shadowY: 2,
      shadowBlur: 8,
      shadowSpread: 0,
      shadowColor: '#000000',
      shadowOpacity: 8,
    },
  },
];

// ─── Liquid Glass Presets ──────────────────────────────────────────────

const LIQUID_GLASS_PRESETS: GlassPreset[] = [
  {
    name: 'Apple Vision Pro',
    description: 'Vision Pro-inspired glossy glass',
    effectType: 'liquidGlass',
    config: {
      blur: 40,
      opacity: 0.3,
      saturation: 180,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.35)',
      borderRadius: 24,
      shadowX: 0,
      shadowY: 8,
      shadowBlur: 32,
      shadowSpread: 0,
      shadowColor: '#000000',
      shadowOpacity: 12,
      innerShadowOpacity: 40,
    },
  },
  {
    name: 'iOS Notification',
    description: 'iOS notification card style',
    effectType: 'liquidGlass',
    config: {
      blur: 28,
      opacity: 0.25,
      saturation: 170,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 20,
      shadowX: 0,
      shadowY: 6,
      shadowBlur: 24,
      shadowSpread: 0,
      shadowColor: '#000000',
      shadowOpacity: 10,
      innerShadowOpacity: 35,
    },
  },
  {
    name: 'macOS Window',
    description: 'macOS window chrome effect',
    effectType: 'liquidGlass',
    config: {
      blur: 32,
      opacity: 0.45,
      saturation: 150,
      backgroundColor: '#f5f5f7',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      shadowX: 0,
      shadowY: 12,
      shadowBlur: 40,
      shadowSpread: 2,
      shadowColor: '#000000',
      shadowOpacity: 15,
      innerShadowOpacity: 50,
    },
  },
  {
    name: 'Aurora Glass',
    description: 'Colorful iridescent glass',
    effectType: 'liquidGlass',
    config: {
      blur: 20,
      opacity: 0.2,
      saturation: 200,
      backgroundColor: '#a78bfa',
      borderWidth: 1,
      borderColor: 'rgba(167, 139, 250, 0.3)',
      borderRadius: 28,
      shadowX: 0,
      shadowY: 4,
      shadowBlur: 20,
      shadowSpread: 1,
      shadowColor: '#7c3aed',
      shadowOpacity: 25,
      innerShadowOpacity: 45,
    },
  },
];

// ─── Neumorphism Presets ───────────────────────────────────────────────

const NEUMORPHISM_PRESETS: GlassPreset[] = [
  {
    name: 'Soft Raised',
    description: 'Gentle raised effect on light surface',
    effectType: 'neumorphism',
    config: {
      borderRadius: 16,
      borderWidth: 0,
      borderColor: 'transparent',
      surfaceColor: '#e0e0e0',
      neumorphDistance: 8,
      neumorphBlur: 16,
      lightShadowColor: '#ffffff',
      darkShadowColor: '#bebebe',
      neumorphInset: false,
    },
  },
  {
    name: 'Pressed',
    description: 'Inset/pressed effect',
    effectType: 'neumorphism',
    config: {
      borderRadius: 16,
      borderWidth: 0,
      borderColor: 'transparent',
      surfaceColor: '#e0e0e0',
      neumorphDistance: 6,
      neumorphBlur: 12,
      lightShadowColor: '#ffffff',
      darkShadowColor: '#bebebe',
      neumorphInset: true,
    },
  },
  {
    name: 'Dark Soft',
    description: 'Neumorphism on dark surface',
    effectType: 'neumorphism',
    config: {
      borderRadius: 20,
      borderWidth: 0,
      borderColor: 'transparent',
      surfaceColor: '#2d2d2d',
      neumorphDistance: 8,
      neumorphBlur: 16,
      lightShadowColor: '#3a3a3a',
      darkShadowColor: '#202020',
      neumorphInset: false,
    },
  },
  {
    name: 'Subtle',
    description: 'Minimal depth neumorphism',
    effectType: 'neumorphism',
    config: {
      borderRadius: 12,
      borderWidth: 0,
      borderColor: 'transparent',
      surfaceColor: '#e8e8e8',
      neumorphDistance: 4,
      neumorphBlur: 8,
      lightShadowColor: '#ffffff',
      darkShadowColor: '#d0d0d0',
      neumorphInset: false,
    },
  },
  {
    name: 'Bold',
    description: 'Strong depth effect',
    effectType: 'neumorphism',
    config: {
      borderRadius: 24,
      borderWidth: 0,
      borderColor: 'transparent',
      surfaceColor: '#e0e0e0',
      neumorphDistance: 12,
      neumorphBlur: 24,
      lightShadowColor: '#ffffff',
      darkShadowColor: '#b0b0b0',
      neumorphInset: false,
    },
  },
];

// ─── Combined Presets ──────────────────────────────────────────────────

export const GLASS_PRESETS: GlassPreset[] = [
  ...GLASSMORPHISM_PRESETS,
  ...LIQUID_GLASS_PRESETS,
  ...NEUMORPHISM_PRESETS,
];

export const getPresetsByType = (effectType: GlassPreset['effectType']): GlassPreset[] =>
  GLASS_PRESETS.filter((p) => p.effectType === effectType);

export const getPresetByName = (name: string): GlassPreset | undefined =>
  GLASS_PRESETS.find((p) => p.name === name);

// ─── Background Options ────────────────────────────────────────────────

export const BACKGROUND_PRESETS: BackgroundOption[] = [
  { name: 'Purple Dream', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f72585 0%, #b5179e 33%, #7209b7 66%, #560bad 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #95d5b2 100%)' },
  { name: 'Dark Night', value: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)' },
  { name: 'Rainbow', value: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)' },
  { name: 'Warm', value: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)' },
  { name: 'Cool Mint', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #00c9ff 0%, #92fe9d 50%, #f9d423 100%)' },
  { name: 'Deep Space', value: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%)' },
  { name: 'Cherry', value: 'linear-gradient(135deg, #eb4559 0%, #f78ca0 50%, #ffc3a0 100%)' },
  { name: 'Mint', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
];
