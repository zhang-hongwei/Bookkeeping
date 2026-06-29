/**
 * Path Parser — Parse SVG path d-attribute into editable nodes
 * Uses svg-pathdata for robust spec-compliant parsing.
 */

import { SVGPathData, SVGPathDataCommand, SVGPathDataTransformer } from 'svg-pathdata';
import type { PathCommand, PathNode } from '../types';
import { generateId } from '../utils';

// =============================================================================
// Parse d-attribute → PathCommand[]
// =============================================================================

export function parsePathD(d: string): PathCommand[] {
  const parsed = new SVGPathData(d);
  return parsed.commands.map((cmd) => ({
    type: String(cmd.type) as PathCommand['type'],
    args: extractArgs(cmd),
  }));
}

// =============================================================================
// Parse d-attribute → absolute PathCommand[]
// =============================================================================

export function parsePathDAbsolute(d: string): PathCommand[] {
  const parsed = new SVGPathData(d);
  const absCommands = parsed
    .toAbs()
    .normalize()
    .commands.map((cmd) => ({
      type: String(cmd.type) as PathCommand['type'],
      args: extractArgs(cmd),
    }));
  return absCommands;
}

// =============================================================================
// PathCommand[] → editable PathNode[]
// =============================================================================

export function commandsToNodes(commands: PathCommand[]): PathNode[] {
  const nodes: PathNode[] = [];
  let cx = 0;
  let cy = 0;

  for (const cmd of commands) {
    const a = cmd.args;
    switch (cmd.type) {
      case 'M':
      case 'L':
        nodes.push({
          id: generateId(),
          x: a[0],
          y: a[1],
          commandType: cmd.type,
          isRelative: false,
        });
        cx = a[0];
        cy = a[1];
        break;

      case 'C':
        nodes.push({
          id: generateId(),
          x: a[4],
          y: a[5],
          cp1x: a[0],
          cp1y: a[1],
          cp2x: a[2],
          cp2y: a[3],
          commandType: cmd.type,
          isRelative: false,
        });
        cx = a[4];
        cy = a[5];
        break;

      case 'Q':
        nodes.push({
          id: generateId(),
          x: a[2],
          y: a[3],
          cpx: a[0],
          cpy: a[1],
          commandType: cmd.type,
          isRelative: false,
        });
        cx = a[2];
        cy = a[3];
        break;

      case 'A':
        nodes.push({
          id: generateId(),
          x: a[5],
          y: a[6],
          commandType: cmd.type,
          isRelative: false,
        });
        cx = a[5];
        cy = a[6];
        break;

      case 'Z':
        // Close path — no new node, but mark the path as closed
        break;

      // Normalized commands: H/V are converted to L, S to C, T to Q
      default:
        break;
    }
  }

  return nodes;
}

// =============================================================================
// PathNode[] → d-attribute string
// =============================================================================

export function nodesToPathD(nodes: PathNode[], closed = false): string {
  if (nodes.length === 0) return '';
  const parts: string[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (i === 0) {
      // First node is always a Move
      parts.push(`M ${r(node.x)} ${r(node.y)}`);
      continue;
    }

    if (node.cp1x !== undefined && node.cp2x !== undefined) {
      // Cubic Bezier
      parts.push(`C ${r(node.cp1x)} ${r(node.cp1y)}, ${r(node.cp2x)} ${r(node.cp2y)}, ${r(node.x)} ${r(node.y)}`);
    } else if (node.cpx !== undefined) {
      // Quadratic Bezier
      parts.push(`Q ${r(node.cpx)} ${r(node.cpy)}, ${r(node.x)} ${r(node.y)}`);
    } else {
      // Line
      parts.push(`L ${r(node.x)} ${r(node.y)}`);
    }
  }

  if (closed) parts.push('Z');
  return parts.join(' ');
}

// =============================================================================
// Helpers
// =============================================================================

function extractArgs(cmd: SVGPathDataCommand): number[] {
  const argKeys = [
    'x', 'y', 'x1', 'y1', 'x2', 'y2',
    'rx', 'ry', 'xAxisRotation',
    'largeArc', 'sweep',
    'r',
  ] as const;

  const args: number[] = [];
  for (const key of argKeys) {
    if (key in cmd && typeof (cmd as Record<string, unknown>)[key] === 'number') {
      args.push((cmd as Record<string, number>)[key]);
    }
  }
  return args;
}

/** Round to 2 decimal places */
function r(n: number): number {
  return Math.round(n * 100) / 100;
}

// =============================================================================
// Path Sampling — using browser native SVG APIs
// =============================================================================

export interface SampledPoint {
  index: number;
  x: number;
  y: number;
}

/**
 * Sample points along an SVG path element using browser native APIs.
 * Uses getTotalLength() + getPointAtLength() for accurate curve sampling.
 * Must be called in browser context with a rendered SVG path element.
 */
export function samplePathFromDom(
  domElement: SVGPathElement,
  density: number = 20,
): SampledPoint[] {
  const totalLength = domElement.getTotalLength();
  if (totalLength <= 0) return [];

  const step = Math.max(totalLength / density, 1);
  const points: SampledPoint[] = [];

  for (let i = 0, idx = 0; i <= totalLength; i += step, idx++) {
    const pt = domElement.getPointAtLength(i);
    points.push({ index: idx, x: pt.x, y: pt.y });
  }

  // Ensure we include the endpoint
  const lastPt = domElement.getPointAtLength(totalLength);
  const last = points[points.length - 1];
  if (!last || Math.abs(last.x - lastPt.x) > 0.5 || Math.abs(last.y - lastPt.y) > 0.5) {
    points.push({ index: points.length, x: lastPt.x, y: lastPt.y });
  }

  return points;
}

/**
 * Convert sampled points back to an SVG path d-attribute.
 * Uses line segments (L) for simple reconstruction.
 * For smoother curves, use Catmull-Rom to Bezier conversion.
 */
export function sampledPointsToPathD(points: SampledPoint[], closed: boolean = false): string {
  if (points.length === 0) return '';

  const parts: string[] = [];
  parts.push(`M ${r(points[0].x)} ${r(points[0].y)}`);

  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${r(points[i].x)} ${r(points[i].y)}`);
  }

  if (closed) parts.push('Z');
  return parts.join(' ');
}

/**
 * Convert sampled points to a smooth Bezier path using Catmull-Rom spline.
 * Produces smoother curves than simple line segments.
 */
export function sampledPointsToSmoothPathD(points: SampledPoint[], closed: boolean = false, tension: number = 0.3): string {
  if (points.length === 0) return '';
  if (points.length <= 2) return sampledPointsToPathD(points, closed);

  const parts: string[] = [];
  parts.push(`M ${r(points[0].x)} ${r(points[0].y)}`);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Cubic Bezier control points
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    parts.push(`C ${r(cp1x)} ${r(cp1y)}, ${r(cp2x)} ${r(cp2y)}, ${r(p2.x)} ${r(p2.y)}`);
  }

  if (closed) parts.push('Z');
  return parts.join(' ');
}
