/**
 * Glass Effect Utilities
 * CSS generation helpers for glassmorphism, liquid glass, and neumorphism
 */

import type { GlassConfig, GlassExportFormat } from './types';

// ─── Color Helpers ─────────────────────────────────────────────────────

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shadowColorWithOpacity(hex: string, opacity: number): string {
  return hexToRgba(hex, opacity / 100);
}

// ─── Shared CSS Properties ─────────────────────────────────────────────

function commonProps(config: GlassConfig): Record<string, string> {
  return {
    borderRadius: `${config.borderRadius}px`,
    ...(config.borderWidth > 0
      ? { border: `${config.borderWidth}px solid ${config.borderColor}` }
      : {}),
  };
}

function glassBackground(config: GlassConfig): string {
  return hexToRgba(config.backgroundColor, config.opacity);
}

function backdropFilter(config: GlassConfig): string {
  return `blur(${config.blur}px) saturate(${config.saturation}%)`;
}

function outerShadow(config: GlassConfig): string {
  const color = shadowColorWithOpacity(config.shadowColor, config.shadowOpacity);
  return `${config.shadowX}px ${config.shadowY}px ${config.shadowBlur}px ${config.shadowSpread}px ${color}`;
}

function liquidGlassInnerShadow(config: GlassConfig): string {
  if (config.innerShadowOpacity <= 0) return '';
  return `inset 0 1px 0 rgba(255, 255, 255, ${config.innerShadowOpacity / 100})`;
}

// ─── Build CSS Object (for rendering) ─────────────────────────────────

export interface ComputedGlassStyles {
  container: Record<string, string>;
  background: string;
  isNeumorphism: boolean;
  surfaceColor: string;
}

export function computeGlassStyles(config: GlassConfig): ComputedGlassStyles {
  const isNeumorphism = config.effectType === 'neumorphism';
  const container: Record<string, string> = { ...commonProps(config) };
  let background = config.backgroundPreset;
  let surfaceColor = '#e0e0e0';

  if (isNeumorphism) {
    surfaceColor = config.surfaceColor;
    background = config.surfaceColor;
    const d = config.neumorphDistance;
    const b = config.neumorphBlur;
    const inset = config.neumorphInset ? 'inset ' : '';
    container.background = config.surfaceColor;
    container.boxShadow = `${inset}${d}px ${d}px ${b}px ${config.darkShadowColor}, ${inset}-${d}px -${d}px ${b}px ${config.lightShadowColor}`;
  } else {
    container.background = glassBackground(config);
    container.backdropFilter = backdropFilter(config);
    container.WebkitBackdropFilter = backdropFilter(config);

    const shadows = [outerShadow(config)];
    if (config.effectType === 'liquidGlass') {
      const inner = liquidGlassInnerShadow(config);
      if (inner) shadows.push(inner);
    }
    container.boxShadow = shadows.join(', ');
  }

  return { container, background, isNeumorphism, surfaceColor };
}

// ─── CSS Code Generation ───────────────────────────────────────────────

function generateGlassCSS(config: GlassConfig, selector = '.glass'): string {
  const { effectType } = config;
  const lines: string[] = [];

  if (effectType === 'neumorphism') {
    const d = config.neumorphDistance;
    const b = config.neumorphBlur;
    const inset = config.neumorphInset ? 'inset ' : '';
    lines.push(`/* Neumorphism Effect */`);
    lines.push(`${selector} {`);
    lines.push(`  background: ${config.surfaceColor};`);
    lines.push(`  border-radius: ${config.borderRadius}px;`);
    lines.push(`  box-shadow:`);
    lines.push(`    ${inset}${d}px ${d}px ${b}px ${config.darkShadowColor},`);
    lines.push(`    ${inset}-${d}px -${d}px ${b}px ${config.lightShadowColor};`);
    lines.push(`}`);
  } else {
    const bg = glassBackground(config);
    const bd = backdropFilter(config);
    const label = effectType === 'liquidGlass' ? 'Liquid Glass' : 'Glassmorphism';

    lines.push(`/* ${label} Effect */`);
    lines.push(`${selector} {`);
    lines.push(`  background: ${bg};`);
    lines.push(`  backdrop-filter: ${bd};`);
    lines.push(`  -webkit-backdrop-filter: ${bd};`);

    if (config.borderWidth > 0) {
      lines.push(`  border: ${config.borderWidth}px solid ${config.borderColor};`);
    }
    lines.push(`  border-radius: ${config.borderRadius}px;`);

    const shadows: string[] = [outerShadow(config)];
    if (effectType === 'liquidGlass' && config.innerShadowOpacity > 0) {
      shadows.push(`inset 0 1px 0 rgba(255, 255, 255, ${config.innerShadowOpacity / 100})`);
    }
    lines.push(`  box-shadow: ${shadows.join(',\n    ')};`);
    lines.push(`  padding: ${config.padding}px;`);
    lines.push(`}`);
  }

  return lines.join('\n');
}

