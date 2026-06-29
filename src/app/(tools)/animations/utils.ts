/**
 * CSS Animation Utilities
 * Helper functions for generating animation CSS
 */

import type { AnimationConfig, KeyframeDefinition, KeyframeStep, AnimationExportFormat } from './types';

/**
 * Format keyframe offset to percentage or from/to
 */
function formatOffset(offset: number): string {
  if (offset === 0) return 'from';
  if (offset === 100) return 'to';
  return `${offset}%`;
}

/**
 * Generate CSS keyframes from definition
 */
export function generateKeyframes(keyframes: KeyframeDefinition): string {
  const lines: string[] = [`@keyframes ${keyframes.name} {`];

  keyframes.steps.forEach((step) => {
    lines.push(`  ${formatOffset(step.offset)} {`);
    Object.entries(step.properties).forEach(([prop, value]) => {
      // Convert camelCase to kebab-case
      const cssProp = prop.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
      lines.push(`    ${cssProp}: ${value};`);
    });
    lines.push('  }');
  });

  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate animation shorthand CSS
 */
export function generateAnimationShorthand(config: AnimationConfig): string {
  const parts: string[] = [
    config.name,
    `${config.duration}s`,
    config.timingFunction,
    `${config.delay}s`,
    typeof config.iterationCount === 'number' ? String(config.iterationCount) : config.iterationCount,
    config.direction,
    config.fillMode,
  ];

  return parts.join(' ');
}

/**
 * Generate full CSS with keyframes and animation
 */
export function generateCSS(keyframes: KeyframeDefinition, config: AnimationConfig): string {
  const keyframeCSS = generateKeyframes(keyframes);
  const animationShorthand = generateAnimationShorthand(config);

  return `${keyframeCSS}

.animated-element {
  animation: ${animationShorthand};
}`;
}

/**
 * Generate SCSS with variables and mixin
 */
export function generateSCSS(keyframes: KeyframeDefinition, config: AnimationConfig): string {
  return `// Animation Variables
$animation-name: ${config.name};
$animation-duration: ${config.duration}s;
$animation-timing: ${config.timingFunction};
$animation-delay: ${config.delay}s;
$animation-iteration: ${typeof config.iterationCount === 'number' ? config.iterationCount : 'infinite'};
$animation-direction: ${config.direction};
$animation-fill-mode: ${config.fillMode};

// Animation Mixin
@mixin animate-${config.name} {
  animation: $animation-name $animation-duration $animation-timing $animation-delay $animation-iteration $animation-direction $animation-fill-mode;
}

// Keyframes
${generateKeyframes(keyframes)}

// Usage
.animated-element {
  @include animate-${config.name};
}`;
}

/**
 * Generate Tailwind animation config
 */
export function generateTailwind(keyframes: KeyframeDefinition, config: AnimationConfig): string {
  const keyframeObj: Record<string, Record<string, string>> = {};

  keyframes.steps.forEach((step) => {
    const offset = formatOffset(step.offset);
    keyframeObj[offset] = step.properties;
  });

  return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        ${config.name}: ${JSON.stringify(keyframeObj, null, 8).split('\n').join('\n        ')}
      },
      animation: {
        '${config.name}': '${config.duration}s ${config.timingFunction} ${config.delay}s ${typeof config.iterationCount === 'number' ? config.iterationCount + ' ' : ''}${config.direction} ${config.fillMode}',
      }
    }
  }
}

// Usage in JSX:
// <div className="animate-${config.name}">Animated content</div>`;
}

/**
 * Generate JSON output
 */
export function generateJSON(keyframes: KeyframeDefinition, config: AnimationConfig): string {
  return JSON.stringify(
    {
      animation: {
        name: config.name,
        duration: config.duration,
        timingFunction: config.timingFunction,
        delay: config.delay,
        iterationCount: config.iterationCount,
        direction: config.direction,
        fillMode: config.fillMode,
        playState: config.playState,
      },
      keyframes: {
        name: keyframes.name,
        steps: keyframes.steps,
      },
      css: {
        keyframes: generateKeyframes(keyframes),
        animation: generateAnimationShorthand(config),
      },
    },
    null,
    2
  );
}

/**
 * Generate code by format
 */
export function generateCode(
  keyframes: KeyframeDefinition,
  config: AnimationConfig,
  format: AnimationExportFormat
): string {
  switch (format) {
    case 'css':
      return generateCSS(keyframes, config);
    case 'scss':
      return generateSCSS(keyframes, config);
    case 'tailwind':
      return generateTailwind(keyframes, config);
    case 'json':
      return generateJSON(keyframes, config);
    default:
      return generateCSS(keyframes, config);
  }
}

/**
 * Get animation CSS for inline preview
 */
export function getPreviewAnimationCSS(config: AnimationConfig): React.CSSProperties {
  return {
    animation: generateAnimationShorthand(config),
  };
}
