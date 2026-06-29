/**
 * Blob Generator - Generates organic blob shapes using noise and Bezier curves
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { BlobConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import { generateBlobPath } from '../../lib/svg/pathUtils';

// =============================================================================
// Blob Generator Implementation
// =============================================================================

export class BlobGenerator extends BaseGenerator<BlobConfig> {
  readonly type = 'blob';
  readonly name = 'Blob';
  readonly description = 'Generate organic blob shapes';
  readonly icon = 'BlurOn';
  readonly category = 'shapes';

  readonly defaultConfig: Partial<BlobConfig> = {
    complexity: 8,
    contrast: 50,
    balance: 50,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Simple Blob',
      config: {
        complexity: 6,
        contrast: 30,
        balance: 70,
      },
    },
    {
      name: 'Organic Blob',
      config: {
        complexity: 10,
        contrast: 60,
        balance: 40,
      },
    },
    {
      name: 'Wild Shape',
      config: {
        complexity: 12,
        contrast: 80,
        balance: 20,
      },
    },
    {
      name: 'Smooth Circle',
      config: {
        complexity: 4,
        contrast: 15,
        balance: 90,
      },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'complexity',
      label: 'Complexity',
      type: 'slider',
      min: 4,
      max: 16,
      step: 1,
      defaultValue: 8,
    },
    {
      key: 'contrast',
      label: 'Contrast',
      type: 'slider',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 50,
    },
    {
      key: 'balance',
      label: 'Balance',
      type: 'slider',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 50,
    },
  ];

  generate(config: BlobConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);

    // Background
    svg.background(background);

    // Calculate blob size based on canvas
    const minDimension = Math.min(width, height);
    const blobRadius = minDimension * 0.3;

    // Generate blob path centered in canvas
    const centerX = width / 2;
    const centerY = height / 2;

    const blobPath = generateBlobPath(centerX, centerY, blobRadius, random, {
      complexity: config.complexity,
      contrast: config.contrast,
    });

    // Draw the blob
    if (config.variant === 'outline') {
      svg.path(blobPath, {
        fill: 'none',
        stroke: fills[0],
        'stroke-width': 3,
      });
    } else {
      // Add gradient for solid blobs
      const gradientId = `gradient-${config.seed}`;
      svg.radialGradient(gradientId, [
        { offset: 0, color: fills[0] },
        { offset: 0.7, color: fills[1] || fills[0] },
        { offset: 1, color: fills[2] || fills[1] || fills[0] },
      ]);

      svg.path(blobPath, {
        fill: `url(#${gradientId})`,
      });
    }

    return svg.build();
  }
}

// Export singleton instance
export const blobGenerator = new BlobGenerator();
