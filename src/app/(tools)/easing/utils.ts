/**
 * Easing Curve Utilities
 * Helper functions for cubic-bezier easing
 */

import type { EasingConfig, EasingPoint, EasingExportFormat } from './types';

/**
 * Generate cubic-bezier CSS value
 */
export function generateCubicBezier(config: EasingConfig): string {
  const { p1, p2 } = config;
  return `cubic-bezier(${p1.x}, ${p1.y}, ${p2.x}, ${p2.y})`;
}

/**
 * Generate CSS transition
 */
export function generateCSS(config: EasingConfig, duration: string = '300ms'): string {
  const easing = generateCubicBezier(config);
  return `transition-timing-function: ${easing};
transition-duration: ${duration};`;
}

/**
 * Generate complete CSS class
 */
export function generateCSSClass(config: EasingConfig): string {
  const easing = generateCubicBezier(config);
  return `.animated-element {
  transition-timing-function: ${easing};
  transition-duration: 300ms;
  transition-property: all;
}`;
}

/**
 * Generate SCSS mixin
 */
export function generateSCSS(config: EasingConfig): string {
  const easing = generateCubicBezier(config);
  return `$easing-${config.name}: ${easing};

@mixin transition-${config.name}($property: all, $duration: 300ms) {
  transition-timing-function: ${easing};
  transition-duration: $duration;
  transition-property: $property;
}`;
}

/**
 * Generate Tailwind config
 */
export function generateTailwind(config: EasingConfig): string {
  const { p1, p2 } = config;
  return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      transitionTimingFunction: {
        '${config.name}': 'cubic-bezier(${p1.x}, ${p1.y}, ${p2.x}, ${p2.y})',
      }
    }
  }
}

// Usage:
// <div class="transition ease-${config.name} duration-300">...</div>`;
}

/**
 * Generate JSON output
 */
export function generateJSON(config: EasingConfig): string {
  return JSON.stringify(
    {
      name: config.name,
      css: generateCubicBezier(config),
      points: {
        p1: config.p1,
        p2: config.p2,
      },
      cssClass: generateCSSClass(config),
      tailwind: {
        name: config.name,
        value: generateCubicBezier(config),
      },
    },
    null,
    2
  );
}

/**
 * Generate code by format
 */
export function generateCode(config: EasingConfig, format: EasingExportFormat): string {
  switch (format) {
    case 'css':
      return generateCSSClass(config);
    case 'scss':
      return generateSCSS(config);
    case 'tailwind':
      return generateTailwind(config);
    case 'json':
      return generateJSON(config);
    default:
      return generateCSSClass(config);
  }
}

/**
 * Sample the bezier curve at a given t (0-1)
 */
export function sampleBezier(config: EasingConfig, t: number): number {
  const { p1, p2 } = config;

  // Cubic bezier formula
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  // For a standard bezier from (0,0) to (1,1), the formula is:
  // y = 3*mt2*t*p1y + 3*mt*t2*p2y + t3*1
  return 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3;
}

/**
 * Generate curve points for visualization
 */
export function generateCurvePoints(config: EasingConfig, samples = 100): EasingPoint[] {
  const points: EasingPoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    points.push({
      x: t,
      y: sampleBezier(config, t),
    });
  }
  return points;
}
