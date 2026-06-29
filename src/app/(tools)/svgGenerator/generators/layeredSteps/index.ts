/**
 * Layered Steps Generator - Generates layered step patterns
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { LayeredConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import type { SeededRandom } from '../../lib/algorithms/random';

export class LayeredStepsGenerator extends BaseGenerator<LayeredConfig> {
  readonly type = 'layeredSteps';
  readonly name = 'Layered Steps';
  readonly description = 'Generate layered step patterns';
  readonly icon = 'Stairs';
  readonly category = 'scenes';

  readonly defaultConfig: Partial<LayeredConfig> = {
    layers: 5,
    amplitude: 60,
    smoothness: 30,
    gap: 12,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Staircase',
      config: { layers: 6, amplitude: 80, smoothness: 20, gap: 10 },
    },
    {
      name: 'Terrace',
      config: { layers: 4, amplitude: 50, smoothness: 40, gap: 20 },
    },
    {
      name: 'Zigzag',
      config: { layers: 8, amplitude: 70, smoothness: 10, gap: 8 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'layers', label: 'Layers', type: 'slider', min: 2, max: 10, step: 1, defaultValue: 5 },
    { key: 'amplitude', label: 'Height', type: 'slider', min: 20, max: 100, step: 1, defaultValue: 60 },
    { key: 'smoothness', label: 'Corner Radius', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 30 },
    { key: 'gap', label: 'Gap', type: 'slider', min: 0, max: 50, step: 1, defaultValue: 12 },
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
    const layerHeight = height / (config.layers + 1);

    for (let i = 0; i < config.layers; i++) {
    const baseY = height - (i + 1) * layerHeight;
    const points: Array<{ x: number; y: number }> = [];
    const numSteps = random.int(4, 8);
    const stepWidth = width / numSteps;
    const cornerRadius = (config.smoothness / 100) * (stepWidth * 0.3);

    // Start from bottom left
    points.push({ x: 0, y: height });

    // Generate steps
    for (let j = 0; j <= numSteps; j++) {
      const x1 = j * stepWidth;
      const x2 = (j + 0.5) * stepWidth;
      const stepHeight = random.range(config.amplitude * 0.3, config.amplitude);
      const y = baseY - stepHeight;

      points.push({ x: x1, y: Math.max(0, y) });
    }

    // End at bottom right
    points.push({ x: width, y: height });

    // Build path
    let pathD = `M 0 ${height}`;
    for (let j = 1; j < points.length - 1; j++) {
      const curr = points[j];
      const next = points[j + 1];

      if (j < points.length - 2) {
        pathD += ` L ${curr.x} ${curr.y}`;
        if (cornerRadius > 0) {
          pathD += ` Q ${curr.x + next.y} ${next.x} ${next.y}`;
        } else {
          pathD += ` L ${next.x} ${next.y}`;
        }
      }
    }
    pathD += ` L ${width} ${height} Z`;

    results.push({ path: pathD, y: baseY });
  }

  return results;
  }
}
