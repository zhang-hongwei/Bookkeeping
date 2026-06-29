/**
 * Transform Utilities
 * Helper functions for generating CSS transform code
 */

import type { TransformValues, TransformMode } from './types';

/**
 * Generate CSS transform string
 */
export function generateTransformCSS(values: TransformValues): string {
  const transforms: string[] = [];

  // Translate
  if (values.translateX !== 0 || values.translateY !== 0) {
    transforms.push(`translate(${values.translateX}px, ${values.translateY}px)`);
  }
  if (values.translateZ !== 0) {
    transforms.push(`translateZ(${values.translateZ}px)`);
  }

  // Rotate
  if (values.rotateX !== 0) {
    transforms.push(`rotateX(${values.rotateX}deg)`);
  }
  if (values.rotateY !== 0) {
    transforms.push(`rotateY(${values.rotateY}deg)`);
  }
  if (values.rotateZ !== 0) {
    transforms.push(`rotateZ(${values.rotateZ}deg)`);
  }

  // Scale
  if (values.scaleX !== 1 || values.scaleY !== 1) {
    if (values.scaleX === values.scaleY) {
      transforms.push(`scale(${values.scaleX})`);
    } else {
      transforms.push(`scale(${values.scaleX}, ${values.scaleY})`);
    }
  }
  if (values.scaleZ !== 1) {
    transforms.push(`scaleZ(${values.scaleZ})`);
  }

  // Skew
  if (values.skewX !== 0 || values.skewY !== 0) {
    if (values.skewX !== 0 && values.skewY === 0) {
      transforms.push(`skewX(${values.skewX}deg)`);
    } else if (values.skewY !== 0 && values.skewX === 0) {
      transforms.push(`skewY(${values.skewY}deg)`);
    } else {
      transforms.push(`skew(${values.skewX}deg, ${values.skewY}deg)`);
    }
  }

  return transforms.length > 0 ? transforms.join(' ') : 'none';
}

/**
 * Generate CSS perspective if needed
 */
export function generatePerspectiveCSS(values: TransformValues): string {
  if (values.perspective && values.perspective > 0) {
    return `perspective: ${values.perspective}px;`;
  }
  return '';
}

/**
 * Generate complete CSS
 */
export function generateCSS(values: TransformValues, mode: TransformMode = '2d'): string {
  const lines: string[] = [];

  const perspective = generatePerspectiveCSS(values);
  if (perspective) {
    lines.push(perspective);
  }

  const transform = generateTransformCSS(values);
  lines.push(`transform: ${transform};`);

  return lines.join('\n');
}

/**
 * Generate MUI sx prop
 */
export function generateMUI(values: TransformValues): string {
  const transform = generateTransformCSS(values);
  const lines: string[] = [];

  if (values.perspective && values.perspective > 0) {
    lines.push(`perspective: ${values.perspective}`);
  }
  lines.push(`transform: '${transform}'`);

  return `<Box
  sx={{
    ${lines.join(',\n    ')},
  }}
>
  Content
</Box>`;
}

/**
 * Generate Tailwind classes
 */
export function generateTailwind(values: TransformValues): string {
  const classes: string[] = [];

  // Translate
  if (values.translateX !== 0) {
    classes.push(`translate-x-[${values.translateX}px]`);
  }
  if (values.translateY !== 0) {
    classes.push(`translate-y-[${values.translateY}px]`);
  }

  // Rotate
  if (values.rotateX !== 0) {
    classes.push(`rotate-x-[${values.rotateX}deg]`);
  }
  if (values.rotateY !== 0) {
    classes.push(`rotate-y-[${values.rotateY}deg]`);
  }
  if (values.rotateZ !== 0) {
    classes.push(`rotate-[${values.rotateZ}deg]`);
  }

  // Scale
  if (values.scaleX !== 1 || values.scaleY !== 1) {
    if (values.scaleX === values.scaleY) {
      classes.push(`scale-[${values.scaleX}]`);
    } else {
      classes.push(`scale-x-[${values.scaleX}]`);
      classes.push(`scale-y-[${values.scaleY}]`);
    }
  }

  // Skew
  if (values.skewX !== 0) {
    classes.push(`skew-x-[${values.skewX}deg]`);
  }
  if (values.skewY !== 0) {
    classes.push(`skew-y-[${values.skewY}deg]`);
  }

  if (classes.length === 0) {
    return 'transform-none';
  }

  return `transform ${classes.join(' ')}`;
}

/**
 * Generate JSON output
 */
export function generateJSON(values: TransformValues): string {
  return JSON.stringify(
    {
      transform: generateTransformCSS(values),
      perspective: values.perspective || null,
      values: {
        translate: { x: values.translateX, y: values.translateY, z: values.translateZ },
        rotate: { x: values.rotateX, y: values.rotateY, z: values.rotateZ },
        scale: { x: values.scaleX, y: values.scaleY, z: values.scaleZ },
        skew: { x: values.skewX, y: values.skewY },
      },
    },
    null,
    2
  );
}

/**
 * Check if 3D transforms are being used
 */
export function is3DTransform(values: TransformValues): boolean {
  return (
    values.translateZ !== 0 ||
    values.rotateX !== 0 ||
    values.rotateY !== 0 ||
    values.scaleZ !== 1 ||
    (values.perspective ?? 0) > 0
  );
}
