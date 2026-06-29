/**
 * Path Utilities - Functions for generating and manipulating SVG paths
 */

import type { SeededRandom } from '../algorithms/random';

// =============================================================================
// Point Types
// =============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface ControlPoint {
  cp1: Point;
  cp2: Point;
}

// =============================================================================
// Path Command Generators
// =============================================================================

/**
 * Move to point
 */
export function moveTo(point: Point): string {
  return `M ${point.x} ${point.y}`;
}

/**
 * Line to point
 */
export function lineTo(point: Point): string {
  return `L ${point.x} ${point.y}`;
}

/**
 * Cubic Bezier curve
 */
export function curveTo(point: Point, cp1: Point, cp2: Point): string {
  return `C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${point.x} ${point.y}`;
}

/**
 * Quadratic Bezier curve
 */
export function quadCurveTo(point: Point, cp: Point): string {
  return `Q ${cp.x} ${cp.y} ${point.x} ${point.y}`;
}

/**
 * Smooth cubic Bezier curve (continues from previous curve)
 */
export function smoothCurveTo(point: Point, cp2: Point): string {
  return `S ${cp2.x} ${cp2.y} ${point.x} ${point.y}`;
}

/**
 * Arc curve
 */
export function arcTo(
  point: Point,
  rx: number,
  ry: number,
  options: {
    rotation?: number;
    largeArc?: boolean;
    sweep?: boolean;
  } = {}
): string {
  const { rotation = 0, largeArc = false, sweep = true } = options;
  return `A ${rx} ${ry} ${rotation} ${largeArc ? 1 : 0} ${sweep ? 1 : 0} ${point.x} ${point.y}`;
}

/**
 * Close path
 */
export function closePath(): string {
  return 'Z';
}

// =============================================================================
// Shape Generators
// =============================================================================

/**
 * Generate a smooth blob shape using cubic Bezier curves
 */
export function generateBlobPath(
  centerX: number,
  centerY: number,
  baseRadius: number,
  random: SeededRandom,
  options: {
    complexity?: number;
    contrast?: number;
  } = {}
): string {
  const { complexity = 8, contrast = 50 } = options;
  const numPoints = Math.max(4, Math.floor(complexity * 1.5));
  const angleStep = (Math.PI * 2) / numPoints;
  const contrastFactor = contrast / 100;

  // Generate points around the circle with random variations
  const points: Point[] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep;
    const radiusVariation = 1 + (random.range(-1, 1) * contrastFactor * 0.5);
    const radius = baseRadius * radiusVariation;

    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  // Generate smooth curve through points using Catmull-Rom to Bezier conversion
  return smoothCurveThroughPoints(points, 0.3);
}

/**
 * Generate a smooth wave path
 */
export function generateWavePath(
  width: number,
  baseY: number,
  amplitude: number,
  frequency: number,
  random: SeededRandom,
  options: {
    smoothness?: number;
    phase?: number;
  } = {}
): string {
  const { smoothness = 50, phase = 0 } = options;
  const segments = Math.floor(frequency * 20);
  const segmentWidth = width / segments;

  const points: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth;
    const normalizedX = (x / width) * Math.PI * 2;

    // Combine multiple sine waves for more organic shape
    const y =
      baseY +
      Math.sin(normalizedX * frequency + phase) * amplitude * 0.6 +
      Math.sin(normalizedX * frequency * 2 + random.range(0, Math.PI)) * amplitude * 0.3 +
      Math.sin(normalizedX * frequency * 0.5 + random.range(0, Math.PI)) * amplitude * 0.1;

    points.push({ x, y });
  }

  // Create smooth curve
  const pathParts = [moveTo(points[0])];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp = {
      x: prev.x + (curr.x - prev.x) * (smoothness / 100),
      y: prev.y + (curr.y - prev.y) * 0.5,
    };
    pathParts.push(quadCurveTo(curr, cp));
  }

  return pathParts.join(' ');
}

/**
 * Generate layered waves (multiple wave paths stacked)
 */
