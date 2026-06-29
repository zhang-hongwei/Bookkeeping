/**
 * Blob Scene Generator - Generates a scene with multiple blobs
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { ScatterConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import { generateBlobPath } from '../../lib/svg/pathUtils';

export class BlobSceneGenerator extends BaseGenerator<ScatterConfig> {
  readonly type = 'blobScene';
  readonly name = 'Blob Scene';
  readonly description = 'Generate a scene with multiple organic blobs';
  readonly icon = 'Nature';
  readonly category = 'scenes';

  readonly defaultConfig: Partial<ScatterConfig> = {
    count: 8,
    minSize: 40,
    maxSize: 150,
    spread: 60,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Minimal',
      config: { count: 4, minSize: 60, maxSize: 200, spread: 40 },
    },
    {
      name: 'Crowded',
      config: { count: 15, minSize: 30, maxSize: 100, spread: 80 },
    },
    {
      name: 'Floating',
      config: { count: 6, minSize: 50, maxSize: 180, spread: 50 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'count', label: 'Blob Count', type: 'slider', min: 3, max: 20, step: 1, defaultValue: 8 },
    { key: 'minSize', label: 'Min Size', type: 'slider', min: 20, max: 80, step: 1, defaultValue: 40 },
    { key: 'maxSize', label: 'Max Size', type: 'slider', min: 60, max: 250, step: 1, defaultValue: 150 },
    { key: 'spread', label: 'Spread', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 60 },
  ];

  generate(config: ScatterConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);
    svg.background(background);

    // Generate blobs with varying sizes
    const blobs: Array<{ x: number; y: number; size: number }> = [];
    for (let i = 0; i < config.count; i++) {
      blobs.push({
        x: random.range(config.maxSize, width - config.maxSize),
        y: random.range(config.maxSize, height - config.maxSize),
        size: random.range(config.minSize, config.maxSize),
      });
    }

    // Sort by size (largest first for better layering)
    blobs.sort((a, b) => b.size - a.size);

    blobs.forEach((blob, index) => {
      const color = fills[index % fills.length];
      const blobPath = generateBlobPath(blob.x, blob.y, blob.size, random, {
        complexity: random.int(7, 12),
        contrast: random.range(40, 80),
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
          opacity: random.range(0.7, 0.95),
        });
      }
    });

    return svg.build();
  }
}
