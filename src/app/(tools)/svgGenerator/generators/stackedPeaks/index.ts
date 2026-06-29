/**
 * Stacked Peaks Generator - Generates stacked mountain peaks
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { LayeredConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import type { SeededRandom } from '../../lib/algorithms/random';

export class StackedPeaksGenerator extends BaseGenerator<LayeredConfig> {
  readonly type = 'stackedPeaks';
  readonly name = 'Stacked Peaks';
  readonly description = 'Generate stacked mountain peaks';
  readonly icon = 'Terrain';
  readonly category = 'scenes';

  readonly defaultConfig: Partial<LayeredConfig> = {
    layers: 5,
    amplitude: 100,
    smoothness: 60,
    gap: 10,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Mountain Range',
      config: { layers: 6, amplitude: 120, smoothness: 50, gap: 5 },
    },
    {
      name: 'Gentle Hills',
      config: { layers: 4, amplitude: 60, smoothness: 80, gap: 15 },
    },
    {
      name: 'Sharp Peaks',
      config: { layers: 7, amplitude: 150, smoothness: 20, gap: 3 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'layers', label: 'Layers', type: 'slider', min: 3, max: 10, step: 1, defaultValue: 5 },
    { key: 'amplitude', label: 'Height', type: 'slider', min: 30, max: 200, step: 1, defaultValue: 100 },
    { key: 'smoothness', label: 'Smoothness', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 60 },
    { key: 'gap', label: 'Gap', type: 'slider', min: 0, max: 30, step: 1, defaultValue: 10 },
  ];

  generate(config: LayeredConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);
    svg.background(background);

    const layers = this.generateStackedPeaks(width, height, config, random);

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

  private generateStackedPeaks(
    width: number,
    height: number,
    config: LayeredConfig,
    random: SeededRandom
  ) {
    const results: Array<{ path: string; y: number }> = [];
    const layerGap = config.gap;
    const baseSpacing = height / (config.layers + 1);

    for (let i = 0; i < config.layers; i++) {
      const baseY = height - (i * baseSpacing) - layerGap * i;
      const numPeaks = random.int(3, 6);
      const peaks: Array<{ x: number; height: number }> = [];

      // Generate peak positions and heights
      for (let j = 0; j < numPeaks; j++) {
        peaks.push({
          x: random.range(width * 0.1, width * 0.9),
          height: random.range(config.amplitude * 0.4, config.amplitude),
        });
      }

      // Sort peaks by x position
      peaks.sort((a, b) => a.x - b.x);

      // Build path
      const pathParts: string[] = [`M 0 ${height}`];
      pathParts.push(`L 0 ${baseY}`);

      const smoothness = config.smoothness / 100;

      peaks.forEach((peak, idx) => {
        const prevPeak = idx > 0 ? peaks[idx - 1] : { x: 0, height: 0 };
        const nextPeak = idx < peaks.length - 1 ? peaks[idx + 1] : { x: width, height: 0 };

        const peakY = baseY - peak.height;

        if (idx === 0) {
          // First peak - draw line from left edge
          const cpX = (prevPeak.x + peak.x) / 2;
          pathParts.push(`Q ${cpX} ${baseY} ${peak.x} ${peakY}`);
        } else {
          // Middle peaks - draw curves
          const midX = (prevPeak.x + peak.x) / 2;
          pathParts.push(`T ${midX} ${baseY}`);
          pathParts.push(`T ${peak.x} ${peakY}`);
        }

        if (idx === peaks.length - 1) {
          // Last peak - connect to right edge
          const endY = baseY - random.range(0, config.amplitude * 0.3);
          pathParts.push(`Q ${(peak.x + width) / 2} ${baseY} ${width} ${endY}`);
        }
      });

      pathParts.push(`L ${width} ${height} Z`);
      results.push({ path: pathParts.join(' '), y: baseY });
    }

    return results;
  }
}
