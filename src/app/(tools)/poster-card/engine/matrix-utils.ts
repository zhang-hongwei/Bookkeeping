/**
 * Poster Card Editor - Matrix2D Utilities
 *
 * Based on: 09-architecture-upgrades.md (修正1)
 * 2D affine matrix operations for transform calculations.
 */

import type { Matrix2D } from './node-tree/types';

// Re-export for convenience
export type { Matrix2D };

export const IDENTITY_MATRIX: Matrix2D = [1, 0, 0, 1, 0, 0];

/**
 * Matrix multiplication: A × B
 * | a1  c1  e1 |   | a2  c2  e2 |
 * | b1  d1  f1 | × | b2  d2  f2 |
 * | 0   0   1  |   | 0   0   1  |
 */
export function multiplyMatrix(a: Matrix2D, b: Matrix2D): Matrix2D {
  return [
    a[0] * b[0] + a[2] * b[1], // a
    a[1] * b[0] + a[3] * b[1], // b
    a[0] * b[2] + a[2] * b[3], // c
    a[1] * b[2] + a[3] * b[3], // d
    a[0] * b[4] + a[2] * b[5] + a[4], // e (tx)
    a[1] * b[4] + a[3] * b[5] + a[5], // f (ty)
  ];
}

/**
 * Create a matrix from transform parameters.
 */
export function createMatrix(params: {
  x?: number;
  y?: number;
  rotation?: number; // degrees
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
}): Matrix2D {
  const { x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1, skewX = 0, skewY = 0 } = params;

  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Rotation × Scale
  const a = cos * scaleX;
  const b = sin * scaleX;
  const c = -sin * scaleY;
  const d = cos * scaleY;

  return [
    a + skewY * c, // a: scaleX with skew
    b + skewY * d, // b
    skewX * a + c, // c: skew + scaleY
    skewX * b + d, // d
    x, // e: tx
    y, // f: ty
  ];
}

/**
 * Invert a matrix (for hit-test worldToLocal).
 */
export function invertMatrix(m: Matrix2D): Matrix2D {
  const [a, b, c, d, e, f] = m;
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-10) return IDENTITY_MATRIX;
  const invDet = 1 / det;
  return [
    d * invDet,
    -b * invDet,
    -c * invDet,
    a * invDet,
    (c * f - d * e) * invDet,
    (b * e - a * f) * invDet,
  ];
}

/**
 * Decompose matrix to human-readable transform parameters.
 * Used by PropertyPanel to display x, y, rotation, scaleX, scaleY.
 */
export function decomposeMatrix(m: Matrix2D): {
  x: number;
  y: number;
  rotation: number; // degrees
  scaleX: number;
  scaleY: number;
  skewX: number; // degrees
} {
  const [a, b, c, d, e, f] = m;
  const rotation = (Math.atan2(b, a) * 180) / Math.PI;
  const sx = Math.sqrt(a * a + b * b);
  const sy = Math.sqrt(c * c + d * d);
  const skewX = (Math.atan2(a * c + b * d, a * d - b * c) * 180) / Math.PI;
  return { x: e, y: f, rotation, scaleX: sx, scaleY: sy, skewX };
}

/**
 * Apply matrix transform to a point.
 */
export function applyMatrixToPoint(m: Matrix2D, point: { x: number; y: number }): { x: number; y: number } {
  return {
    x: m[0] * point.x + m[2] * point.y + m[4],
    y: m[1] * point.x + m[3] * point.y + m[5],
  };
}
