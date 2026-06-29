/**
 * Blurry Gradient Generator - Generates gradient blobs with blur effects
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { BlurryGradientConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';

// =============================================================================
// Blurry Gradient Generator Implementation
// =============================================================================

export class BlurryGradientGenerator extends BaseGenerator<BlurryGradientConfig> {
  readonly type = 'blurryGradient';
  readonly name = 'Blurry Gradient';
  readonly description = 'Generate gradient blobs with blur effects';
  readonly icon = 'BlurCircular';
  readonly category = 'scenes';

  readonly defaultConfig: Partial<BlurryGradientConfig> = {
    blobCount: 3,
    blur: 50,
    opacity: 80,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Soft Glow',
      config: {
        blobCount: 2,
        blur: 70,
        opacity: 60,
      },
    },
    {
      name: 'Neon Dream',
      config: {
        blobCount: 4,
        blur: 40,
        opacity: 90,
      },
    },
    {
      name: 'Misty Morning',
      config: {
        blobCount: 3,
        blur: 80,
        opacity: 50,
      },
    },
    {
      name: 'Vibrant Blur',
      config: {
        blobCount: 5,
        blur: 30,
        opacity: 100,
      },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'blobCount',
      label: 'Blob Count',
      type: 'slider',
      min: 2,
      max: 6,
      step: 1,
      defaultValue: 3,
    },
    {
      key: 'blur',
      label: 'Blur',
      type: 'slider',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 50,
    },
    {
      key: 'opacity',
      label: 'Opacity',
      type: 'slider',
      min: 20,
      max: 100,
      step: 1,
      defaultValue: 80,
    },
  ];

  generate(config: BlurryGradientConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);

    // Background
    svg.background(background);

    // Calculate blur value (scale to reasonable SVG blur)
    const blurValue = (config.blur / 100) * Math.min(width, height) * 0.15;
    const filterId = `blur-${config.seed}`;

    // Add blur filter
    svg.blurFilter(filterId, blurValue);

    // Generate blobs with gradients
    for (let i = 0; i < config.blobCount; i++) {
      const color = fills[i % fills.length];
      const gradientId = `grad-${config.seed}-${i}`;

      // Random blob position and size
      const blobX = random.range(width * 0.2, width * 0.8);
      const blobY = random.range(height * 0.2, height * 0.8);
      const blobRadius = random.range(
        Math.min(width, height) * 0.15,
        Math.min(width, height) * 0.35
      );

      // Create radial gradient for this blob
      svg.radialGradient(
        gradientId,
        [
          { offset: 0, color, opacity: config.opacity / 100 },
          { offset: 0.5, color, opacity: (config.opacity / 100) * 0.5 },
          { offset: 1, color, opacity: 0 },
        ],
        {
          cx: '50%',
          cy: '50%',
          r: '50%',
        }
      );

      // Draw blob circle with gradient
      svg.circle(blobX, blobY, blobRadius, {
        fill: `url(#${gradientId})`,
        filter: `url(#${filterId})`,
      });
    }

    return svg.build();
  }
}

// Export singleton instance
export const blurryGradientGenerator = new BlurryGradientGenerator();
