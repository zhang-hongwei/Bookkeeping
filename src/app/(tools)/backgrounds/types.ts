/**
 * Backgrounds Generator Types
 * Type definitions for the Cool Backgrounds tool
 */

// =============================================================================
// Generator Types
// =============================================================================

export type BackgroundGeneratorType =
  | 'trianglify'
  | 'particles'
  | 'topography'
  | 'unsplash'
  | 'gradient'
  | 'wave';

// =============================================================================
// Canvas Size Configuration
// =============================================================================

export interface CanvasSize {
  width: number;
  height: number;
  label: string;
}

export const CANVAS_PRESETS: CanvasSize[] = [
  { width: 1920, height: 1080, label: '16:9 Desktop (1920×1080)' },
  { width: 2560, height: 1440, label: '2K QHD (2560×1440)' },
  { width: 3840, height: 2160, label: '4K UHD (3840×2160)' },
  { width: 1280, height: 720, label: '720p HD (1280×720)' },
  { width: 1200, height: 630, label: 'OG Image (1200×630)' },
  { width: 1080, height: 1920, label: 'Mobile Story (1080×1920)' },
  { width: 1080, height: 1080, label: 'Square (1080×1080)' },
  { width: 800, height: 600, label: '4:3 (800×600)' },
];

// =============================================================================
// Base Configuration
// =============================================================================

export interface BaseBackgroundConfig {
  canvas: CanvasSize;
  seed: number;
  colors: ColorPalette;
}

export interface ColorPalette {
  background: string;
  palette: string[];
}

// =============================================================================
// Generator-Specific Configurations
// =============================================================================

export interface TrianglifyConfig extends BaseBackgroundConfig {
  cellSize: number;
  variance: number;
  bleed: number;
  strokeWidth: number;
  strokeColor: string;
  fillOpacity: number;
}

export interface ParticlesConfig extends BaseBackgroundConfig {
  count: number;
  minSize: number;
  maxSize: number;
  opacity: number;
  distribution: 'random' | 'clustered' | 'grid' | 'spiral';
  shape: 'circle' | 'square' | 'triangle' | 'star';
  blur: number;
}

export interface TopographyConfig extends BaseBackgroundConfig {
  layers: number;
  amplitude: number;
  frequency: number;
  strokeWidth: number;
  fillStyle: 'solid' | 'gradient' | 'none';
  smoothness: number;
  offset: number;
}

export interface UnsplashConfig extends BaseBackgroundConfig {
  query: string;
  orientation: 'landscape' | 'portrait' | 'squarish';
  overlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
  blur: number;
  brightness: number;
  photoId?: string;
  photoUrl?: string;
  photographerName?: string;
  photographerLink?: string;
}

export interface GradientStop {
  color: string;
  position: number;
}

export interface GradientConfig extends BaseBackgroundConfig {
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  centerX: number;
  centerY: number;
  stops: GradientStop[];
  smoothing: boolean;
}

export interface WaveConfig extends BaseBackgroundConfig {
  layers: number;
  amplitude: number;
  frequency: number;
  speed: number;
  opacity: number;
  direction: 'left' | 'right';
  waveType: 'sine' | 'cosine' | 'triangle';
  gradient: boolean;
  colors: ColorPalette;
}

// =============================================================================
// Union Type
// =============================================================================

export type BackgroundConfig =
  | TrianglifyConfig
  | ParticlesConfig
  | TopographyConfig
  | UnsplashConfig
  | GradientConfig
  | WaveConfig;

// =============================================================================
// Generator Interface
// =============================================================================

export interface GeneratorPreset {
  name: string;
  thumbnail?: string;
  config: Partial<BackgroundConfig>;
}

export interface GeneratorControl {
  key: string;
  label: string;
  type: 'slider' | 'color' | 'select' | 'number' | 'text' | 'toggle' | 'colorArray';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
  defaultValue: unknown;
}

export interface BackgroundGeneratorDefinition<TConfig extends BackgroundConfig = BackgroundConfig> {
  type: BackgroundGeneratorType;
  name: string;
  description: string;
  icon: string;
  generateCanvas: (config: TConfig, canvas: HTMLCanvasElement) => void | Promise<void>;
  generateSVG?: (config: TConfig) => string;
  defaultConfig: Partial<TConfig>;
  presets: GeneratorPreset[];
  controls: GeneratorControl[];
  supportsSVG: boolean;
}

// =============================================================================
// Export Types
// =============================================================================

export type ExportFormat = 'png' | 'svg' | 'css';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  scale: number;
  quality: number;
}

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_CANVAS: CanvasSize = CANVAS_PRESETS[0];

export const DEFAULT_COLORS: ColorPalette = {
  background: '#1a1a2e',
  palette: ['#16213e', '#0f3460', '#e94560', '#533483'],
};

export const DEFAULT_BASE_CONFIG: BaseBackgroundConfig = {
  canvas: DEFAULT_CANVAS,
  seed: Date.now(),
  colors: DEFAULT_COLORS,
};
