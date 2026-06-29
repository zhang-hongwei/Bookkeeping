// --- Colour Types ---

export interface OklchColour {
  l: number;  // 0–1 (lightness)
  c: number;  // 0–0.4 (chroma)
  h: number;  // 0–360 (hue)
  a: number;  // 0–1 (alpha)
}

export interface ColourStop {
  id: string;
  oklch: OklchColour;
  hex: string;
  position?: { x: number; y: number };
  displayFormat: 'oklch' | 'hex';
  locked: boolean;
}

// --- Gradient Types ---

export const GRADIENT_TYPES = [
  'sharp-bezier',
  'soft-bezier',
  'mesh-static',
  'mesh-grid',
  'simple',
] as const;
export type GradientType = (typeof GRADIENT_TYPES)[number];

export const GRADIENT_TYPE_LABELS: Record<GradientType, string> = {
  'sharp-bezier': 'Sharp Bezier',
  'soft-bezier': 'Soft Bezier',
  'mesh-static': 'Mesh Static',
  'mesh-grid': 'Mesh Grid',
  'simple': 'Simple',
};

export const GRADIENT_TYPE_INDEX: Record<GradientType, number> = {
  'sharp-bezier': 0,
  'soft-bezier': 1,
  'mesh-static': 2,
  'mesh-grid': 3,
  'simple': 4,
};

// --- Simple Gradient Sub-types ---

export const SIMPLE_SUBTYPES = ['linear', 'radial', 'conic'] as const;
export type SimpleGradientSubtype = (typeof SIMPLE_SUBTYPES)[number];

// --- Warp Shapes ---

export const WARP_SHAPES = [
  // Noise-based (9)
  'simplex-noise',
  'fbm-noise',
  'circular-noise',
  'value-noise',
  'worley-noise',
  'voronoi-noise',
  'domain-warping',
  'smooth-noise',
  'gravity',
  // Geometric (6)
  'waves',
  'circular',
  'oval',
  'rows',
  'columns',
  'flat',
] as const;
export type WarpShape = (typeof WARP_SHAPES)[number];

export const WARP_SHAPE_LABELS: Record<WarpShape, string> = {
  'simplex-noise': 'Simplex Noise',
  'fbm-noise': 'FBM Noise',
  'circular-noise': 'Circular Noise',
  'value-noise': 'Value Noise',
  'worley-noise': 'Worley Noise',
  'voronoi-noise': 'Voronoi Noise',
  'domain-warping': 'Domain Warping',
  'smooth-noise': 'Smooth Noise',
  'gravity': 'Gravity',
  'waves': 'Waves',
  'circular': 'Circular',
  'oval': 'Oval',
  'rows': 'Rows',
  'columns': 'Columns',
  'flat': 'Flat',
};

export const WARP_SHAPE_INDEX: Record<WarpShape, number> = {
  'simplex-noise': 0,
  'fbm-noise': 1,
  'circular-noise': 2,
  'value-noise': 3,
  'worley-noise': 4,
  'voronoi-noise': 5,
  'domain-warping': 6,
  'smooth-noise': 7,
  'gravity': 8,
  'waves': 9,
  'circular': 10,
  'oval': 11,
  'rows': 12,
  'columns': 13,
  'flat': 14,
};

export const NOISE_WARP_SHAPES: WarpShape[] = [
  'simplex-noise', 'fbm-noise', 'circular-noise', 'value-noise',
  'worley-noise', 'voronoi-noise', 'domain-warping', 'smooth-noise', 'gravity',
];

export const GEOMETRIC_WARP_SHAPES: WarpShape[] = [
  'waves', 'circular', 'oval', 'rows', 'columns', 'flat',
];

// --- Noise Types ---

export const NOISE_TYPES = ['value', 'simplex', 'fbm'] as const;
export type NoiseType = (typeof NOISE_TYPES)[number];

export const NOISE_TYPE_LABELS: Record<NoiseType, string> = {
  value: 'Value Noise',
  simplex: 'Simplex Noise',
  fbm: 'FBM Noise',
};

export const NOISE_TYPE_INDEX: Record<NoiseType, number> = {
  value: 0,
  simplex: 1,
  fbm: 2,
};

export const NOISE_COLOR_MODES = ['mono', 'color'] as const;
export type NoiseColorMode = (typeof NOISE_COLOR_MODES)[number];

export const NOISE_COLOR_MODE_LABELS: Record<NoiseColorMode, string> = {
  mono: 'Monochrome',
  color: 'Color',
};

export const NOISE_COLOR_MODE_INDEX: Record<NoiseColorMode, number> = {
  mono: 0,
  color: 1,
};

// --- Export ---

export type PixelDensity = 1 | 2 | 3 | 4;

// --- Preview Device Types ---

export const PREVIEW_DEVICES = [
  { id: 'actual', label: 'Actual Size', scale: 1 },
  { id: 'phone', label: 'Phone', width: 375, height: 812, scale: 1 },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024, scale: 1 },
  { id: 'desktop', label: 'Desktop', width: 1920, height: 1080, scale: 0.25 },
] as const;

export type PreviewDeviceId = (typeof PREVIEW_DEVICES)[number]['id'];

// --- Store Shape ---

export interface GradientState {
  type: GradientType;
  warpShape: WarpShape;
  width: number;
  height: number;
  warp: number;
  warpSize: number;
  noise: number;
  noiseScale: number;
  noiseType: NoiseType;
  noiseColorMode: NoiseColorMode;
  colours: ColourStop[];
  simpleSubtype: SimpleGradientSubtype;
  angle: number;
  pixelDensity: PixelDensity;
  previewDevice: PreviewDeviceId;
  previewZoom: number;

  setType: (type: GradientType) => void;
  setWarpShape: (shape: WarpShape) => void;
  setDimensions: (w: number, h: number) => void;
  setWarp: (value: number) => void;
  setWarpSize: (value: number) => void;
  setNoise: (value: number) => void;
  setNoiseScale: (value: number) => void;
  setNoiseType: (type: NoiseType) => void;
  setNoiseColorMode: (mode: NoiseColorMode) => void;
  setSimpleSubtype: (subtype: SimpleGradientSubtype) => void;
  setAngle: (angle: number) => void;
  setPixelDensity: (density: PixelDensity) => void;
  setPreviewDevice: (device: PreviewDeviceId) => void;
  setPreviewZoom: (zoom: number) => void;
  setColours: (colours: ColourStop[]) => void;
  addColour: (oklch: OklchColour) => void;
  removeColour: (id: string) => void;
  updateColour: (id: string, oklch: OklchColour) => void;
  updateColourPosition: (id: string, position: { x: number; y: number }) => void;
  setColourFormat: (id: string, format: 'oklch' | 'hex') => void;
  toggleColourLock: (id: string) => void;
  randomiseColours: () => void;
  applyStylePreset: (preset: StylePresetConfig) => void;
}

// --- Style Preset Types ---

import type { StylePresetConfig } from '../lib/presets/style-presets';
