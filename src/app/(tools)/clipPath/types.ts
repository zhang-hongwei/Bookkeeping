/**
 * Clip Path Types
 * Type definitions for clip path generator
 */

export type ClipPathType =
  | 'none'
  | 'inset'
  | 'circle'
  | 'ellipse'
  | 'polygon'
  | 'path';

export interface ClipPathInset {
  type: 'inset';
  top: number;
  right: number;
  bottom: number;
  left: number;
  borderRadius?: number;
}

export interface ClipPathCircle {
  type: 'circle';
  radius: number; // percentage or px
  positionX: number; // percentage
  positionY: number; // percentage
}

export interface ClipPathEllipse {
  type: 'ellipse';
  radiusX: number;
  radiusY: number;
  positionX: number;
  positionY: number;
}

export interface ClipPathPolygon {
  type: 'polygon';
  points: Array<{ x: number; y: number }>;
  fillRule?: 'nonzero' | 'evenodd';
}

export type ClipPathConfig = ClipPathInset | ClipPathCircle | ClipPathEllipse | ClipPathPolygon | { type: 'none' };

export interface ClipPathPreset {
  name: string;
  description: string;
  config: ClipPathConfig;
  thumbnail?: string;
}

export type ClipPathExportFormat = 'css' | 'scss' | 'tailwind' | 'svg' | 'json';
