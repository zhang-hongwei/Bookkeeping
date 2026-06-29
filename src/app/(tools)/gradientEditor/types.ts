/**
 * Gradient Editor Types
 */

/** Single color stop in the gradient */
export interface ColorStop {
  /** Unique identifier */
  id: string;
  /** Color value (HEX format) */
  color: string;
  /** Position in the gradient (0-100) */
  position: number;
  /** Opacity (0-1) */
  opacity: number;
}

/** Gradient type options */
export type GradientType = 'linear' | 'radial' | 'conic';

/** Radial gradient shape options */
export type RadialShape = 'circle' | 'ellipse';

/** Radial gradient size keyword */
export type RadialSize =
  | 'closest-side'
  | 'closest-corner'
  | 'farthest-side'
  | 'farthest-corner';

/** Gradient editor configuration */
export interface GradientConfig {
  /** Gradient type */
  type: GradientType;
  /** Angle for linear/conic gradients (0-360) */
  angle: number;
  /** Center X position for radial/conic (0-100) */
  centerX: number;
  /** Center Y position for radial/conic (0-100) */
  centerY: number;
  /** Radial shape (circle/ellipse) */
  radialShape: RadialShape;
  /** Radial size keyword */
  radialSize: RadialSize;
  /** Color stops array */
  stops: ColorStop[];
}

/** Export format types */
export type GradientExportFormat = 'css' | 'mui' | 'tailwind' | 'json' | 'png';

/** Gradient preset configuration */
export interface GradientPreset {
  name: string;
  description?: string;
  config: Omit<GradientConfig, 'stops'> & {
    stops: Omit<ColorStop, 'id'>[];
  };
}

/** Direction preset for quick angle selection */
export interface DirectionPreset {
  label: string;
  angle: number;
}
