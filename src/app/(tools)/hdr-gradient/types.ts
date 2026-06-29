// Gradient types
export type GradientType = 'linear' | 'radial' | 'conic';

// Color spaces
export type ColorSpace =
  | 'oklab'
  | 'oklch'
  | 'lab'
  | 'lch'
  | 'hsl'
  | 'hwb'
  | 'srgb'
  | 'srgb-linear'
  | 'xyz-d65'
  | 'display-p3'
  | 'a98-rgb'
  | 'prophoto-rgb'
  | 'rec2020';

// Hue interpolation methods
export type HueInterpolation = 'shorter' | 'longer' | 'increasing' | 'decreasing';

// Radial gradient shape
export type RadialShape = 'circle' | 'ellipse';

// Radial gradient size keywords
export type RadialSize = 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner' | string;

// A color stop (has a color)
export interface GradientColorStop {
  kind: 'stop';
  color: string; // colorjs.io color string like "oklch(70% 0.5 340)"
  auto: string; // auto-calculated position, e.g. '0', '50', '100'
  position1: string | null; // first position value (null for auto)
  position2: string | null; // second position value (null for auto)
}

// A transition hint (no color, just a position)
export interface GradientHintStop {
  kind: 'hint';
  auto: string;
  percentage: string | null; // e.g. '50'
}

export type GradientStop = GradientColorStop | GradientHintStop;

// Named directions for linear gradients
export type NamedDirection =
  | 'to top'
  | 'to top right'
  | 'to right'
  | 'to bottom right'
  | 'to bottom'
  | 'to bottom left'
  | 'to left'
  | 'to top left'
  | '--';

// Named positions for radial/conic gradients
export type NamedPosition =
  | 'center'
  | 'top'
  | 'top right'
  | 'right'
  | 'bottom right'
  | 'bottom'
  | 'bottom left'
  | 'left'
  | 'top left'
  | '--';

// Linear gradient config
export interface LinearConfig {
  namedAngle: NamedDirection;
  angle: string | number | null;
}

// Radial gradient config
export interface RadialConfig {
  shape: RadialShape;
  size: RadialSize;
  namedPosition: NamedPosition;
  position: { x: number | null; y: number | null };
}

// Conic gradient config
export interface ConicConfig {
  angle: string | number;
  namedPosition: NamedPosition;
  position: { x: number | null; y: number | null };
}

// A gradient layer
export interface GradientLayer {
  id: string;
  name: string;
  visible: boolean;
  type: GradientType;
  space: ColorSpace;
  interpolation: HueInterpolation;
  stops: GradientStop[];
  linear: LinearConfig;
  radial: RadialConfig;
  conic: ConicConfig;
  cachedCss?: { modern: string; classic: string };
}

// Preset gradient
export interface GradientPreset {
  name: string;
  type: GradientType;
  space: ColorSpace;
  interpolation?: HueInterpolation;
  stops: GradientStop[];
  linear?: Partial<LinearConfig>;
  radial?: Partial<RadialConfig>;
  conic?: Partial<ConicConfig>;
}

// Named direction to degree mapping
export const NAMED_DIRECTION_TO_DEG: Record<string, number> = {
  'to top': 0,
  'to top right': 45,
  'to right': 90,
  'to bottom right': 135,
  'to bottom': 180,
  'to bottom left': 225,
  'to left': 270,
  'to top left': 315,
};

// Named position to percentage mapping
export const NAMED_POSITION_TO_PERCENT: Record<string, { x: number; y: number }> = {
  center: { x: 50, y: 50 },
  top: { x: 50, y: 0 },
  'top right': { x: 100, y: 0 },
  right: { x: 100, y: 50 },
  'bottom right': { x: 100, y: 100 },
  bottom: { x: 50, y: 100 },
  'bottom left': { x: 0, y: 100 },
  left: { x: 0, y: 50 },
  'top left': { x: 0, y: 0 },
};

// Reverse: percentage to named position
export function percentToNamedPosition(x: number, y: number): NamedPosition | null {
  const tol = 0;
  const eq = (a: number, b: number) => Math.abs(a - b) <= tol;
  if (eq(x, 50) && eq(y, 50)) return 'center';
  if (eq(x, 50) && eq(y, 0)) return 'top';
  if (eq(x, 100) && eq(y, 50)) return 'right';
  if (eq(x, 50) && eq(y, 100)) return 'bottom';
  if (eq(x, 0) && eq(y, 50)) return 'left';
  if (eq(x, 100) && eq(y, 0)) return 'top right';
  if (eq(x, 100) && eq(y, 100)) return 'bottom right';
  if (eq(x, 0) && eq(y, 100)) return 'bottom left';
  if (eq(x, 0) && eq(y, 0)) return 'top left';
  return null;
}

// All available gradient positions (for reference)
export const GRADIENT_POSITIONS = [
  'center',
  'top left',
  'top',
  'top right',
  'right',
  'bottom right',
  'bottom',
  'bottom left',
  'left',
];

export const NAMED_POSITIONS = GRADIENT_POSITIONS;

// All available gradient angles (for reference)
export const GRADIENT_ANGLES = [
  'to top left',
  'to top',
  'to top right',
  'to right',
  'to bottom right',
  'to bottom',
  'to bottom left',
  'to left',
];
