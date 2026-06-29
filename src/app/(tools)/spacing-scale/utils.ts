/**
 * Spacing Scale Utilities
 * Generate spacing scales with different ratios
 */

import type { ScaleRatio, RatioInfo, ScaleConfig, ScaleStep, ExportFormat } from './types';

/**
 * Available ratio types with metadata
 */
export const RATIO_TYPES: RatioInfo[] = [
  {
    type: 'linear',
    name: 'Linear',
    value: 0,
    description: 'base × n (4, 8, 12, 16, 20, 24...)',
  },
  {
    type: 'major-second',
    name: 'Major Second',
    value: 1.125,
    description: '1.125 ratio - subtle increments',
  },
  {
    type: 'minor-third',
    name: 'Minor Third',
    value: 1.2,
    description: '1.2 ratio - classic web scale',
  },
  {
    type: 'perfect-fourth',
    name: 'Perfect Fourth',
    value: 1.333,
    description: '1.333 ratio - comfortable jumps',
  },
  {
    type: 'golden-ratio',
    name: 'Golden Ratio',
    value: 1.618,
    description: '1.618 ratio - harmonic proportions',
  },
];

/**
 * Get ratio info by type
 */
export function getRatioInfo(type: ScaleRatio): RatioInfo | undefined {
  return RATIO_TYPES.find((r) => r.type === type);
}

/**
 * Generate spacing scale
 */
export function generateScale(config: ScaleConfig): ScaleStep[] {
  const { baseline, ratio, steps, unit } = config;
  const ratioInfo = getRatioInfo(ratio);
  const ratioValue = ratioInfo?.value || 0;
  const rootFontSize = 16; // Standard root font size

  const scale: ScaleStep[] = [];

  for (let i = 0; i < steps; i++) {
    let px: number;

    if (ratio === 'linear') {
      px = baseline * (i + 1);
    } else {
      px = Math.round(baseline * Math.pow(ratioValue, i));
    }

    // Round to nearest reasonable value
    if (ratio !== 'linear') {
      px = Math.round(px);
    }

    const rem = (px / rootFontSize).toFixed(3).replace(/\.?0+$/, '');

    scale.push({
      index: i + 1,
      name: `${i + 1}`,
      value: unit === 'px' ? px : parseFloat(rem),
      px,
      rem: `${rem}rem`,
    });
  }

  return scale;
}

/**
 * Generate CSS custom properties
 */
export function generateCSS(scale: ScaleStep[], unit: 'px' | 'rem'): string {
  const lines = scale.map((step) => {
    const value = unit === 'px' ? `${step.px}px` : step.rem;
    return `  --spacing-${step.index}: ${value};`;
  });
  return `:root {\n${lines.join('\n')}\n}`;
}

/**
 * Generate Tailwind config
 */
export function generateTailwind(scale: ScaleStep[], unit: 'px' | 'rem'): string {
  const spacings = scale.map((step) => {
    const value = unit === 'px' ? `${step.px}px` : step.rem;
    return `      '${step.index}': '${value}',`;
  });
  return `module.exports = {
  theme: {
    extend: {
      spacing: {
${spacings.join('\n')}
      },
    },
  },
};`;
}

/**
 * Generate MUI theme
 */
export function generateMUI(scale: ScaleStep[]): string {
  const values = scale.map((step) => step.px);
  const maxValue = Math.max(...values);

  return `import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  spacing: (factor: number) => \`\${factor * 8}px\`, // Base 8px
});

// Or use custom scale:
const spacingScale = {
${scale.map((step) => `  ${step.index}: ${step.px},`).join('\n')}
};`;
}

/**
 * Generate JSON
 */
export function generateJSON(scale: ScaleStep[], config: ScaleConfig): string {
  const obj = {
    baseline: config.baseline,
    ratio: config.ratio,
    steps: scale.map((step) => ({
      index: step.index,
      px: step.px,
      rem: step.rem,
    })),
  };
  return JSON.stringify(obj, null, 2);
}

/**
 * Export scale based on format
 */
export function exportScale(scale: ScaleStep[], config: ScaleConfig, format: ExportFormat): string {
  switch (format) {
    case 'css':
      return generateCSS(scale, config.unit);
    case 'tailwind':
      return generateTailwind(scale, config.unit);
    case 'mui':
      return generateMUI(scale);
    case 'json':
      return generateJSON(scale, config);
    default:
      return '';
  }
}
