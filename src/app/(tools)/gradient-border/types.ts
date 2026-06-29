/**
 * Gradient Border Editor Types
 */

export interface ColorStop {
  id: string;
  color: string;
  opacity: number; // 0-100
  position: number; // 0-100
}

export type GradientType = 'linear' | 'radial' | 'conic';

export type BorderImageRepeat = 'stretch' | 'repeat' | 'round' | 'space';

export type BorderImageSourceMode = 'gradient' | 'image';

export interface BorderImageOptions {
  sourceMode: BorderImageSourceMode;
  imageUrl: string; // URL for image source, e.g. '/border.png'
  slice: string; // e.g. '1', '30%', '10 20 10 20'
  sliceFill: boolean; // whether to include 'fill' keyword
  width: string; // e.g. '1', '3px', '10% 20%'
  outset: string; // e.g. '0', '5px'
  repeat: BorderImageRepeat;
}

export interface GradientBorderConfig {
  colorStops: ColorStop[];
  gradientType: GradientType;
  angle: number; // 0-360, for linear/conic
  borderWidth: number; // px
  borderRadius: number; // px

  // Inner background stops (the first gradient layer in background-clip mode)
  innerBgStops: ColorStop[];
  innerBgAngle: number; // 0-360

  previewWidth: number;
  previewHeight: number;
  previewContent: string;
  previewBgColor: string;
  previewBgOpacity: number; // 0-100
  implementation: 'border-image' | 'background-clip' | 'pseudo-element';
  borderImageOptions: BorderImageOptions;
}

export interface GradientBorderPreset {
  name: string;
  description: string;
  config: Omit<GradientBorderConfig, 'previewWidth' | 'previewHeight' | 'previewContent' | 'previewBgColor' | 'previewBgOpacity' | 'innerBgStops'>;
}
