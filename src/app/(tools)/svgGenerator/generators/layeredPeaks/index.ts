/**
 * Layered Peaks Generator - Generates layered mountain peaks
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { LayeredConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import type { SeededRandom } from '../../lib/algorithms/random';

export class LayeredPeaksGenerator extends BaseGenerator<LayeredConfig> {
  readonly type = 'layeredPeaks';
  readonly name = 'Layered Peaks';
  readonly description = 'Generate layered mountain peaks';
  readonly icon = 'Landscape';
  readonly category = 'scenes';

  readonly defaultConfig: Partial<LayeredConfig> = {
    layers: 4,
    amplitude: 80,
    smoothness: 50,
    gap: 15,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Mountains',
      config: { layers: 5, amplitude: 90, smoothness: 40, gap: 20 },
    },
    {
      name: 'Hills',
      config: { layers: 4, amplitude: 50, smoothness: 70, gap: 15 },
    },
    {
      name: 'Sharp',
      config: { layers: 6, amplitude: 100, smoothness: 20, gap: 10 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'layers', label: 'Layers', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 4 },
    { key: 'amplitude', label: 'Height', type: 'slider', min: 20, max: 150, step: 1, defaultValue: 80 },
    { key: 'smoothness', label: 'Smoothness', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 50 },
    { key: 'gap', label: 'Gap', type: 'slider', min: 0, max: 50, step: 1, defaultValue: 15 },
  ];

  generate(config: LayeredConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);
    svg.background(background);

    const layers = this.generatePeaks(width, height, config, random);

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
          opacity: 0.85,
        });
      }
    });

    return svg.build();
  }

  private generatePeaks(
    width: number,
    height: number,
    config: LayeredConfig,
    random: SeededRandom
  ) {
    const results: Array<{ path: string; y: number }> = [];
    const layerHeight = height / (config.layers + 1);
    const gapHeight = (config.gap / 100) * (height / config.layers);

    for (let i = 0; i < config.layers; i++) {
      const baseY = height - (i + 1) * (layerHeight + gapHeight);
      const points: Array<{ x: number; y: number }> = [];
      const numPeaks = random.int(3, 7);
      const segmentWidth = width / numPeaks;

      // Start from bottom left
      points.push({ x: 0, y: height });

      // Generate peaks
      for (let j = 0; j <= numPeaks; j++) {
        const x = j * segmentWidth;
        const peakHeight = random.range(
          config.amplitude * 0.5,
          config.amplitude
        );
        const y = baseY - peakHeight;
        points.push({ x, y: Math.max(0, y) });
      }

      // End at bottom right
      points.push({ x: width, y: height });

      // Build path with smooth curves
      const pathParts = [`M 0 ${height}`];
      for (let j = 1; j < points.length - 1; j++) {
        const prev = points[j - 1];
        const curr = points[j];
        const next = points[j + 1];

        const smoothness = config.smoothness / 100;
        const cp1x = prev.x + (curr.x - prev.x) * smoothness;
        const cp1y = prev.y + (curr.y - prev.y) * smoothness * 0.3;
        const cp2x = curr.x - (next.x - curr.x) * smoothness;
        const cp2y = curr.y - (next.y - curr.y) * smoothness * 0.3;

        pathParts.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`);
      }
      pathParts.push(`L ${width} ${height} Z`);

      results.push({ path: pathParts.join(' '), y: baseY });
    }

    return results;
  }
}
