/**
 * Filter Utilities
 * Helper functions for generating CSS filter code
 */

import type { FilterValues, FilterExportFormat } from './types';

/**
 * Generate CSS filter string
 */
export function generateFilterCSS(values: FilterValues): string {
  const filters: string[] = [];

  if (values.blur > 0) {
    filters.push(`blur(${values.blur}px)`);
  }
  if (values.brightness !== 100) {
    filters.push(`brightness(${values.brightness}%)`);
  }
  if (values.contrast !== 100) {
    filters.push(`contrast(${values.contrast}%)`);
  }
  if (values.saturate !== 100) {
    filters.push(`saturate(${values.saturate}%)`);
  }
  if (values.grayscale > 0) {
    filters.push(`grayscale(${values.grayscale}%)`);
  }
  if (values.sepia > 0) {
    filters.push(`sepia(${values.sepia}%)`);
  }
  if (values.hueRotate !== 0) {
    filters.push(`hue-rotate(${values.hueRotate}deg)`);
  }
  if (values.invert > 0) {
    filters.push(`invert(${values.invert}%)`);
  }
  if (values.opacity !== 100) {
    filters.push(`opacity(${values.opacity}%)`);
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
}

/**
 * Generate drop-shadow CSS
 */
export function generateDropShadowCSS(values: FilterValues): string {
  if (!values.dropShadow?.enabled) return '';

  const { x, y, blur, color } = values.dropShadow;
  return `drop-shadow(${x}px ${y}px ${blur}px ${color})`;
}

/**
 * Generate complete CSS
 */
export function generateCSS(values: FilterValues): string {
  const lines: string[] = [];

  const filterParts: string[] = [];
  const mainFilter = generateFilterCSS(values);
  const dropShadow = generateDropShadowCSS(values);

  if (mainFilter !== 'none') {
    filterParts.push(mainFilter);
  }
  if (dropShadow) {
    filterParts.push(dropShadow);
  }

  if (filterParts.length > 0) {
    lines.push(`filter: ${filterParts.join(' ')};`);
  }

  return lines.join('\n');
}

/**
 * Generate MUI sx prop
 */
export function generateMUI(values: FilterValues): string {
  const filterParts: string[] = [];
  const mainFilter = generateFilterCSS(values);
  const dropShadow = generateDropShadowCSS(values);

  if (mainFilter !== 'none') {
    filterParts.push(mainFilter);
  }
  if (dropShadow) {
    filterParts.push(dropShadow);
  }

  if (filterParts.length === 0) {
    return '<Box>Content</Box>';
  }

  return `<Box
  sx={{
    filter: '${filterParts.join(' ')}',
  }}
>
  Content
</Box>`;
}

/**
 * Generate Tailwind classes
 */
export function generateTailwind(values: FilterValues): string {
  const classes: string[] = [];

  if (values.blur > 0) {
    classes.push(`blur-[${values.blur}px]`);
  }
  if (values.brightness !== 100) {
    classes.push(`brightness-[${values.brightness / 100}]`);
  }
  if (values.contrast !== 100) {
    classes.push(`contrast-[${values.contrast / 100}]`);
  }
  if (values.saturate !== 100) {
    classes.push(`saturate-[${values.saturate / 100}]`);
  }
  if (values.grayscale > 0) {
    classes.push(`grayscale-[${values.grayscale / 100}]`);
  }
  if (values.sepia > 0) {
    classes.push(`sepia-[${values.sepia / 100}]`);
  }
  if (values.hueRotate !== 0) {
    classes.push(`hue-rotate-[${values.hueRotate}deg]`);
  }
  if (values.invert > 0) {
    classes.push(`invert-[${values.invert / 100}]`);
  }
  if (values.opacity !== 100) {
    classes.push(`opacity-[${values.opacity / 100}]`);
  }

  if (values.dropShadow?.enabled) {
    const { x, y, blur, color } = values.dropShadow;
    classes.push(`drop-shadow-[${x}px_${y}px_${blur}px_${color}]`);
  }

  if (classes.length === 0) {
    return 'filter-none';
  }

  return `filter ${classes.join(' ')}`;
}

/**
 * Generate JSON output
 */
export function generateJSON(values: FilterValues): string {
  return JSON.stringify(
    {
      filter: generateFilterCSS(values),
      dropShadow: values.dropShadow?.enabled ? generateDropShadowCSS(values) : null,
      values: {
        blur: `${values.blur}px`,
        brightness: `${values.brightness}%`,
        contrast: `${values.contrast}%`,
        saturate: `${values.saturate}%`,
        grayscale: `${values.grayscale}%`,
        sepia: `${values.sepia}%`,
        hueRotate: `${values.hueRotate}deg`,
        invert: `${values.invert}%`,
        opacity: `${values.opacity}%`,
      },
    },
    null,
    2
  );
}

/**
 * Generate code by format
 */
export function generateCode(values: FilterValues, format: FilterExportFormat): string {
  switch (format) {
    case 'css':
      return generateCSS(values);
    case 'scss':
      return `$filter: ${generateFilterCSS(values)};\n\n.element {\n  ${generateCSS(values)}\n}`;
    case 'tailwind':
      return generateTailwind(values);
    case 'json':
      return generateJSON(values);
    default:
      return generateCSS(values);
  }
}
