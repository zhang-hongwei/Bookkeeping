/**
 * Wave Generator - Generates multi-layer wave patterns
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { WaveConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import { generateLayeredWaves } from '../../lib/svg/pathUtils';

// =============================================================================
// Wave Generator Implementation
// =============================================================================

export class WaveGenerator extends BaseGenerator<WaveConfig> {
  readonly type = 'wave';
  readonly name = 'Wave';
  readonly description = 'Generate layered wave patterns';
  readonly icon = 'Waves';
  readonly category = 'waves';

  readonly defaultConfig: Partial<WaveConfig> = {
    layers: 3,
    amplitude: 50,
    frequency: 3,
    smoothness: 60,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Calm Waves',
      config: {
        layers: 2,
        amplitude: 30,
        frequency: 2,
        smoothness: 80,
      },
    },
    {
      name: 'Ocean Waves',
      config: {
        layers: 4,
        amplitude: 60,
        frequency: 4,
        smoothness: 50,
      },
    },
    {
      name: 'Gentle Ripples',
      config: {
        layers: 5,
        amplitude: 20,
        frequency: 6,
        smoothness: 90,
      },
    },
    {
      name: 'Dramatic Waves',
      config: {
        layers: 3,
        amplitude: 80,
        frequency: 2,
        smoothness: 40,
      },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'layers',
      label: 'Layers',
      type: 'slider',
      min: 1,
      max: 8,
      step: 1,
      defaultValue: 3,
    },
    {
      key: 'amplitude',
      label: 'Amplitude',
      type: 'slider',
      min: 10,
      max: 100,
      step: 1,
      defaultValue: 50,
    },
    {
      key: 'frequency',
      label: 'Frequency',
      type: 'slider',
      min: 1,
      max: 10,
      step: 0.5,
      defaultValue: 3,
    },
    {
      key: 'smoothness',
      label: 'Smoothness',
      type: 'slider',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 60,
    },
  ];

  generate(config: WaveConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);

    // Background
    svg.background(background);

    // Generate layered waves
    const amplitude = (config.amplitude / 100) * (height * 0.3);
    const waves = generateLayeredWaves(
      width,
      height,
      config.layers,
      amplitude,
      config.frequency,
      random,
      {
        smoothness: config.smoothness,
        gap: height / (config.layers + 2),
      }
    );

    // Draw each wave layer
    waves.forEach((wave, index) => {
      const colorIndex = index % fills.length;
      const fill = fills[colorIndex];

      if (config.variant === 'outline') {
        svg.path(wave.path, {
          fill: 'none',
          stroke: fill,
          'stroke-width': 2,
        });
      } else {
        // Add opacity gradient for layered effect
        const opacity = 1 - (index * 0.15);
        svg.path(wave.path, {
          fill,
          opacity,
        });
      }
    });

    return svg.build();
  }
}

// Export singleton instance
export const waveGenerator = new WaveGenerator();
