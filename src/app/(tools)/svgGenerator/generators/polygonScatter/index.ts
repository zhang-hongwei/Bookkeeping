/**
 * Polygon Scatter Generator - Generates scattered polygons
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { ScatterConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import type { SeededRandom } from '../../lib/algorithms/random';

export class PolygonScatterGenerator extends BaseGenerator<ScatterConfig> {
  readonly type = 'polygonScatter';
  readonly name = 'Polygon Scatter';
  readonly description = 'Generate scattered polygon shapes';
  readonly icon = 'Pentagon';
  readonly category = 'scatters';

  readonly defaultConfig: Partial<ScatterConfig> = {
    count: 15,
    minSize: 20,
    maxSize: 80,
    spread: 75,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Triangles',
      config: { count: 20, minSize: 15, maxSize: 50, spread: 80 },
    },
    {
      name: 'Hexagons',
      config: { count: 12, minSize: 30, maxSize: 100, spread: 70 },
    },
    {
      name: 'Mixed',
      config: { count: 25, minSize: 10, maxSize: 60, spread: 90 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'count', label: 'Count', type: 'slider', min: 5, max: 50, step: 1, defaultValue: 15 },
    { key: 'minSize', label: 'Min Size', type: 'slider', min: 10, max: 50, step: 1, defaultValue: 20 },
    { key: 'maxSize', label: 'Max Size', type: 'slider', min: 30, max: 150, step: 1, defaultValue: 80 },
    { key: 'spread', label: 'Spread', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 75 },
  ];

  generate(config: ScatterConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);
    svg.background(background);

    // Generate points
    for (let i = 0; i < config.count; i++) {
      const x = random.range(config.maxSize, width - config.maxSize);
      const y = random.range(config.maxSize, height - config.maxSize);
      const size = random.range(config.minSize, config.maxSize);
      const sides = random.int(3, 8);
      const rotation = random.angle();

      const color = fills[i % fills.length];
      const polygon = this.generatePolygon(x, y, size, sides, rotation);

      if (config.variant === 'outline') {
        svg.polygon(polygon, {
          fill: 'none',
          stroke: color,
          'stroke-width': 2,
        });
      } else {
        svg.polygon(polygon, {
          fill: color,
          opacity: random.range(0.6, 1),
        });
      }
    }

    return svg.build();
  }

  private generatePolygon(
    cx: number,
    cy: number,
    radius: number,
    sides: number,
    rotation: number
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    const angleStep = (Math.PI * 2) / sides;

    for (let i = 0; i < sides; i++) {
      const angle = rotation + i * angleStep - Math.PI / 2;
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }

    return points;
  }
}
