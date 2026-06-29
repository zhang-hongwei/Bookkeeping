/**
 * Delaunay Triangulation Utilities
 * Wrapper around d3-delaunay for trianglify generator
 */

import { Delaunay } from 'd3-delaunay';

export interface Point {
  x: number;
  y: number;
}

export interface Triangle {
  p1: Point;
  p2: Point;
  p3: Point;
  centroid: Point;
}

/**
 * Generate grid points with optional variance
 */
export function generateGridPoints(
  width: number,
  height: number,
  cellSize: number,
  variance: number,
  random: () => number
): Point[] {
  const points: Point[] = [];
  const varianceFactor = variance / 100;
  const cols = Math.ceil(width / cellSize) + 1;
  const rows = Math.ceil(height / cellSize) + 1;

  // Add extra margin points to cover edges
  const margin = cellSize;

  for (let row = -1; row <= rows; row++) {
    for (let col = -1; col <= cols; col++) {
      const baseX = col * cellSize;
      const baseY = row * cellSize;
      const offsetX = (random() - 0.5) * 2 * cellSize * varianceFactor;
      const offsetY = (random() - 0.5) * 2 * cellSize * varianceFactor;

      points.push({
        x: Math.max(-margin, Math.min(width + margin, baseX + offsetX)),
        y: Math.max(-margin, Math.min(height + margin, baseY + offsetY)),
      });
    }
  }

  return points;
}

/**
 * Perform Delaunay triangulation on points
 */
export function triangulate(points: Point[]): Triangle[] {
  if (points.length < 3) {
    return [];
  }

  try {
    // Filter out invalid points (NaN, Infinity, or coincident points)
    const validPoints = points.filter(
      (p) =>
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        !Number.isNaN(p.x) &&
        !Number.isNaN(p.y)
    );

    if (validPoints.length < 3) {
      console.warn('Not enough valid points for triangulation');
      return [];
    }

    // d3-delaunay expects an array of [x, y] pairs
    const pointsArray = validPoints.map((p) => [p.x, p.y] as [number, number]);
    const delaunay = Delaunay.from(pointsArray);
    const triangles: Triangle[] = [];

    // delaunay.triangles is a Uint32Array of vertex indices (3 per triangle)
    const indices = delaunay.triangles;

    // Safety check: if triangles array is not available, return empty
    if (!indices || indices.length === 0) {
      console.warn('Delaunay triangulation returned no triangles');
      return [];
    }

    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i];
      const i2 = indices[i + 1];
      const i3 = indices[i + 2];

      if (i1 !== undefined && i2 !== undefined && i3 !== undefined) {
        const p1 = validPoints[i1];
        const p2 = validPoints[i2];
        const p3 = validPoints[i3];

        if (p1 && p2 && p3) {
          triangles.push({
            p1,
            p2,
            p3,
            centroid: {
              x: (p1.x + p2.x + p3.x) / 3,
              y: (p1.y + p2.y + p3.y) / 3,
            },
          });
        }
      }
    }

    return triangles;
  } catch (error) {
    console.error('Delaunay triangulation failed:', error);
    return [];
  }
}

/**
 * Interpolate color based on position
 */
export function interpolateColor(
  palette: string[],
  x: number,
  y: number,
  width: number,
  height: number
): string {
  // Use a simple gradient interpolation based on position
  const t = (x / width + y / height) / 2;
  const index = Math.min(Math.floor(t * palette.length), palette.length - 1);
  return palette[index] ?? palette[0] ?? '#000000';
}

/**
 * Calculate triangle bounding box
 */
export function getTriangleBounds(triangle: Triangle): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const { p1, p2, p3 } = triangle;
  return {
    minX: Math.min(p1.x, p2.x, p3.x),
    maxX: Math.max(p1.x, p2.x, p3.x),
    minY: Math.min(p1.y, p2.y, p3.y),
    maxY: Math.max(p1.y, p2.y, p3.y),
  };
}

/**
 * Check if triangle is within canvas bounds
 */
export function isTriangleInBounds(
  triangle: Triangle,
  width: number,
  height: number,
  margin: number = 0
): boolean {
  const bounds = getTriangleBounds(triangle);
  return (
    bounds.maxX >= -margin &&
    bounds.minX <= width + margin &&
    bounds.maxY >= -margin &&
    bounds.minY <= height + margin
  );
}
