import type { OklchColour } from '../../types/gradient';
import type { GradientType, WarpShape } from '../../types/gradient';

export interface StylePresetConfig {
  type: GradientType;
  warpShape: WarpShape;
  warp: number;
  warpSize: number;
  noise: number;
  colors: OklchColour[];
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  category: 'apple' | 'stripe' | 'custom';
  config: StylePresetConfig;
}

// Apple style: Smooth, fluid, subtle mesh gradients
// Characterized by soft transitions and minimal noise
const APPLE_COLORS: OklchColour[] = [
  { l: 0.95, c: 0.05, h: 220, a: 1 },  // Soft blue-white
  { l: 0.88, c: 0.08, h: 280, a: 1 },  // Lavender
  { l: 0.92, c: 0.06, h: 200, a: 1 },  // Pale cyan
  { l: 0.90, c: 0.04, h: 180, a: 1 },  // Mint white
];

// Stripe style: Bold, organic, rich gradients
// Characterized by domain warping and vibrant colors
const STRIPE_COLORS: OklchColour[] = [
  { l: 0.65, c: 0.20, h: 20, a: 1 },   // Coral orange
  { l: 0.60, c: 0.22, h: 340, a: 1 },  // Magenta pink
  { l: 0.70, c: 0.18, h: 260, a: 1 },  // Purple blue
  { l: 0.75, c: 0.15, h: 200, a: 1 },  // Sky blue
];

// Apple Aurora: Northern lights inspired
const APPLE_AURORA_COLORS: OklchColour[] = [
  { l: 0.90, c: 0.08, h: 160, a: 1 },  // Green teal
  { l: 0.88, c: 0.10, h: 200, a: 1 },  // Cyan
  { l: 0.92, c: 0.06, h: 240, a: 1 },  // Periwinkle
  { l: 0.95, c: 0.04, h: 280, a: 1 },  // Lavender
];

// Stripe Sunset: Warm flowing gradient
const STRIPE_SUNSET_COLORS: OklchColour[] = [
  { l: 0.70, c: 0.22, h: 45, a: 1 },   // Golden
  { l: 0.65, c: 0.25, h: 25, a: 1 },   // Orange
  { l: 0.60, c: 0.20, h: 355, a: 1 },  // Rose
  { l: 0.68, c: 0.18, h: 320, a: 1 },  // Pink
];

// Apple Ocean: Deep, calm blues
const APPLE_OCEAN_COLORS: OklchColour[] = [
  { l: 0.85, c: 0.10, h: 220, a: 1 },  // Light blue
  { l: 0.70, c: 0.14, h: 240, a: 1 },  // Medium blue
  { l: 0.55, c: 0.12, h: 260, a: 1 },  // Deep blue
  { l: 0.40, c: 0.08, h: 270, a: 1 },  // Navy
];

// Stripe Flow: Modern tech gradient
const STRIPE_FLOW_COLORS: OklchColour[] = [
  { l: 0.75, c: 0.20, h: 180, a: 1 },  // Turquoise
  { l: 0.70, c: 0.22, h: 220, a: 1 },  // Blue
  { l: 0.65, c: 0.18, h: 160, a: 1 },  // Teal
  { l: 0.72, c: 0.15, h: 140, a: 1 },  // Green
];

export const STYLE_PRESETS: StylePreset[] = [
  // Apple Presets
  {
    id: 'apple-classic',
    name: 'Apple Classic',
    description: 'Smooth, fluid mesh gradient with subtle noise',
    category: 'apple',
    config: {
      type: 'mesh-static',
      warpShape: 'simplex-noise',
      warp: 0.12,
      warpSize: 0.4,
      noise: 0.25,
      colors: APPLE_COLORS,
    },
  },
  {
    id: 'apple-aurora',
    name: 'Apple Aurora',
    description: 'Northern lights inspired with green-blue tones',
    category: 'apple',
    config: {
      type: 'mesh-static',
      warpShape: 'simplex-noise',
      warp: 0.15,
      warpSize: 0.5,
      noise: 0.2,
      colors: APPLE_AURORA_COLORS,
    },
  },
  {
    id: 'apple-ocean',
    name: 'Apple Ocean',
    description: 'Deep, calm blue mesh gradient',
    category: 'apple',
    config: {
      type: 'mesh-static',
      warpShape: 'fbm-noise',
      warp: 0.1,
      warpSize: 0.3,
      noise: 0.3,
      colors: APPLE_OCEAN_COLORS,
    },
  },

  // Stripe Presets
  {
    id: 'stripe-classic',
    name: 'Stripe Classic',
    description: 'Bold, organic gradient with domain warping',
    category: 'stripe',
    config: {
      type: 'mesh-static',
      warpShape: 'domain-warping',
      warp: 0.25,
      warpSize: 0.6,
      noise: 0.2,
      colors: STRIPE_COLORS,
    },
  },
  {
    id: 'stripe-sunset',
    name: 'Stripe Sunset',
    description: 'Warm flowing gradient with rich tones',
    category: 'stripe',
    config: {
      type: 'mesh-static',
      warpShape: 'domain-warping',
      warp: 0.3,
      warpSize: 0.65,
      noise: 0.15,
      colors: STRIPE_SUNSET_COLORS,
    },
  },
  {
    id: 'stripe-flow',
    name: 'Stripe Flow',
    description: 'Modern tech gradient with teal tones',
    category: 'stripe',
    config: {
      type: 'mesh-static',
      warpShape: 'fbm-noise',
      warp: 0.28,
      warpSize: 0.7,
      noise: 0.18,
      colors: STRIPE_FLOW_COLORS,
    },
  },
];

export const CATEGORY_LABELS: Record<StylePreset['category'], string> = {
  apple: 'Apple Style',
  stripe: 'Stripe Style',
  custom: 'Custom',
};

export function getStylePresetById(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find((p) => p.id === id);
}

export function getStylePresetsByCategory(
  category: StylePreset['category'],
): StylePreset[] {
  return STYLE_PRESETS.filter((p) => p.category === category);
}
