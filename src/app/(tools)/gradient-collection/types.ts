/**
 * Gradient Collection Types
 */

/** Gradient category types */
export type GradientCategory =
  | 'popular'
  | 'stripes'
  | 'circular'
  | 'angular'
  | 'smooth'
  | 'mesh'
  | 'dark';

/** Gradient type */
export type GradientType = 'linear' | 'radial' | 'conic';

/** Single color stop in the gradient */
export interface GradientStop {
  /** Color value (HEX format) */
  color: string;
  /** Position percentage (0-100) */
  position: number;
}

/** Gradient preset configuration */
export interface GradientPreset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Optional description */
  description?: string;
  /** Category for filtering */
  category: GradientCategory;
  /** Tags for search */
  tags: string[];
  /** Generated CSS */
  css: string;
  /** Color stops */
  stops: GradientStop[];
  /** Gradient type */
  type: GradientType;
  /** Angle for linear/conic gradients (0-360) */
  angle?: number;
  /** Popularity score (0-100) */
  popularity?: number;
}

/** Gradient editor state */
export interface GradientEditorState {
  /** Currently editing gradient ID */
  editingId: string | null;
  /** Local copy of stops being edited */
  localStops: GradientStop[];
  /** Local angle being edited */
  localAngle: number;
  /** Local gradient type */
  localType: GradientType;
  /** Preview CSS */
  previewCss: string;
}

/** Category info with count */
export interface CategoryInfo {
  id: GradientCategory;
  label: string;
  count: number;
}