function generateSCSS(config: GlassConfig): string {
  const { effectType } = config;

  if (effectType === 'neumorphism') {
    const d = config.neumorphDistance;
    const b = config.neumorphBlur;
    const inset = config.neumorphInset ? 'inset ' : '';
    return `// Neumorphism Variables
$neu-surface: ${config.surfaceColor};
$neu-radius: ${config.borderRadius}px;
$neu-distance: ${d}px;
$neu-blur: ${b}px;
$neu-light: ${config.lightShadowColor};
$neu-dark: ${config.darkShadowColor};

@mixin neumorphism {
  background: $neu-surface;
  border-radius: $neu-radius;
  box-shadow:
    ${inset}$neu-distance $neu-distance $neu-blur $neu-dark,
    ${inset}-${d}px -${d}px $neu-blur $neu-light;
}

.neumorphic {
  @include neumorphism;
}`;
  }

  const bg = glassBackground(config);
  const bd = backdropFilter(config);
  const label = effectType === 'liquidGlass' ? 'liquid-glass' : 'glass';
  const vars: string[] = [
    `$${label}-blur: ${config.blur}px;`,
    `$${label}-saturation: ${config.saturation}%;`,
    `$${label}-bg: ${bg};`,
    `$${label}-border-radius: ${config.borderRadius}px;`,
  ];
  if (config.borderWidth > 0) {
    vars.push(`$${label}-border: ${config.borderWidth}px solid ${config.borderColor};`);
  }

  const shadows: string[] = [outerShadow(config)];
  if (effectType === 'liquidGlass' && config.innerShadowOpacity > 0) {
    shadows.push(`inset 0 1px 0 rgba(255, 255, 255, ${config.innerShadowOpacity / 100})`);
  }

  return `// ${effectType === 'liquidGlass' ? 'Liquid Glass' : 'Glassmorphism'} Variables
${vars.join('\n')}

@mixin ${label}-effect {
  background: $${label}-bg;
  backdrop-filter: blur($${label}-blur) saturate($${label}-saturation);
  -webkit-backdrop-filter: blur($${label}-blur) saturate($${label}-saturation);
${config.borderWidth > 0 ? `  border: $${label}-border;` : ''}
  border-radius: $${label}-border-radius;
  box-shadow: ${shadows.join(',\n    ')};
}

.${label} {
  @include ${label}-effect;
}`;
}

function generateTailwind(config: GlassConfig): string {
  if (config.effectType === 'neumorphism') {
    const d = config.neumorphDistance;
    const b = config.neumorphBlur;
    const inset = config.neumorphInset ? 'inset-' : '';
    return `<!-- Neumorphism with Tailwind (custom shadow required) -->
<div
  style="background: ${config.surfaceColor}; border-radius: ${config.borderRadius}px;"
  class="p-${Math.round(config.padding / 4)}"
>
  <!-- Requires custom box-shadow in tailwind.config.js:
    boxShadow: {
      'neu': '${d}px ${d}px ${b}px ${config.darkShadowColor}, -${d}px -${d}px ${b}px ${config.lightShadowColor}',
      'neu-inset': 'inset ${d}px ${d}px ${b}px ${config.darkShadowColor}, inset -${d}px -${d}px ${b}px ${config.lightShadowColor}',
    }
  -->
  <div class="shadow-${inset}neu p-6 rounded-[${config.borderRadius}px]">
    Your content here
  </div>
</div>`;
  }

  const bg = glassBackground(config);
  const classes: string[] = [
    `bg-[${bg}]`,
    `backdrop-blur-[${config.blur}px]`,
    `backdrop-saturate-[${config.saturation}%]`,
    `rounded-[${config.borderRadius}px]`,
  ];
  if (config.borderWidth > 0) {
    classes.push(`border-[${config.borderWidth}px]`, `border-[${config.borderColor}]`);
  }

  return `<!-- ${config.effectType === 'liquidGlass' ? 'Liquid Glass' : 'Glassmorphism'} with Tailwind -->
<div class="${classes.join(' ')}">
  Your content here
</div>

<!-- Note: Requires Tailwind JIT mode for arbitrary values -->`;
}

