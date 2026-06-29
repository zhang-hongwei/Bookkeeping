/**
 * Low Poly Grid Generator - Generates low poly triangle grid
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { LayeredConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import type { SeededRandom } from '../../lib/algorithms/random';

export class LowPolyGridGenerator extends BaseGenerator<LayeredConfig> {
  readonly type = 'lowPolyGrid';
  readonly name = 'Low Poly Grid';
  readonly description = 'Generate low poly triangle grid pattern';
  readonly icon = 'GridOn';
  readonly category = 'scenes';

  readonly defaultConfig: Partial<LayeredConfig> = {
    layers: 8, // cell size
    amplitude: 30, // randomness
    smoothness: 50, // not used
    gap: 0,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Fine',
      config: { layers: 12, amplitude: 20, smoothness: 50, gap: 0 },
    },
    {
      name: 'Coarse',
      config: { layers: 5, amplitude: 40, smoothness: 50, gap: 0 },
    },
    {
      name: 'Chaotic',
      config: { layers: 8, amplitude: 60, smoothness: 50, gap: 0 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'layers', label: 'Cell Size', type: 'slider', min: 4, max: 20, step: 1, defaultValue: 8 },
    { key: 'amplitude', label: 'Randomness', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 30 },
  ];

  generate(config: LayeredConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);
    svg.background(background);

    const cellSize = Math.max(width, height) / config.layers;
    const randomness = config.amplitude / 100;

    // Generate triangulation points
    const cols = Math.ceil(width / cellSize) + 1;
    const rows = Math.ceil(height / cellSize) + 1;
    const points: Array<Array<{ x: number; y: number }>> = [];

    for (let row = 0; row < rows; row++) {
      points[row] = [];
      for (let col = 0; col < cols; col++) {
        const baseX = col * cellSize;
        const baseY = row * cellSize;
        const offsetX = (random.next() - 0.5) * cellSize * randomness;
        const offsetY = (random.next() - 0.5) * cellSize * randomness;

        points[row][col] = {
          x: Math.max(0, Math.min(width, baseX + offsetX)),
          y: Math.max(0, Math.min(height, baseY + offsetY)),
        };
      }
    }

    // Generate triangles
    let colorIndex = 0;
    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const p1 = points[row][col];
        const p2 = points[row][col + 1];
        const p3 = points[row + 1][col + 1];
        const p4 = points[row + 1][col];

        // Two triangles per cell
        const color1 = fills[colorIndex % fills.length];
        colorIndex++;

        const color2 = fills[colorIndex % fills.length];
        colorIndex++;

        if (config.variant === 'outline') {
          svg.polygon([p1, p2, p3], {
            fill: 'none',
            stroke: color1,
            'stroke-width': 1,
          });
          svg.polygon([p1, p3, p4], {
            fill: 'none',
            stroke: color2,
            'stroke-width': 1,
          });
        } else {
          svg.polygon([p1, p2, p3], {
            fill: color1,
            opacity: random.range(0.7, 1),
          });
          svg.polygon([p1, p3, p4], {
            fill: color2,
            opacity: random.range(0.7, 1),
          });
        }
      }
    }

    return svg.build();
  }
}
