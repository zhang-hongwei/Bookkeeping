/**
 * Blob Scatter Generator - Generates scattered blob shapes
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { ScatterConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import { generateScatterPoints, generateBlobPath } from '../../lib/svg/pathUtils';

export class BlobScatterGenerator extends BaseGenerator<ScatterConfig> {
  readonly type = 'blobScatter';
  readonly name = 'Blob Scatter';
  readonly description = 'Generate scattered blob shapes';
  readonly icon = 'BlurOn';
  readonly category = 'scatters';

  readonly defaultConfig: Partial<ScatterConfig> = {
    count: 15,
    minSize: 20,
    maxSize: 100,
    spread: 70,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Bubbles',
      config: { count: 12, minSize: 30, maxSize: 80, spread: 60 },
    },
    {
      name: 'Cells',
      config: { count: 25, minSize: 15, maxSize: 50, spread: 80 },
    },
    {
      name: 'Organisms',
      config: { count: 8, minSize: 40, maxSize: 120, spread: 50 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'count', label: 'Count', type: 'slider', min: 5, max: 50, step: 1, defaultValue: 15 },
    { key: 'minSize', label: 'Min Size', type: 'slider', min: 10, max: 60, step: 1, defaultValue: 20 },
    { key: 'maxSize', label: 'Max Size', type: 'slider', min: 30, max: 150, step: 1, defaultValue: 100 },
    { key: 'spread', label: 'Spread', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 70 },
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
      const blobPath = generateBlobPath(point.x, point.y, point.size, random, {
        complexity: random.int(6, 10),
        contrast: random.range(30, 70),
      });

      if (config.variant === 'outline') {
        svg.path(blobPath, {
          fill: 'none',
          stroke: color,
          'stroke-width': 2,
        });
      } else {
        svg.path(blobPath, {
          fill: color,
          opacity: random.range(0.7, 1),
        });
      }
    });

    return svg.build();
  }
}
