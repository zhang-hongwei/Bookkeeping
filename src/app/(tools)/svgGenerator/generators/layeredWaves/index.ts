/**
 * Layered Waves Generator - Generates multiple transparent wave layers
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { LayeredConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import { generateLayeredWaves } from '../../lib/svg/pathUtils';

export class LayeredWavesGenerator extends BaseGenerator<LayeredConfig> {
  readonly type = 'layeredWaves';
  readonly name = 'Layered Waves';
  readonly description = 'Generate multiple transparent wave layers';
  readonly icon = 'Waves';
  readonly category = 'waves';

  readonly defaultConfig: Partial<LayeredConfig> = {
    layers: 5,
    amplitude: 50,
    smoothness: 70,
    gap: 15,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Ocean',
      config: { layers: 6, amplitude: 40, smoothness: 80, gap: 12 },
    },
    {
      name: 'Ripples',
      config: { layers: 8, amplitude: 25, smoothness: 90, gap: 8 },
    },
    {
      name: 'Dynamic',
      config: { layers: 4, amplitude: 70, smoothness: 50, gap: 20 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    { key: 'layers', label: 'Layers', type: 'slider', min: 2, max: 10, step: 1, defaultValue: 5 },
    { key: 'amplitude', label: 'Amplitude', type: 'slider', min: 10, max: 100, step: 1, defaultValue: 50 },
    { key: 'smoothness', label: 'Smoothness', type: 'slider', min: 0, max: 100, step: 1, defaultValue: 70 },
    { key: 'gap', label: 'Gap', type: 'slider', min: 0, max: 50, step: 1, defaultValue: 15 },
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

    waves.forEach((wave, index) => {
      const color = fills[index % fills.length];

      if (config.variant === 'outline') {
        svg.path(wave.path, {
          fill: 'none',
          stroke: color,
          'stroke-width': 2,
          opacity: 0.8,
        });
      } else {
        // Layered waves use transparency for depth effect
        svg.path(wave.path, {
          fill: color,
          opacity: 0.3 + (index / waves.length) * 0.4,
        });
      }
    });

    return svg.build();
  }
}
