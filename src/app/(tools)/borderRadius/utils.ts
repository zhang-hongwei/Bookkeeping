/**
 * Border Radius Utilities
 * Helper functions for generating CSS code
 */

import type { BorderRadiusValues, BorderUnit } from './types';

/**
 * Generate CSS border-radius value
 */
export function generateBorderRadiusCSS(values: BorderRadiusValues, unit: BorderUnit): string {
  const { topLeft, topRight, bottomRight, bottomLeft } = values;

  // If all values are the same
  if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
    const suffix = unit === '%' ? '%' : 'px';
    return `${topLeft}${suffix}`;
  }

  // If top corners match and bottom corners match
  if (topLeft === topRight && bottomRight === bottomLeft) {
    const suffix = unit === '%' ? '%' : 'px';
    return `${topLeft}${suffix} ${bottomRight}${suffix}`;
  }

  // All four values
  const suffix = unit === '%' ? '%' : 'px';
  return `${topLeft}${suffix} ${topRight}${suffix} ${bottomRight}${suffix} ${bottomLeft}${suffix}`;
}

/**
 * Generate complete CSS code
 */
export function generateCSS(values: BorderRadiusValues, unit: BorderUnit): string {
  return `border-radius: ${generateBorderRadiusCSS(values, unit)};`;
}

/**
 * Generate MUI sx prop code
 */
export function generateMUISx(values: BorderRadiusValues, unit: BorderUnit): string {
  const css = generateBorderRadiusCSS(values, unit);
  return `sx={{ borderRadius: '${css}' }}`;
}

/**
 * Generate Tailwind CSS classes
 */
export function generateTailwind(values: BorderRadiusValues, unit: BorderUnit): string {
  const { topLeft, topRight, bottomRight, bottomLeft } = values;

  // Tailwind has specific class names for common values
  const getValueClass = (value: number, u: BorderUnit, corner: string): string => {
    if (u === '%') {
      // For percentage, use arbitrary values
      return `${corner}-[${value}%]`;
    }

    // Map common pixel values to Tailwind classes
    const pxToClass: Record<number, string> = {
      0: 'none',
      2: 'sm',
      4: '',
      6: 'md',
      8: 'lg',
      12: 'xl',
      16: '2xl',
      24: '3xl',
      32: '',
      999: 'full',
    };

    const baseClass = corner === 'rounded' ? 'rounded' : `rounded-${corner}`;

    if (pxToClass[value] !== undefined) {
      if (pxToClass[value] === '') return baseClass;
      return `${baseClass}-${pxToClass[value]}`;
    }

    // Use arbitrary value for non-standard values
    return `${baseClass}-[${value}px]`;
  };

  // If all values are the same
  if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
    if (unit === '%') {
      if (topLeft === 50) return 'rounded-full';
      return `rounded-[${topLeft}%]`;
    }
    return getValueClass(topLeft, unit, 'rounded');
  }

  // Build classes for each corner
  const classes: string[] = [];

  if (topLeft !== 0 || unit === '%') {
    classes.push(getValueClass(topLeft, unit, 'tl'));
  }
  if (topRight !== 0 || unit === '%') {
    classes.push(getValueClass(topRight, unit, 'tr'));
  }
  if (bottomRight !== 0 || unit === '%') {
    classes.push(getValueClass(bottomRight, unit, 'br'));
  }
  if (bottomLeft !== 0 || unit === '%') {
    classes.push(getValueClass(bottomLeft, unit, 'bl'));
  }

  return classes.join(' ') || 'rounded-none';
}

/**
 * Generate inline style string
 */
export function generateInlineStyle(values: BorderRadiusValues, unit: BorderUnit): string {
  return `style="border-radius: ${generateBorderRadiusCSS(values, unit)}"`;
}

/**
 * Generate React inline style object
 */
export function generateReactStyle(values: BorderRadiusValues, unit: BorderUnit): string {
  const css = generateBorderRadiusCSS(values, unit);
  return `style={{ borderRadius: '${css}' }}`;
}

/**
 * Generate JSON output
 */
export function generateJSON(values: BorderRadiusValues, unit: BorderUnit): string {
  return JSON.stringify(
    {
      borderRadius: generateBorderRadiusCSS(values, unit),
      unit,
      corners: {
        topLeft: values.topLeft,
        topRight: values.topRight,
        bottomRight: values.bottomRight,
        bottomLeft: values.bottomLeft,
      },
    },
    null,
    2
  );
}

/**
 * Check if values represent a uniform radius
 */
export function isUniform(values: BorderRadiusValues): boolean {
  return (
    values.topLeft === values.topRight &&
    values.topRight === values.bottomRight &&
    values.bottomRight === values.bottomLeft
  );
}
