/**
 * Symbol Scatter Generator - Generates scattered symbols/icons
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { ScatterConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import { generateScatterPoints } from '../../lib/svg/pathUtils';

export class SymbolScatterGenerator extends BaseGenerator<ScatterConfig> {
  readonly type = 'symbolScatter';
  readonly name = 'Symbol Scatter';
  readonly description = 'Generate scattered symbols and icons';
  readonly icon = 'Stars';
  readonly category = 'scatters';

  readonly defaultConfig: Partial<ScatterConfig> = {
    count: 20,
    minSize: 15,
    maxSize: 50,
    spread: 70,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Stars',
      config: { count: 25, minSize: 10, maxSize: 40, spread: 80 },
    },
    {
      name: 'Hearts',
      config: { count: 15, minSize: 20, maxSize: 60, spread: 60 },
    },
    {
      name: 'Diamonds',
      config: { count: 30, minSize: 8, maxSize: 35, spread: 90 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'count', label: 'Count', type: 'slider', min: 5, max: 60, step: 1, defaultValue: 20 },
    { key: 'minSize', label: 'Min Size', type: 'slider', min: 5, max: 40, step: 1, defaultValue: 15 },
    { key: 'maxSize', label: 'Max Size', type: 'slider', min: 20, max: 100, step: 1, defaultValue: 50 },
    { key: 'spread', label: 'Spread', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 70 },
  ];

  private symbolPaths = {
    star: (cx: number, cy: number, size: number): string => {
      const points: Array<{ x: number; y: number }> = [];
      const outerRadius = size;
      const innerRadius = size * 0.4;
      const spikes = 5;

      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        });
      }

      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    },

    heart: (cx: number, cy: number, size: number): string => {
      const s = size * 0.6;
      const x = cx;
      const y = cy - s * 0.2;
      return `M ${x} ${y + s * 0.3}
              C ${x} ${y - s * 0.3}, ${x - s} ${y - s * 0.3}, ${x - s} ${y + s * 0.1}
              C ${x - s} ${y + s * 0.6}, ${x} ${y + s}, ${x} ${y + s * 1.2}
              C ${x} ${y + s}, ${x + s} ${y + s * 0.6}, ${x + s} ${y + s * 0.1}
              C ${x + s} ${y - s * 0.3}, ${x} ${y - s * 0.3}, ${x} ${y + s * 0.3}
              Z`;
    },

    diamond: (cx: number, cy: number, size: number): string => {
      const s = size;
      return `M ${cx} ${cy - s} L ${cx + s * 0.7} ${cy} L ${cx} ${cy + s} L ${cx - s * 0.7} ${cy} Z`;
    },

    cross: (cx: number, cy: number, size: number): string => {
      const s = size;
      const t = s * 0.3;
      return `M ${cx - t} ${cy - s} L ${cx + t} ${cy - s} L ${cx + t} ${cy - t}
              L ${cx + s} ${cy - t} L ${cx + s} ${cy + t} L ${cx + t} ${cy + t}
              L ${cx + t} ${cy + s} L ${cx - t} ${cy + s} L ${cx - t} ${cy + t}
              L ${cx - s} ${cy + t} L ${cx - s} ${cy - t} L ${cx - t} ${cy - t} Z`;
    },

    hexagon: (cx: number, cy: number, size: number): string => {
      const points: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 2;
        points.push({
          x: cx + Math.cos(angle) * size,
          y: cy + Math.sin(angle) * size,
        });
      }
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    },

    triangle: (cx: number, cy: number, size: number): string => {
      const points: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
        points.push({
          x: cx + Math.cos(angle) * size,
          y: cy + Math.sin(angle) * size,
        });
      }
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    },
  };

  generate(config: ScatterConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);
    svg.background(background);

    const points = generateScatterPoints(width, height, config.count, random, {
      minSize: config.minSize,
      maxSize: config.maxSize,
      spread: config.spread,
      avoidEdges: true,
    });

    const symbolTypes = Object.keys(this.symbolPaths) as Array<keyof typeof this.symbolPaths>;

    points.forEach((point, index) => {
      const color = fills[index % fills.length];
      const symbolType = random.pick(symbolTypes);
      const rotation = random.range(0, 360);

      const symbolPath = this.symbolPaths[symbolType](0, 0, point.size);

      // Create group with transform for rotation
      const transform = `translate(${point.x}, ${point.y}) rotate(${rotation})`;

      if (config.variant === 'outline') {
        svg.group({ transform }, () => {
          svg.raw(`<path d="${symbolPath}" fill="none" stroke="${color}" stroke-width="2"/>`);
        });
      } else {
        svg.group({ transform }, () => {
          svg.raw(`<path d="${symbolPath}" fill="${color}" opacity="${random.range(0.6, 1)}"/>`);
        });
      }
    });

    return svg.build();
  }
}
