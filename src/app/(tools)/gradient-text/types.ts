/**
 * Gradient Text Editor Types
 */

export interface ColorStop {
  id: string;
  color: string;
  opacity: number; // 0-100
  position: number; // 0-100
}

export type GradientType = 'linear' | 'radial-circle' | 'radial-ellipse' | 'conic';

export interface GradientTextConfig {
  // Gradient settings
  colorStops: ColorStop[];
  gradientType: GradientType;
  angle: number; // 0-360

  // Text settings
  text: string;
  fontSize: number; // px
  fontWeight: number;
  fontFamily: string;
  letterSpacing: number; // px
  lineHeight: number; // multiplier
  textAlign: 'left' | 'center' | 'right';

  // Preview settings
  previewBgColor: string;
}

export interface GradientTextPreset {
  name: string;
  description: string;
  config: Partial<GradientTextConfig>;
}
