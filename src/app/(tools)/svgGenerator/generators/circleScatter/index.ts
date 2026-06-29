/**
 * Circle Scatter Generator - Generates scattered circles
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { ScatterConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import { generateScatterPoints } from '../../lib/svg/pathUtils';

export class CircleScatterGenerator extends BaseGenerator<ScatterConfig> {
  readonly type = 'circleScatter';
  readonly name = 'Circle Scatter';
  readonly description = 'Generate scattered circles';
  readonly icon = 'ScatterPlot';
  readonly category = 'scatters';

  readonly defaultConfig: Partial<ScatterConfig> = {
    count: 20,
    minSize: 10,
    maxSize: 80,
    spread: 80,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Sparse',
      config: { count: 10, minSize: 20, maxSize: 100, spread: 100 },
    },
    {
      name: 'Dense',
      config: { count: 50, minSize: 5, maxSize: 40, spread: 60 },
    },
    {
      name: 'Uniform',
      config: { count: 30, minSize: 30, maxSize: 30, spread: 80 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'count', label: 'Count', type: 'slider', min: 5, max: 100, step: 1, defaultValue: 20 },
    { key: 'minSize', label: 'Min Size', type: 'slider', min: 5, max: 50, step: 1, defaultValue: 10 },
    { key: 'maxSize', label: 'Max Size', type: 'slider', min: 20, max: 200, step: 1, defaultValue: 80 },
    { key: 'spread', label: 'Spread', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 80 },
  ];

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

    points.forEach((point, index) => {
      const color = fills[index % fills.length];
      if (config.variant === 'outline') {
        svg.circle(point.x, point.y, point.size, {
          fill: 'none',
          stroke: color,
          'stroke-width': 2,
        });
      } else {
        svg.circle(point.x, point.y, point.size, {
          fill: color,
          opacity: random.range(0.6, 1),
        });
      }
    });

    return svg.build();
  }
}
