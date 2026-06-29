/**
 * Gradient Editor Utilities
 */

import type {
  ColorStop,
  GradientConfig,
  GradientExportFormat,
  GradientType,
} from './types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Convert HEX color to RGBA string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Convert RGBA string to HEX
 */
export function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Validate if a string is a valid HEX color
 */
export function isValidHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Create a default color stop
 */
export function createDefaultStop(position: number): ColorStop {
  return {
    id: generateId(),
    color: '#667eea',
    position,
    opacity: 1,
  };
}

/**
 * Sort stops by position
 */
export function sortStops(stops: ColorStop[]): ColorStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

/**
 * Build CSS gradient string from config
 */
export function buildGradientCSS(config: GradientConfig): string {
  const sortedStops = sortStops(config.stops);

  const stopsCSS = sortedStops
    .map((stop) => {
      const color =
        stop.opacity < 1 ? hexToRgba(stop.color, stop.opacity) : stop.color;
      if (stop.positionEnd !== undefined) return `${color} ${stop.position}% ${stop.positionEnd}%`;
      return `${color} ${stop.position}%`;
    })
    .join(', ');

  switch (config.type) {
    case 'linear':
      return `linear-gradient(${config.angle}deg, ${stopsCSS})`;
    case 'radial':
      return `radial-gradient(${config.radialShape} ${config.radialSize} at ${config.centerX}% ${config.centerY}%, ${stopsCSS})`;
    case 'conic':
      return `conic-gradient(from ${config.angle}deg at ${config.centerX}% ${config.centerY}%, ${stopsCSS})`;
    default:
      return `linear-gradient(${stopsCSS})`;
  }
}

/**
 * Build CSS background property
 */
export function buildBackgroundCSS(config: GradientConfig): string {
  return `background: ${buildGradientCSS(config)};`;
}

/**
 * Export gradient to different formats
 */
export function exportGradient(
  config: GradientConfig,
  format: GradientExportFormat
): string {
  const css = buildGradientCSS(config);

  switch (format) {
    case 'css':
      return `background: ${css};`;

    case 'mui':
      return `sx={{
  background: '${css}',
}}`;

    case 'tailwind':
      return `// Option 1: Arbitrary value
className="bg-[${css}]"

// Option 2: Tailwind config
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': '${css}',
      },
    },
  },
};`;

    case 'json':
      return JSON.stringify(config, null, 2);

    case 'png':
      return '[PNG export requires canvas rendering]';

    default:
      return css;
  }
}

/**
 * Default gradient configuration
 */
export function createDefaultConfig(): GradientConfig {
  return {
    type: 'linear',
    angle: 135,
    centerX: 50,
    centerY: 50,
    radialShape: 'circle',
    radialSize: 'farthest-corner',
    stops: [
      { id: generateId(), color: '#667eea', position: 0, opacity: 1 },
      { id: generateId(), color: '#764ba2', position: 100, opacity: 1 },
    ],
  };
}

/**
 * Direction presets for quick angle selection
 */
export const DIRECTION_PRESETS = [
  { label: '↑ Top', angle: 0 },
  { label: '↗ Top Right', angle: 45 },
  { label: '→ Right', angle: 90 },
  { label: '↘ Bottom Right', angle: 135 },
  { label: '↓ Bottom', angle: 180 },
  { label: '↙ Bottom Left', angle: 225 },
  { label: '← Left', angle: 270 },
  { label: '↖ Top Left', angle: 315 },
];

/**
 * Gradient preset item type
 */
export interface GradientPresetItem {
  name: string;
  config: Omit<GradientConfig, 'stops'> & {
    stops: Array<Omit<ColorStop, 'id'>>;
  };
}

/**
 * Build a CSS gradient string from preset config (no ids required)
 */
function buildPresetCSS(config: GradientPresetItem['config']): string {
  const stops = config.stops.map((s) => `${s.color} ${s.position}%`).join(', ');
  if (config.type === 'radial') {
    return `radial-gradient(circle at ${config.centerX}% ${config.centerY}%, ${stops})`;
  }
  return `linear-gradient(${config.angle}deg, ${stops})`;
}