function generateMUI(config: GlassConfig): string {
  if (config.effectType === 'neumorphism') {
    const d = config.neumorphDistance;
    const b = config.neumorphBlur;
    const inset = config.neumorphInset ? 'inset ' : '';
    return `// Neumorphism with MUI
<Box
  sx={{
    background: '${config.surfaceColor}',
    borderRadius: '${config.borderRadius}px',
    boxShadow: \`${inset}${d}px ${d}px ${b}px ${config.darkShadowColor}, ${inset}-${d}px -${d}px ${b}px ${config.lightShadowColor}\`,
    p: ${config.padding / 8},
  }}
>
  Your content here
</Box>`;
  }

  const bg = glassBackground(config);
  const bd = backdropFilter(config);
  const shadows: string[] = [outerShadow(config)];
  if (config.effectType === 'liquidGlass' && config.innerShadowOpacity > 0) {
    shadows.push(`inset 0 1px 0 rgba(255, 255, 255, ${config.innerShadowOpacity / 100})`);
  }

  const borderProp =
    config.borderWidth > 0 ? `\n    border: '${config.borderWidth}px solid ${config.borderColor}',` : '';

  return `// ${config.effectType === 'liquidGlass' ? 'Liquid Glass' : 'Glassmorphism'} with MUI
<Box
  sx={{
    background: '${bg}',
    backdropFilter: \`${bd}\`,
    WebkitBackdropFilter: \`${bd}\`,${borderProp}
    borderRadius: '${config.borderRadius}px',
    boxShadow: '${shadows.join(', ')}',
    p: ${config.padding / 8},
  }}
>
  Your content here
</Box>`;
}

function generateJSON(config: GlassConfig): string {
  const styles = computeGlassStyles(config);
  return JSON.stringify(
    {
      effectType: config.effectType,
      config: {
        ...(config.effectType === 'neumorphism'
          ? {
              surfaceColor: config.surfaceColor,
              neumorphDistance: config.neumorphDistance,
              neumorphBlur: config.neumorphBlur,
              lightShadowColor: config.lightShadowColor,
              darkShadowColor: config.darkShadowColor,
              neumorphInset: config.neumorphInset,
              borderRadius: config.borderRadius,
            }
          : {
              blur: `${config.blur}px`,
              opacity: config.opacity,
              saturation: `${config.saturation}%`,
              backgroundColor: config.backgroundColor,
              backgroundRgba: glassBackground(config),
              ...(config.effectType === 'liquidGlass'
                ? { innerShadowOpacity: config.innerShadowOpacity }
                : {}),
            }),
        borderRadius: `${config.borderRadius}px`,
        borderWidth: `${config.borderWidth}px`,
        borderColor: config.borderColor,
      },
      css: styles.container,
    },
    null,
    2,
  );
}

// ─── Public API ────────────────────────────────────────────────────────

export function generateCode(config: GlassConfig, format: GlassExportFormat): string {
  switch (format) {
    case 'css':
      return generateGlassCSS(config);
    case 'scss':
      return generateSCSS(config);
    case 'tailwind':
      return generateTailwind(config);
    case 'mui':
      return generateMUI(config);
    case 'json':
      return generateJSON(config);
    default:
      return generateGlassCSS(config);
  }
}

export function generateCSS(config: GlassConfig): string {
  return generateGlassCSS(config);
}