export function generateLayeredWaves(
  width: number,
  height: number,
  layers: number,
  amplitude: number,
  frequency: number,
  random: SeededRandom,
  options: {
    smoothness?: number;
    gap?: number;
  } = {}
): Array<{ path: string; y: number }> {
  const { smoothness = 50, gap = 30 } = options;
  const layerGap = height / (layers + 1);
  const results: Array<{ path: string; y: number }> = [];

  for (let i = 0; i < layers; i++) {
    const baseY = layerGap * (i + 1);
    const layerAmplitude = amplitude * (1 - i * 0.15);
    const phase = random.range(0, Math.PI * 2);

    const wavePath = generateWavePath(width, baseY, layerAmplitude, frequency, random, {
      smoothness,
      phase,
    });

    // Close the path for filling
    const fullPath = `${wavePath} L ${width} ${height} L 0 ${height} Z`;

    results.push({ path: fullPath, y: baseY });
  }

  return results;
}

/**
 * Generate scattered points
 */
export function generateScatterPoints(
  width: number,
  height: number,
  count: number,
  random: SeededRandom,
  options: {
    minSize?: number;
    maxSize?: number;
    spread?: number;
    avoidEdges?: boolean;
  } = {}
): Array<{ x: number; y: number; size: number }> {
  const { minSize = 10, maxSize = 50, spread = 100, avoidEdges = true } = options;
  const spreadFactor = spread / 100;
  const points: Array<{ x: number; y: number; size: number }> = [];

  for (let i = 0; i < count; i++) {
    let x: number, y: number;

    if (avoidEdges) {
      const margin = maxSize;
      x = random.range(margin, width - margin);
      y = random.range(margin, height - margin);
    } else {
      x = random.range(0, width);
      y = random.range(0, height);
    }

    // Add some clustering based on spread
    if (spreadFactor < 1 && points.length > 0) {
      const clusterPoint = random.pick(points);
      x = clusterPoint.x + random.range(-width * spreadFactor, width * spreadFactor);
      y = clusterPoint.y + random.range(-height * spreadFactor, height * spreadFactor);
    }

    const size = random.range(minSize, maxSize);

    points.push({ x, y, size });
  }

  return points;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a smooth curve through points using cubic Bezier curves
 */
export function smoothCurveThroughPoints(points: Point[], tension: number = 0.3): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `${moveTo(points[0])} ${lineTo(points[1])}`;
  }

  const pathParts: string[] = [moveTo(points[0])];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? points.length - 1 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? (i + 2) % points.length : i + 2];

    // Calculate control points using Catmull-Rom to Bezier conversion
    const cp1 = {
      x: p1.x + (p2.x - p0.x) * tension,
      y: p1.y + (p2.y - p0.y) * tension,
    };
    const cp2 = {
      x: p2.x - (p3.x - p1.x) * tension,
      y: p2.y - (p3.y - p1.y) * tension,
    };

    pathParts.push(curveTo(p2, cp1, cp2));
  }

  // Close the path for a continuous loop
  pathParts.push(closePath());

  return pathParts.join(' ');
}

/**
 * Convert polar to cartesian coordinates
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Point {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Generate arc path (for pie charts, partial circles, etc.)
 */
export function generateArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    moveTo({ x: centerX, y: centerY }),
    lineTo(start),
    arcTo(end, radius, radius, { largeArc: largeArcFlag === 1, sweep: false }),
    closePath(),
  ].join(' ');
}

/**
 * Simplify a path by reducing points
 */
export function simplifyPath(points: Point[], tolerance: number = 1): Point[] {
  if (points.length < 3) return points;

  // Douglas-Peucker algorithm
  let maxDistance = 0;
  let maxIndex = 0;

  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > tolerance) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyPath(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lineLengthSquared = dx * dx + dy * dy;

  if (lineLengthSquared === 0) {
    return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lineLengthSquared));
  const projection = { x: lineStart.x + t * dx, y: lineStart.y + t * dy };

  return Math.sqrt((point.x - projection.x) ** 2 + (point.y - projection.y) ** 2);
}
