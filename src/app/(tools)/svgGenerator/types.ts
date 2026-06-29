/**
 * SVG Generator Types
 * Type definitions for the SVG design asset generator tool
 */

// =============================================================================
// Generator Types
// =============================================================================

export type GeneratorType =
  | 'blob'
  | 'wave'
  | 'curves'
  | 'blurryGradient'
  | 'circleScatter'
  | 'blobScene'
  | 'layeredWaves'
  | 'stackedWaves'
  | 'blobScatter'
  | 'lowPolyGrid'
  | 'layeredPeaks'
  | 'stackedPeaks'
  | 'polygonScatter'
  | 'layeredSteps'
  | 'stackedSteps'
  | 'symbolScatter';

// =============================================================================
// Configuration Types
// =============================================================================

export interface CanvasSize {
  width: number;
  height: number;
  label: string;
}

export const CANVAS_PRESETS: CanvasSize[] = [
  { width: 1920, height: 1080, label: '16:9 (1920×1080)' },
  { width: 1200, height: 630, label: 'OG Image (1200×630)' },
  { width: 900, height: 600, label: '3:2 (900×600)' },
  { width: 800, height: 600, label: '4:3 (800×600)' },
  { width: 600, height: 600, label: '1:1 (600×600)' },
  { width: 400, height: 800, label: 'Mobile (400×800)' },
  { width: 1080, height: 1920, label: 'Story (1080×1920)' },
];

export interface ColorConfig {
  background: string;
  fills: string[];
}

export interface BaseGeneratorConfig {
  canvas: CanvasSize;
  colors: ColorConfig;
  seed: number;
  variant: 'solid' | 'outline';
}

// Generator-specific config extensions
export interface BlobConfig extends BaseGeneratorConfig {
  complexity: number;      // 1-10: number of control points
  contrast: number;        // 0-100: how much variation from circle
  balance: number;         // 0-100: smoothness vs jaggedness
}

export interface WaveConfig extends BaseGeneratorConfig {
  layers: number;          // 1-5: number of wave layers
  amplitude: number;       // 0-100: wave height
  frequency: number;       // 1-10: number of wave peaks
  smoothness: number;      // 0-100: curve smoothness
}

export interface CurvesConfig extends BaseGeneratorConfig {
  curves: number;          // 1-10: number of curves
  complexity: number;      // 1-10: curve complexity (control points)
  flow: number;            // 0-100: flow direction/drift
  thickness: number;       // 1-20: stroke thickness
  opacity: number;         // 10-100: curve opacity
}

export interface BlurryGradientConfig extends BaseGeneratorConfig {
  blobCount: number;       // 2-6: number of gradient blobs
  blur: number;            // 0-100: blur intensity
  opacity: number;         // 0-100: blob opacity
}

export interface ScatterConfig extends BaseGeneratorConfig {
  count: number;           // 5-100: number of elements
  minSize: number;         // 5-50: minimum element size
  maxSize: number;         // 20-200: maximum element size
  spread: number;          // 0-100: how spread out elements are
}

export interface LayeredConfig extends BaseGeneratorConfig {
  layers: number;          // 2-8: number of layers
  amplitude: number;       // 0-100: peak/trough height
  smoothness: number;      // 0-100: curve smoothness
  gap: number;             // 0-100: space between layers
}

export type GeneratorConfig =
  | BlobConfig
  | WaveConfig
  | CurvesConfig
  | BlurryGradientConfig
  | ScatterConfig
  | LayeredConfig;

// =============================================================================
// Generator Interface
// =============================================================================

export interface GeneratorPreset {
  name: string;
  config: Partial<GeneratorConfig>;
  thumbnail?: string;
}

export interface GeneratorDefinition<TConfig extends GeneratorConfig = GeneratorConfig> {
  type: GeneratorType;
  name: string;
  description: string;
  icon: string; // Icon name from MUI icons
  category: 'shapes' | 'waves' | 'scatters' | 'scenes';
  generate: (config: TConfig) => string;
  defaultConfig: Partial<TConfig>;
  presets: GeneratorPreset[];
  controls: GeneratorControl[];
}

export interface GeneratorControl {
  key: string;
  label: string;
  type: 'slider' | 'color' | 'select' | 'number';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  defaultValue: unknown;
}

// =============================================================================
// Export Types
// =============================================================================

export type ExportFormat = 'svg' | 'png';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  scale: number; // For PNG export
}

// =============================================================================
// Store Types
// =============================================================================

export interface SvgGeneratorState {
  // Current state
  generatorType: GeneratorType;
  config: GeneratorConfig;

  // History for undo/redo
  history: GeneratorConfig[];
  historyIndex: number;

  // Actions
  setGeneratorType: (type: GeneratorType) => void;
  updateConfig: (updates: Partial<GeneratorConfig>) => void;
  randomize: () => void;
  resetToDefaults: () => void;
  undo: () => void;
  redo: () => void;

  // Export
  exportSvg: () => string;
  exportPng: (scale?: number) => Promise<Blob>;

  // Internal
  _generateSvg: () => string;
}