/**
 * Gradient presets — CSS strings are pre-computed once at module load
 */
export const GRADIENT_EDITOR_PRESETS: GradientPresetItem[] = [
  {
    name: 'Aurora',
    config: {
      type: 'linear',
      angle: 135,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#667eea', position: 0, opacity: 1 },
        { color: '#764ba2', position: 50, opacity: 1 },
        { color: '#f093fb', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Sunset',
    config: {
      type: 'linear',
      angle: 135,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#fa709a', position: 0, opacity: 1 },
        { color: '#fee140', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Ocean',
    config: {
      type: 'linear',
      angle: 180,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#2193b0', position: 0, opacity: 1 },
        { color: '#6dd5ed', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Forest',
    config: {
      type: 'linear',
      angle: 135,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#134e5e', position: 0, opacity: 1 },
        { color: '#71b280', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Neon',
    config: {
      type: 'linear',
      angle: 135,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#f093fb', position: 0, opacity: 1 },
        { color: '#f5576c', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Cosmic',
    config: {
      type: 'linear',
      angle: 135,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#0f0c29', position: 0, opacity: 1 },
        { color: '#302b63', position: 50, opacity: 1 },
        { color: '#24243e', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Mint',
    config: {
      type: 'linear',
      angle: 135,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#00b09b', position: 0, opacity: 1 },
        { color: '#96c93d', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Peach',
    config: {
      type: 'linear',
      angle: 135,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#ffecd2', position: 0, opacity: 1 },
        { color: '#fcb69f', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Purple Haze',
    config: {
      type: 'radial',
      angle: 0,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#7b4397', position: 0, opacity: 1 },
        { color: '#dc2430', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Deep Sea',
    config: {
      type: 'radial',
      angle: 0,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#4b6cb7', position: 0, opacity: 1 },
        { color: '#182848', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Midnight',
    config: {
      type: 'radial',
      angle: 0,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#232526', position: 0, opacity: 1 },
        { color: '#414345', position: 100, opacity: 1 },
      ],
    },
  },
  {
    name: 'Cherry',
    config: {
      type: 'linear',
      angle: 90,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [
        { color: '#eb3349', position: 0, opacity: 1 },
        { color: '#f45c43', position: 100, opacity: 1 },
      ],
    },
  },
];

/**
 * Pre-computed CSS strings for each preset — avoids IIFE in render
 */
export const PRESET_CSS_MAP = new Map(
  GRADIENT_EDITOR_PRESETS.map((p) => [p.name, buildPresetCSS(p.config)]),
);

/**
 * Export gradient to PNG using Canvas API
 */
export function exportToPNG(config: GradientConfig, filename: string = 'gradient.png'): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  let gradient: CanvasGradient;

  // Create gradient based on type
  if (config.type === 'linear') {
    const angleRad = ((config.angle - 90) * Math.PI) / 180;
    const length = Math.sqrt(width * width + height * height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const x1 = centerX - Math.cos(angleRad) * length;
    const y1 = centerY - Math.sin(angleRad) * length;
    const x2 = centerX + Math.cos(angleRad) * length;
    const y2 = centerY + Math.sin(angleRad) * length;

    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  } else if (config.type === 'radial') {
    const cx = (config.centerX / 100) * width;
    const cy = (config.centerY / 100) * height;
    const radius = Math.max(width, height);

    gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  } else {
    // Conic - fallback to radial for canvas
    const cx = (config.centerX / 100) * width;
    const cy = (config.centerY / 100) * height;
    const radius = Math.max(width, height);

    gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  }

  // Add color stops
  const sortedStops = sortStops(config.stops);
  sortedStops.forEach((stop) => {
    const color =
      stop.opacity < 1 ? hexToRgba(stop.color, stop.opacity) : stop.color;
    gradient.addColorStop(stop.position / 100, color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Download
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
