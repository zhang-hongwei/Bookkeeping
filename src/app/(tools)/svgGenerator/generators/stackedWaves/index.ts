/**
 * Stacked Waves Generator - Generates stacked wave layers
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { LayeredConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import { generateLayeredWaves } from '../../lib/svg/pathUtils';

export class StackedWavesGenerator extends BaseGenerator<LayeredConfig> {
  readonly type = 'stackedWaves';
  readonly name = 'Stacked Waves';
  readonly description = 'Generate stacked wave layers';
  readonly icon = 'Waves';
  readonly category = 'waves';

  readonly defaultConfig: Partial<LayeredConfig> = {
    layers: 4,
    amplitude: 40,
    smoothness: 60,
    gap: 20,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Gentle',
      config: { layers: 3, amplitude: 30, smoothness: 80, gap: 25 },
    },
    {
      name: 'Dynamic',
      config: { layers: 5, amplitude: 60, smoothness: 40, gap: 15 },
    },
    {
      name: 'Calm',
      config: { layers: 6, amplitude: 20, smoothness: 90, gap: 10 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'layers', label: 'Layers', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 4 },
    { key: 'amplitude', label: 'Amplitude', type: 'slider', min: 10, max: 100, step: 1, defaultValue: 40 },
    { key: 'smoothness', label: 'Smoothness', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 60 },
    { key: 'gap', label: 'Gap', type: 'slider', min: 0, max: 50, step: 1, defaultValue: 20 },
  ];

  generate(config: LayeredConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);
    svg.background(background);

    const waves = generateLayeredWaves(
      width,
      height,
      config.layers,
      config.amplitude,
      3, // frequency
      random,
      { smoothness: config.smoothness, gap: config.gap }
    );

    // Reverse to draw from bottom to top for stacking effect
    const reversedWaves = [...waves].reverse();

    reversedWaves.forEach((wave, index) => {
      const color = fills[index % fills.length];

      if (config.variant === 'outline') {
        svg.path(wave.path, {
          fill: 'none',
          stroke: color,
          'stroke-width': 2,
        });
      } else {
        svg.path(wave.path, {
          fill: color,
          opacity: 0.9,
        });
      }
    });

    return svg.build();
  }
}
