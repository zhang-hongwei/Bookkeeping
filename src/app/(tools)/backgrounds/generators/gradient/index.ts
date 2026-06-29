/**
 * Gradient Generator
 * Creates linear, radial, and conic gradient backgrounds
 */

import type { GradientConfig, GradientStop, GeneratorPreset, GeneratorControl } from '../../types';
import { BaseBackgroundGenerator, registerBackgroundGenerator } from '../BaseBackgroundGenerator';

export class GradientGenerator extends BaseBackgroundGenerator<GradientConfig> {
  readonly type = 'gradient' as const;
  readonly name = 'Gradient';
  readonly description = 'Multi-color gradient backgrounds';
  readonly icon = 'Gradient';
  readonly supportsSVG = true;

  readonly defaultConfig: Partial<GradientConfig> = {
    type: 'linear',
    angle: 135,
    centerX: 50,
    centerY: 50,
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 50 },
      { color: '#f093fb', position: 100 },
    ],
    smoothing: true,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Sunset',
      config: {
        type: 'linear',
        angle: 135,
        stops: [
          { color: '#ff512f', position: 0 },
          { color: '#f09819', position: 100 },
        ],
      },
    },
    {
      name: 'Ocean Blue',
      config: {
        type: 'linear',
        angle: 180,
        stops: [
          { color: '#2193b0', position: 0 },
          { color: '#6dd5ed', position: 100 },
        ],
      },
    },
    {
      name: 'Purple Haze',
      config: {
        type: 'radial',
        stops: [
          { color: '#7b4397', position: 0 },
          { color: '#dc2430', position: 100 },
        ],
      },
    },
    {
      name: 'Northern Lights',
      config: {
        type: 'linear',
        angle: 45,
        stops: [
          { color: '#43e97b', position: 0 },
          { color: '#38f9d7', position: 50 },
          { color: '#fa709a', position: 100 },
        ],
      },
    },
    {
      name: 'Midnight',
      config: {
        type: 'radial',
        stops: [
          { color: '#232526', position: 0 },
          { color: '#414345', position: 100 },
        ],
      },
    },
    {
      name: 'Cherry',
      config: {
        type: 'linear',
        angle: 90,
        stops: [
          { color: '#eb3349', position: 0 },
          { color: '#f45c43', position: 100 },
        ],
      },
    },
    {
      name: 'Deep Sea',
      config: {
        type: 'radial',
        stops: [
          { color: '#4b6cb7', position: 0 },
          { color: '#182848', position: 100 },
        ],
      },
    },
    {
      name: 'Warm Flame',
      config: {
        type: 'linear',
        angle: 45,
        stops: [
          { color: '#ff9a9e', position: 0 },
          { color: '#fecfef', position: 50 },
          { color: '#fecfef', position: 100 },
        ],
      },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'linear', label: 'Linear' },
        { value: 'radial', label: 'Radial' },
        { value: 'conic', label: 'Conic' },
      ],
      defaultValue: 'linear',
    },
    {
      key: 'angle',
      label: 'Angle',
      type: 'slider',
      min: 0,
      max: 360,
      step: 15,
      defaultValue: 135,
    },
    {
      key: 'centerX',
      label: 'Center X',
      type: 'slider',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    },
    {
      key: 'centerY',
      label: 'Center Y',
      type: 'slider',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    },
    {
      key: 'smoothing',
      label: 'Color Smoothing',
      type: 'toggle',
      defaultValue: true,
    },
  ];

  generateCanvas(config: GradientConfig, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = config.canvas;
    canvas.width = width;
    canvas.height = height;

    let gradient: CanvasGradient;

    switch (config.type) {
      case 'linear':
        gradient = this.createLinearGradient(ctx, config, width, height);
        break;
      case 'radial':
        gradient = this.createRadialGradient(ctx, config, width, height);
        break;
      case 'conic':
        // Canvas doesn't support conic natively, use radial as fallback
        // or draw manually with paths
        gradient = this.createConicGradientFallback(ctx, config, width, height);
        break;
      default:
        gradient = this.createLinearGradient(ctx, config, width, height);
    }

    // Add color stops
    config.stops.forEach((stop) => {
      gradient.addColorStop(stop.position / 100, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  generateSVG(config: GradientConfig): string {
    const { width, height } = config.canvas;
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>`;

    const stops = config.stops
      .map((s) => `<stop offset="${s.position}%" stop-color="${s.color}"/>`)
      .join('');

    if (config.type === 'linear') {
      const angleRad = ((config.angle - 90) * Math.PI) / 180;
      const x1 = 50 - Math.cos(angleRad) * 50;
      const y1 = 50 - Math.sin(angleRad) * 50;
      const x2 = 50 + Math.cos(angleRad) * 50;
      const y2 = 50 + Math.sin(angleRad) * 50;
      svg += `<linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
    } else if (config.type === 'radial') {
      svg += `<radialGradient id="grad" cx="${config.centerX}%" cy="${config.centerY}%" r="50%">${stops}</radialGradient>`;
    } else {
      // Conic gradient - SVG doesn't support natively, use linear fallback
      svg += `<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">${stops}</linearGradient>`;
    }

    svg += `</defs>`;
    svg += `<rect width="100%" height="100%" fill="url(#grad)"/>`;
    svg += `</svg>`;

    return svg;
  }

  private createLinearGradient(
    ctx: CanvasRenderingContext2D,
    config: GradientConfig,
    width: number,
    height: number
  ): CanvasGradient {
    const angleRad = ((config.angle - 90) * Math.PI) / 180;
    const length = Math.sqrt(width * width + height * height) / 2;

    const centerX = width / 2;
    const centerY = height / 2;

    const x1 = centerX - Math.cos(angleRad) * length;
    const y1 = centerY - Math.sin(angleRad) * length;
    const x2 = centerX + Math.cos(angleRad) * length;
    const y2 = centerY + Math.sin(angleRad) * length;

    return ctx.createLinearGradient(x1, y1, x2, y2);
  }

  private createRadialGradient(
    ctx: CanvasRenderingContext2D,
    config: GradientConfig,
    width: number,
    height: number
  ): CanvasGradient {
    const cx = (config.centerX / 100) * width;
    const cy = (config.centerY / 100) * height;
    const radius = Math.max(width, height);

    return ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  }

  private createConicGradientFallback(
    ctx: CanvasRenderingContext2D,
    config: GradientConfig,
    width: number,
    height: number
  ): CanvasGradient {
    // Fallback to radial gradient for conic
    return this.createRadialGradient(ctx, config, width, height);
  }

  /**
   * Generate CSS gradient code
   */
  generateCSS(config: GradientConfig): string {
    const stops = config.stops.map((s) => `${s.color} ${s.position}%`).join(', ');

    switch (config.type) {
      case 'linear':
        return `linear-gradient(${config.angle}deg, ${stops})`;
      case 'radial':
        return `radial-gradient(circle at ${config.centerX}% ${config.centerY}%, ${stops})`;
      case 'conic':
        return `conic-gradient(from ${config.angle}deg at ${config.centerX}% ${config.centerY}%, ${stops})`;
      default:
        return `linear-gradient(${stops})`;
    }
  }
}

// Register generator
const gradientGenerator = new GradientGenerator();
registerBackgroundGenerator(gradientGenerator);

export { gradientGenerator };
