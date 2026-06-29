/**
 * Transform Tool Types
 */

export interface TransformValues {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  skewX: number;
  skewY: number;
  perspective: number;
}

export interface TransformPreset {
  name: string;
  description: string;
  values: Partial<TransformValues>;
}

export type TransformMode = '2d' | '3d';
