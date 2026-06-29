/**
 * Topography Generator
 * Creates contour line style gradient backgrounds
 */

import type { TopographyConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { BaseBackgroundGenerator, registerBackgroundGenerator } from '../BaseBackgroundGenerator';
import { createSimplexNoise, type SimplexNoise } from '../../lib/algorithms/simplexNoise';
import * as chroma from 'chroma-js';

interface ContourPoint {
  x: number;
  y: number;
}

export class TopographyGenerator extends BaseBackgroundGenerator<TopographyConfig> {
  readonly type = 'topography' as const;
  readonly name = 'Gradient Topography';
  readonly description = 'Contour line style gradient backgrounds';
  readonly icon = 'Terrain';
  readonly supportsSVG = true;

  readonly defaultConfig: Partial<TopographyConfig> = {
    layers: 8,
    amplitude: 50,
    frequency: 3,
    strokeWidth: 1.5,
    fillStyle: 'gradient',
    smoothness: 70,
    offset: 50,
    colors: {
      background: '#03045e',
      palette: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
    },
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Ocean Depths',
      config: {
        layers: 12,
        strokeWidth: 1,
        fillStyle: 'gradient',
        colors: { background: '#03045e', palette: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'] },
      },
    },
    {
      name: 'Mountain Range',
      config: {
        layers: 10,
        fillStyle: 'solid',
        amplitude: 60,
        colors: { background: '#74b9ff', palette: ['#2d3436', '#636e72', '#b2bec3', '#dfe6e9'] },
      },
    },
    {
      name: 'Minimal Lines',
      config: {
        layers: 6,
        fillStyle: 'none',
        strokeWidth: 2,
        colors: { background: '#ffeaa7', palette: ['#e17055'] },
      },
    },
    {
      name: 'Aurora',
      config: {
        layers: 15,
        amplitude: 40,
        frequency: 4,
        fillStyle: 'gradient',
        colors: { background: '#0c0c1e', palette: ['#00ff88', '#00ccff', '#9d4edd', '#ff006e'] },
      },
    },
    {
      name: 'Desert Dunes',
      config: {
        layers: 8,
        amplitude: 35,
        frequency: 2,
        fillStyle: 'solid',
        colors: { background: '#f39c12', palette: ['#e67e22', '#d35400', '#a04000', '#6d4c41'] },
      },
    },
    {
      name: 'Fog',
      config: {
        layers: 5,
        fillStyle: 'gradient',
        strokeWidth: 0,
        smoothness: 90,
        colors: { background: '#2c3e50', palette: ['#34495e', '#5d6d7e', '#85929e', '#aab7b8'] },
      },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'layers',
      label: 'Layers',
      type: 'slider',
      min: 3,
      max: 20,
      step: 1,
      defaultValue: 8,
    },
    {
      key: 'amplitude',
      label: 'Amplitude',
      type: 'slider',
      min: 10,
      max: 100,
      step: 5,
      defaultValue: 50,
    },
    {
      key: 'frequency',
      label: 'Frequency',
      type: 'slider',
      min: 1,
      max: 10,
      step: 0.5,
      defaultValue: 3,
    },
    {
      key: 'strokeWidth',
      label: 'Line Width',
      type: 'slider',
      min: 0,
      max: 5,
      step: 0.5,
      defaultValue: 1.5,
    },
    {
      key: 'fillStyle',
      label: 'Fill Style',
      type: 'select',
      options: [
        { value: 'solid', label: 'Solid' },
        { value: 'gradient', label: 'Gradient' },
        { value: 'none', label: 'None (Lines Only)' },
      ],
      defaultValue: 'gradient',
    },
    {
      key: 'smoothness',
      label: 'Smoothness',
      type: 'slider',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 70,
    },
    {
      key: 'offset',
      label: 'Layer Offset',
      type: 'slider',
      min: 10,
      max: 100,
      step: 5,
      defaultValue: 50,
    },
  ];

  generateCanvas(config: TopographyConfig, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = config.canvas;
    canvas.width = width;
    canvas.height = height;

    const noise = createSimplexNoise(config.seed);

    // Background
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, width, height);

    const layerHeight = height / config.layers;
    const baseOffset = (config.offset / 100) * layerHeight;

    // Draw layers from bottom to top
    for (let i = config.layers - 1; i >= 0; i--) {
      const baseY = height - i * baseOffset;
      const colorIndex = i % config.colors.palette.length;

      // Generate contour path using noise
      const points = this.generateContourPoints(width, baseY, config, noise, i);

      ctx.beginPath();
      ctx.moveTo(0, height);

      // Draw smooth curve through points
      if (config.smoothness > 50) {
        this.drawSmoothCurve(ctx, points, config.smoothness / 100);
      } else {
        points.forEach((point, idx) => {
          if (idx === 0) {
            ctx.lineTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      // Fill based on style
      if (config.fillStyle !== 'none') {
        if (config.fillStyle === 'gradient') {
          const gradient = ctx.createLinearGradient(0, baseY - 100, 0, height);
          const color = config.colors.palette[colorIndex];
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, this.darkenColor(color, 0.2));
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = config.colors.palette[colorIndex];
        }
        ctx.fill();
      }

      // Stroke
      if (config.strokeWidth > 0) {
        ctx.strokeStyle = config.colors.palette[colorIndex];
        ctx.lineWidth = config.strokeWidth;
        ctx.stroke();
      }
    }
  }

  generateSVG(config: TopographyConfig): string {
    const { width, height } = config.canvas;
    const noise = createSimplexNoise(config.seed);

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="100%" height="100%" fill="${config.colors.background}"/>
<defs>`;

    // Add gradient definitions
    config.colors.palette.forEach((color, i) => {
      svg += `<linearGradient id="grad${i}" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stop-color="${color}"/>
<stop offset="100%" stop-color="${this.darkenColor(color, 0.2)}"/>
</linearGradient>`;
    });

    svg += `</defs>`;

    const layerHeight = height / config.layers;
    const baseOffset = (config.offset / 100) * layerHeight;

    // Draw layers from bottom to top
    for (let i = config.layers - 1; i >= 0; i--) {
      const baseY = height - i * baseOffset;
      const colorIndex = i % config.colors.palette.length;
      const points = this.generateContourPoints(width, baseY, config, noise, i);

      let pathD = `M 0 ${height}`;
      pathD += this.generateSVGPath(points, config.smoothness / 100);
      pathD += ` L ${width} ${height} Z`;

      const fill =
        config.fillStyle === 'gradient'
          ? `url(#grad${colorIndex})`
          : config.fillStyle === 'solid'
            ? config.colors.palette[colorIndex]
            : 'none';

      const stroke = config.strokeWidth > 0 ? config.colors.palette[colorIndex] : 'none';

      svg += `<path d="${pathD}" fill="${fill}" stroke="${stroke}" stroke-width="${config.strokeWidth}"/>`;
    }

    svg += `</svg>`;
    return svg;
  }

  private generateContourPoints(
    width: number,
    baseY: number,
    config: TopographyConfig,
    noise: SimplexNoise,
    layerIndex: number
  ): ContourPoint[] {
    const points: ContourPoint[] = [];
    const step = Math.max(5, Math.floor(20 - config.smoothness / 10));
    const noiseScale = config.frequency * 0.005;
    const amplitude = config.amplitude;

    for (let x = 0; x <= width; x += step) {
      const noiseValue = noise.noise2D(x * noiseScale, layerIndex * 0.5);
      const y = baseY + noiseValue * amplitude;
      points.push({ x, y });
    }

    return points;
  }

  private drawSmoothCurve(
    ctx: CanvasRenderingContext2D,
    points: ContourPoint[],
    smoothness: number
  ): void {
    if (points.length < 2) return;

    const tension = smoothness * 0.5;

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension * 0.25;
      const cp1y = p1.y + (p2.y - p0.y) * tension * 0.25;
      const cp2x = p2.x - (p3.x - p1.x) * tension * 0.25;
      const cp2y = p2.y - (p3.y - p1.y) * tension * 0.25;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }

  private generateSVGPath(points: ContourPoint[], smoothness: number): string {
    if (points.length < 2) return '';

    const tension = smoothness * 0.5;
    let path = '';

    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        path += ` L ${points[i].x} ${points[i].y}`;
      } else {
        const p0 = points[Math.max(0, i - 2)];
        const p1 = points[i - 1];
        const p2 = points[i];
        const p3 = points[Math.min(points.length - 1, i + 1)];

        const cp1x = p1.x + (p2.x - p0.x) * tension * 0.25;
        const cp1y = p1.y + (p2.y - p0.y) * tension * 0.25;
        const cp2x = p2.x - (p3.x - p1.x) * tension * 0.25;
        const cp2y = p2.y - (p3.y - p1.y) * tension * 0.25;

        path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
      }
    }

    return path;
  }

  private darkenColor(hex: string, amount: number): string {
    try {
      return chroma.default(hex).darken(amount).hex();
    } catch {
      return hex;
    }
  }
}

// Register generator
const topographyGenerator = new TopographyGenerator();
registerBackgroundGenerator(topographyGenerator);

export { topographyGenerator };
