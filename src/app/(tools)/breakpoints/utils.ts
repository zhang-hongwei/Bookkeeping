/**
 * Breakpoint Utilities
 * Generate media queries and export code
 */

import type { Breakpoint, FrameworkType, ExportFormat } from './types';

/**
 * Generate CSS media queries
 */
export function generateCSS(breakpoints: Breakpoint[]): string {
  const lines = breakpoints.map((bp, i) => {
    if (bp.maxWidth) {
      return `/* ${bp.name.toUpperCase()}: ${bp.minWidth}px - ${bp.maxWidth}px */
@media (min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px) {
  /* styles for ${bp.name} */
}`;
    } else {
      return `/* ${bp.name.toUpperCase()}: ${bp.minWidth}px and up */
@media (min-width: ${bp.minWidth}px) {
  /* styles for ${bp.name} */
}`;
    }
  });
  return lines.join('\n\n');
}

/**
 * Generate SCSS mixins
 */
export function generateSCSS(breakpoints: Breakpoint[]): string {
  const lines = breakpoints.map((bp) => {
    if (bp.maxWidth) {
      return `@mixin ${bp.name} {
  @media (min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px) {
    @content;
  }
}`;
    } else {
      return `@mixin ${bp.name} {
  @media (min-width: ${bp.minWidth}px) {
    @content;
  }
}`;
    }
  });

  const usageExample = `
// Usage example:
// .container {
//   @include sm {
//     padding: 1rem;
//   }
//   @include md {
//     padding: 2rem;
//   }
// }
`;

  return lines.join('\n\n') + usageExample;
}

/**
 * Generate Tailwind config snippet
 */
export function generateTailwind(breakpoints: Breakpoint[]): string {
  const screens = breakpoints.map((bp) => {
    return `      '${bp.name}': '${bp.minWidth}px',`;
  });

  return `module.exports = {
  theme: {
    screens: {
${screens.join('\n')}
    },
  },
};`;
}

/**
 * Generate JSON
 */
export function generateJSON(breakpoints: Breakpoint[], framework: FrameworkType): string {
  const obj = {
    framework,
    breakpoints: breakpoints.map((bp) => ({
      name: bp.name,
      minWidth: bp.minWidth,
      maxWidth: bp.maxWidth || null,
    })),
  };
  return JSON.stringify(obj, null, 2);
}

/**
 * Export based on format
 */
export function exportBreakpoints(
  breakpoints: Breakpoint[],
  framework: FrameworkType,
  format: ExportFormat
): string {
  switch (format) {
    case 'css':
      return generateCSS(breakpoints);
    case 'scss':
      return generateSCSS(breakpoints);
    case 'tailwind':
      return generateTailwind(breakpoints);
    case 'json':
      return generateJSON(breakpoints, framework);
    default:
      return '';
  }
}

/**
 * Get responsive preview styles
 */
export function getPreviewStyles(breakpoint: Breakpoint): React.CSSProperties {
  return {
    backgroundColor: breakpoint.color || '#ccc',
  };
}

/**
 * Format breakpoint label
 */
export function formatBreakpointLabel(bp: Breakpoint): string {
  if (bp.maxWidth) {
    return `${bp.name}: ${bp.minWidth}px - ${bp.maxWidth}px`;
  }
  return `${bp.name}: ${bp.minWidth}px+`;
}
