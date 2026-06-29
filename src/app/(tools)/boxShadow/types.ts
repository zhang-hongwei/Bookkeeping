/**
 * Box Shadow Editor Types
 * Define all types required for the shadow editor
 */

/**
 * Single shadow layer configuration
 */
export interface ShadowLayer {
  /** Unique identifier */
  id: string;
  /** X-axis offset (px) */
  offsetX: number;
  /** Y-axis offset (px) */
  offsetY: number;
  /** Blur radius (px) */
  blur: number;
  /** Spread radius (px) */
  spread: number;
  /** Color value (HEX format, e.g., #000000) */
  color: string;
  /** Opacity (0-1) */
  opacity: number;
  /** Whether it is an inset shadow */
  inset: boolean;
  /** Whether this layer is enabled */
  enabled: boolean;
}

/**
 * Editor state
 */
export interface ShadowEditorState {
  /** List of shadow layers */
  layers: ShadowLayer[];
  /** Currently selected layer ID */
  selectedLayerId: string | null;
  /** Preview area background color */
  previewBackground: string;
}

/**
 * Export format types
 */
export type ExportFormat = 'css' | 'mui' | 'tailwind' | 'json';

/**
 * Shadow preset configuration
 */
export interface ShadowPreset {
  /** Preset name */
  name: string;
  /** Preset description */
  description: string;
  /** Shadow layer configuration */
  layers: Omit<ShadowLayer, 'id' | 'enabled'>[];
}

/**
 * Color RGB values
 */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}
