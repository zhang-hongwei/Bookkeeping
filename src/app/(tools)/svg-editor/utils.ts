/**
 * SVG Icon Editor - Utility Functions
 */

import type { BBox, Point, ViewportState } from './types';

// =============================================================================
// Coordinate Transforms
// =============================================================================

/** Convert screen coordinates to canvas coordinates */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: ViewportState,
  canvasRect: DOMRect,
): Point {
  return {
    x: (screenX - canvasRect.left - viewport.panX) / viewport.zoom,
    y: (screenY - canvasRect.top - viewport.panY) / viewport.zoom,
  };
}

/** Convert canvas coordinates to screen coordinates */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  viewport: ViewportState,
  canvasRect: DOMRect,
): Point {
  return {
    x: canvasX * viewport.zoom + viewport.panX + canvasRect.left,
    y: canvasY * viewport.zoom + viewport.panY + canvasRect.top,
  };
}

// =============================================================================
// Deep Clone
// =============================================================================

/** Deep clone via JSON round-trip — safe for plain data objects */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// =============================================================================
// XML Helpers
// =============================================================================

const XML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => XML_ESCAPE_MAP[ch] ?? ch);
}

// =============================================================================
// BBox Utilities
// =============================================================================

/** Merge multiple bounding boxes into one */
export function mergeBBoxes(boxes: BBox[]): BBox | null {
  if (boxes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const box of boxes) {
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Compute bounding box for basic SVG element from attributes */
export function getElementBBox(attrs: Record<string, string>, tag: string): BBox {
  const num = (key: string, fallback = 0) => Number.parseFloat(attrs[key] ?? String(fallback)) || fallback;

  switch (tag) {
    case 'rect':
      return { x: num('x'), y: num('y'), width: num('width'), height: num('height') };
    case 'circle':
      return {
        x: num('cx') - num('r'),
        y: num('cy') - num('r'),
        width: num('r') * 2,
        height: num('r') * 2,
      };
    case 'ellipse':
      return {
        x: num('cx') - num('rx'),
        y: num('cy') - num('ry'),
        width: num('rx') * 2,
        height: num('ry') * 2,
      };
    case 'line':
      return {
        x: Math.min(num('x1'), num('x2')),
        y: Math.min(num('y1'), num('y2')),
        width: Math.abs(num('x2') - num('x1')) || 1,
        height: Math.abs(num('y2') - num('y1')) || 1,
      };
    case 'text': {
      const x = num('x');
      const y = num('y');
      const fontSize = num('font-size', 16);
      return { x, y: y - fontSize, width: fontSize * 4, height: fontSize };
    }
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

// =============================================================================
// Color Helpers
// =============================================================================

/** Check if a string is a valid CSS color */
export function isValidColor(value: string): boolean {
  if (!value || value === 'none' || value === 'inherit' || value === 'currentColor') return true;
  if (value.startsWith('url(')) return true;

  const s = new Option().style;
  s.color = value;
  return s.color !== '';
}

// =============================================================================
// Geometry Helpers
// =============================================================================

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Distance between two points */
export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Snap a value to the nearest grid increment */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

// =============================================================================
// ID Generation
// =============================================================================

let idCounter = 0;

/** Generate a unique editor ID */
export function generateId(): string {
  return `el_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;
}

// =============================================================================
// Shape to Path Conversion
// =============================================================================

const KAPPA = 0.5522847498; // Bezier approximation of a quarter circle

/**
 * Convert a basic SVG shape element's attributes to an equivalent path d-attribute.
 * Supports: rect, circle, ellipse, line, polygon, polyline
 */
export function shapeToPathD(tag: string, attrs: Record<string, string>): string {
  const num = (key: string, fb = 0) => Number.parseFloat(attrs[key] ?? String(fb)) || fb;

  switch (tag) {
    case 'rect': {
      const x = num('x');
      const y = num('y');
      const w = num('width');
      const h = num('height');
      const rx = num('rx');
      const ry = num('ry', rx); // If ry not specified, use rx

      if (rx > 0 || ry > 0) {
        // Rounded rect using cubic bezier arcs
        const rxi = Math.min(rx, w / 2);
        const ryi = Math.min(ry, h / 2);
        return [
          `M ${x + rxi} ${y}`,
          `L ${x + w - rxi} ${y}`,
          `C ${x + w} ${y}, ${x + w} ${y + ryi}, ${x + w} ${y + ryi}`,
          `L ${x + w} ${y + h - ryi}`,
          `C ${x + w} ${y + h}, ${x + w - rxi} ${y + h}, ${x + w - rxi} ${y + h}`,
          `L ${x + rxi} ${y + h}`,
          `C ${x} ${y + h}, ${x} ${y + h - ryi}, ${x} ${y + h - ryi}`,
          `L ${x} ${y + ryi}`,
          `C ${x} ${y}, ${x + rxi} ${y}, ${x + rxi} ${y}`,
          'Z',
        ].join(' ');
      }

      return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
    }

    case 'circle': {
      const cx = num('cx');
      const cy = num('cy');
      const r = num('r');
      const kr = r * KAPPA;
      return [
        `M ${cx + r} ${cy}`,
        `C ${cx + r} ${cy + kr}, ${cx + kr} ${cy + r}, ${cx} ${cy + r}`,
        `C ${cx - kr} ${cy + r}, ${cx - r} ${cy + kr}, ${cx - r} ${cy}`,
        `C ${cx - r} ${cy - kr}, ${cx - kr} ${cy - r}, ${cx} ${cy - r}`,
        `C ${cx + kr} ${cy - r}, ${cx + r} ${cy - kr}, ${cx + r} ${cy}`,
        'Z',
      ].join(' ');
    }

    case 'ellipse': {
      const cx = num('cx');
      const cy = num('cy');
      const rx = num('rx');
      const ry = num('ry');
      const krx = rx * KAPPA;
      const kry = ry * KAPPA;
      return [
        `M ${cx + rx} ${cy}`,
        `C ${cx + rx} ${cy + kry}, ${cx + krx} ${cy + ry}, ${cx} ${cy + ry}`,
        `C ${cx - krx} ${cy + ry}, ${cx - rx} ${cy + kry}, ${cx - rx} ${cy}`,
        `C ${cx - rx} ${cy - kry}, ${cx - krx} ${cy - ry}, ${cx} ${cy - ry}`,
        `C ${cx + krx} ${cy - ry}, ${cx + rx} ${cy - kry}, ${cx + rx} ${cy}`,
        'Z',
      ].join(' ');
    }

    case 'line': {
      const x1 = num('x1');
      const y1 = num('y1');
      const x2 = num('x2');
      const y2 = num('y2');
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    case 'polygon':
    case 'polyline': {
      const points = attrs.points?.trim();
      if (!points) return '';
      const coords = points.split(/[\s,]+/).map(Number);
      if (coords.length < 4) return '';
      const parts: string[] = [`M ${coords[0]} ${coords[1]}`];
      for (let i = 2; i < coords.length - 1; i += 2) {
        parts.push(`L ${coords[i]} ${coords[i + 1]}`);
      }
      if (tag === 'polygon') parts.push('Z');
      return parts.join(' ');
    }

    default:
      return '';
  }
}
