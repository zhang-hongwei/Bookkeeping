/**
 * Trianglify Generator
 * Creates triangle mesh patterns with customizable colors
 */

import type { TrianglifyConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { BaseBackgroundGenerator, registerBackgroundGenerator } from '../BaseBackgroundGenerator';
import {
  generateGridPoints,
  triangulate,
  type Point,
  type Triangle,
} from '../../lib/algorithms/delaunay';
import type { SeededRandom } from '../../lib/algorithms/random';
import * as chroma from 'chroma-js';

export class TrianglifyGenerator extends BaseBackgroundGenerator<TrianglifyConfig> {
  readonly type = 'trianglify' as const;
  readonly name = 'Trianglify';
  readonly description = 'Triangle mesh patterns with customizable colors';
  readonly icon = 'ChangeHistory';
  readonly supportsSVG = true;

  readonly defaultConfig: Partial<TrianglifyConfig> = {
    cellSize: 75,
    variance: 50,
    bleed: 0,
    strokeWidth: 0,
    strokeColor: '#000000',
    fillOpacity: 100,
    colors: {
      background: '#1a1a2e',
      palette: ['#16213e', '#0f3460', '#e94560', '#533483'],
    },
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Subtle Mesh',
      config: {
        cellSize: 100,
        variance: 30,
        strokeWidth: 0,
        colors: { background: '#ffffff', palette: ['#f5f5f5', '#e0e0e0', '#bdbdbd'] },
      },
    },
    {
      name: 'Vibrant',
      config: {
        cellSize: 60,
        variance: 70,
        colors: { background: '#2d3436', palette: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'] },
      },
    },
    {
      name: 'Night Sky',
      config: {
        cellSize: 80,
        variance: 40,
        colors: {
          background: '#050510',
          palette: ['#0c0c1e', '#1a1a3e', '#2d2d5a', '#4a4a8a'],
        },
      },
    },
    {
      name: 'Sunset',
      config: {
        cellSize: 90,
        variance: 50,
        colors: {
          background: '#1a0a0a',
          palette: ['#ff7e5f', '#feb47b', '#ff6a88', '#ff99ac'],
        },
      },
    },
    {
      name: 'Ocean',
      config: {
        cellSize: 70,
        variance: 45,
        colors: {
          background: '#0a1628',
          palette: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
        },
      },
    },
    {
      name: 'Forest',
      config: {
        cellSize: 65,
        variance: 55,
        colors: {
          background: '#1a2e1a',
          palette: ['#2d5a27', '#4a7c31', '#6b8e23', '#8fbc8f'],
        },
      },
    },
    {
      name: 'Wireframe',
      config: {
        cellSize: 50,
        variance: 30,
        fillOpacity: 0,
        strokeWidth: 1,
        strokeColor: '#00ff88',
        colors: { background: '#0a0a0a', palette: ['#000000'] },
      },
    },
    {
      name: 'Cyberpunk',
      config: {
        cellSize: 55,
        variance: 60,
        strokeWidth: 0.5,
        strokeColor: '#ff00ff',
        colors: {
          background: '#0d0221',
          palette: ['#ff00ff', '#00ffff', '#ff6600', '#ffff00'],
        },
      },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'cellSize',
      label: 'Cell Size',
      type: 'slider',
      min: 20,
      max: 200,
      step: 5,
      defaultValue: 75,
    },
    {
      key: 'variance',
      label: 'Variance',
      type: 'slider',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    },
    {
      key: 'bleed',
      label: 'Color Bleed',
      type: 'slider',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 0,
    },
    {
      key: 'strokeWidth',
      label: 'Stroke Width',
      type: 'slider',
      min: 0,
      max: 5,
      step: 0.5,
      defaultValue: 0,
    },
    {
      key: 'strokeColor',
      label: 'Stroke Color',
      type: 'color',
      defaultValue: '#000000',
    },
    {
      key: 'fillOpacity',
      label: 'Fill Opacity',
      type: 'slider',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 100,
    },
  ];

  generateCanvas(config: TrianglifyConfig, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = config.canvas;
    canvas.width = width;
    canvas.height = height;

    const random = this.getRandom(config);

    // Clear and set background
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, width, height);

    // Generate points for triangulation
    const points = generateGridPoints(width, height, config.cellSize, config.variance, () =>
      random.next()
    );

    // Perform Delaunay triangulation
    const triangles = triangulate(points);

    // Draw triangles
    triangles.forEach((triangle) => {
      const color = this.getTriangleColor(triangle, config, random);

      ctx.beginPath();
      ctx.moveTo(triangle.p1.x, triangle.p1.y);
      ctx.lineTo(triangle.p2.x, triangle.p2.y);
      ctx.lineTo(triangle.p3.x, triangle.p3.y);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.globalAlpha = config.fillOpacity / 100;
      ctx.fill();

      if (config.strokeWidth > 0) {
        ctx.strokeStyle = config.strokeColor;
        ctx.lineWidth = config.strokeWidth;
        ctx.globalAlpha = 1;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    });
  }

  generateSVG(config: TrianglifyConfig): string {
    const { width, height } = config.canvas;
    const random = this.getRandom(config);

    const points = generateGridPoints(width, height, config.cellSize, config.variance, () =>
      random.next()
    );
    const triangles = triangulate(points);

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="100%" height="100%" fill="${config.colors.background}"/>
<defs>`;

    // Add gradient definitions for bleed effect
    if (config.bleed > 0) {
      svg += `<filter id="blur"><feGaussianBlur stdDeviation="${config.bleed / 10}"/></filter>`;
    }

    svg += `</defs>`;

    if (config.bleed > 0) {
      svg += `<g filter="url(#blur)">`;
    }

    triangles.forEach((triangle) => {
      const color = this.getTriangleColor(triangle, config, random);
      const opacity = config.fillOpacity / 100;

      const pointsStr = `${triangle.p1.x},${triangle.p1.y} ${triangle.p2.x},${triangle.p2.y} ${triangle.p3.x},${triangle.p3.y}`;

      svg += `<polygon points="${pointsStr}" fill="${color}" fill-opacity="${opacity}"`;

      if (config.strokeWidth > 0) {
        svg += ` stroke="${config.strokeColor}" stroke-width="${config.strokeWidth}"`;
      }

      svg += `/>`;
    });

    if (config.bleed > 0) {
      svg += `</g>`;
    }

    svg += `</svg>`;
    return svg;
  }

  private getTriangleColor(
    triangle: Triangle,
    config: TrianglifyConfig,
    random: SeededRandom
  ): string {
    const { width, height } = config.canvas;
    const { centroid } = triangle;
    const palette = config.colors.palette;

    if (palette.length === 0) {
      return '#000000';
    }

    if (palette.length === 1) {
      return palette[0];
    }

    // Create color gradient based on position
    const xRatio = centroid.x / width;
    const yRatio = centroid.y / height;

    // Interpolate between palette colors
    const colorIndex = (xRatio + yRatio) / 2 * (palette.length - 1);
    const lowerIndex = Math.floor(colorIndex);
    const upperIndex = Math.min(lowerIndex + 1, palette.length - 1);
    const t = colorIndex - lowerIndex;

    // Add some randomness
    if (random.bool(0.3)) {
      return random.pick(palette);
    }

    // Blend colors
    if (lowerIndex === upperIndex) {
      return palette[lowerIndex];
    }

    try {
      const color1 = chroma.default(palette[lowerIndex]);
      const color2 = chroma.default(palette[upperIndex]);
      return chroma.default.mix(color1, color2, t).hex();
    } catch {
      return palette[lowerIndex];
    }
  }
}

// Register generator
const trianglifyGenerator = new TrianglifyGenerator();
registerBackgroundGenerator(trianglifyGenerator);

export { trianglifyGenerator };
