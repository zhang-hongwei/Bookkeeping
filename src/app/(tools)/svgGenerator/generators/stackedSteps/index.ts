/**
 * Stacked Steps Generator - Generates stacked step patterns
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { LayeredConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import type { SeededRandom } from '../../lib/algorithms/random';

export class StackedStepsGenerator extends BaseGenerator<LayeredConfig> {
  readonly type = 'stackedSteps';
  readonly name = 'Stacked Steps';
  readonly description = 'Generate stacked step patterns';
  readonly icon = 'ViewWeek';
  readonly category = 'scenes';

  readonly defaultConfig: Partial<LayeredConfig> = {
    layers: 6,
    amplitude: 80,
    smoothness: 10,
    gap: 8,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Cityscape',
      config: { layers: 8, amplitude: 100, smoothness: 5, gap: 5 },
    },
    {
      name: 'Horizon',
      config: { layers: 5, amplitude: 60, smoothness: 15, gap: 12 },
    },
    {
      name: 'Abstract',
      config: { layers: 10, amplitude: 120, smoothness: 0, gap: 3 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'layers', label: 'Layers', type: 'slider', min: 3, max: 12, step: 1, defaultValue: 6 },
    { key: 'amplitude', label: 'Height', type: 'slider', min: 20, max: 150, step: 1, defaultValue: 80 },
    { key: 'smoothness', label: 'Corner Radius', type: 'slider', min: 0, max: 50, step: 1, defaultValue: 10 },
    { key: 'gap', label: 'Gap', type: 'slider', min: 0, max: 30, step: 1, defaultValue: 8 },
  ];

  generate(config: LayeredConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);
    svg.background(background);

    const layers = this.generateSteps(width, height, config, random);

    layers.forEach((layer, index) => {
      const color = fills[index % fills.length];

      if (config.variant === 'outline') {
        svg.path(layer.path, {
          fill: 'none',
          stroke: color,
          'stroke-width': 2,
        });
      } else {
        svg.path(layer.path, {
          fill: color,
          opacity: 0.9,
        });
      }
    });

    return svg.build();
  }

  private generateSteps(
    width: number,
    height: number,
    config: LayeredConfig,
    random: SeededRandom
  ) {
    const results: Array<{ path: string; y: number }> = [];
    const baseSpacing = height / (config.layers + 1);

    for (let i = 0; i < config.layers; i++) {
      const baseY = height - (i + 1) * baseSpacing - config.gap * i;
      const numSteps = random.int(5, 12);
      const stepWidth = width / numSteps;

      // Build path
      const pathParts: string[] = [`M 0 ${height}`, `L 0 ${baseY}`];

      for (let j = 0; j <= numSteps; j++) {
        const x = j * stepWidth;
        const stepHeight = j < numSteps ? random.range(config.amplitude * 0.2, config.amplitude) : 0;
        const y = baseY - stepHeight;

        if (j > 0) {
          // Add vertical step
          pathParts.push(`L ${x} ${baseY - (j > 0 ? random.range(config.amplitude * 0.2, config.amplitude * 0.5) : 0)}`);
          if (j < numSteps) {
            pathParts.push(`L ${x} ${y}`);
          }
        }
      }

      pathParts.push(`L ${width} ${baseY}`);
      pathParts.push(`L ${width} ${height}`);
      pathParts.push('Z');

      results.push({ path: pathParts.join(' '), y: baseY });
    }

    return results;
  }
}
