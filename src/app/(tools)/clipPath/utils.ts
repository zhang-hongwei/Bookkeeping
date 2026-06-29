/**
 * Clip Path Utilities
 * Helper functions for generating clip-path CSS
 */

import type { ClipPathConfig, ClipPathExportFormat } from './types';

/**
 * Generate CSS clip-path string
 */
export function generateClipPathCSS(config: ClipPathConfig): string {
  switch (config.type) {
    case 'none':
      return 'none';

    case 'inset':
      const inset = `${config.top}% ${config.right}% ${config.bottom}% ${config.left}%`;
      if (config.borderRadius) {
        return `inset(${inset} round ${config.borderRadius}px)`;
      }
      return `inset(${inset})`;

    case 'circle':
      return `circle(${config.radius}% at ${config.positionX}% ${config.positionY}%)`;

    case 'ellipse':
      return `ellipse(${config.radiusX}% ${config.radiusY}% at ${config.positionX}% ${config.positionY}%)`;

    case 'polygon':
      const points = config.points
        .map((p) => `${p.x}% ${p.y}%`)
        .join(', ');
      const fillRule = config.fillRule || 'nonzero';
      return `polygon(${fillRule}, ${points})`;

    default:
      return 'none';
  }
}

/**
 * Generate complete CSS
 */
export function generateCSS(config: ClipPathConfig): string {
  const clipPath = generateClipPathCSS(config);
  return `clip-path: ${clipPath};`;
}

/**
 * Generate SVG clip path definition
 */
export function generateSVGClipPath(config: ClipPathConfig, id: string = 'myClip'): string {
  if (config.type === 'none') {
    return '';
  }

  switch (config.type) {
    case 'inset':
      return `<clipPath id="${id}">
  <rect x="${config.left}%" y="${config.top}%" width="${100 - config.left - config.right}%" height="${100 - config.top - config.bottom}%"${config.borderRadius ? ` rx="${config.borderRadius}"` : ''} />
</clipPath>`;

    case 'circle':
      return `<clipPath id="${id}">
  <circle cx="${config.positionX}%" cy="${config.positionY}%" r="${config.radius}%" />
</clipPath>`;

    case 'ellipse':
      return `<clipPath id="${id}">
  <ellipse cx="${config.positionX}%" cy="${config.positionY}%" rx="${config.radiusX}%" ry="${config.radiusY}%" />
</clipPath>`;

    case 'polygon':
      const points = config.points
        .map((p) => `${p.x},${p.y}`)
        .join(' ');
      return `<clipPath id="${id}">
  <polygon points="${points}" />
</clipPath>`;

    default:
      return '';
  }
}

/**
 * Generate MUI sx prop
 */
export function generateMUI(config: ClipPathConfig): string {
  const clipPath = generateClipPathCSS(config);
  return `<Box
  sx={{
    clipPath: '${clipPath}',
  }}
>
  Content
</Box>`;
}

/**
 * Generate Tailwind classes
 */
export function generateTailwind(config: ClipPathConfig): string {
  const clipPath = generateClipPathCSS(config);

  if (clipPath === 'none') {
    return 'clip-path-none';
  }

  // Tailwind requires arbitrary values for custom clip paths
  return `clip-path-[${clipPath.replace(/\s+/g, '_')}]`;
}

/**
 * Generate JSON output
 */
export function generateJSON(config: ClipPathConfig): string {
  return JSON.stringify(
    {
      clipPath: generateClipPathCSS(config),
      type: config.type,
      config: config.type !== 'none' ? config : null,
    },
    null,
    2
  );
}

/**
 * Generate code by format
 */
export function generateCode(config: ClipPathConfig, format: ClipPathExportFormat): string {
  switch (format) {
    case 'css':
      return `.clipped-element {\n  ${generateCSS(config)}\n}`;
    case 'scss':
      return `$clip-path: ${generateClipPathCSS(config)};\n\n.clipped-element {\n  clip-path: $clip-path;\n}`;
    case 'tailwind':
      return generateTailwind(config);
    case 'svg':
      return generateSVGClipPath(config);
    case 'json':
      return generateJSON(config);
    default:
      return generateCSS(config);
  }
}
