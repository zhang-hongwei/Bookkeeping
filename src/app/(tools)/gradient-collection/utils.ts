/**
 * Gradient Collection Utilities
 */

import type { GradientPreset, GradientStop, GradientCategory, GradientType } from './types';
import { GRADIENT_PRESETS, GRADIENT_CATEGORIES } from './presets';

/**
 * Generate CSS gradient from stops
 */
export function generateCSSFromStops(
  stops: GradientStop[],
  type: GradientType = 'linear',
  angle: number = 135
): string {
  const stopsCSS = stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ');

  switch (type) {
    case 'radial':
      return `radial-gradient(circle, ${stopsCSS})`;
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${stopsCSS})`;
    case 'linear':
    default:
      return `linear-gradient(${angle}deg, ${stopsCSS})`;
  }
}

/**
 * Generate CSS with overrides
 */
export function generateGradientCSS(
  preset: GradientPreset,
  overrides?: {
    stops?: GradientStop[];
    angle?: number;
    type?: GradientType;
  }
): string {
  const stops = overrides?.stops ?? preset.stops;
  const angle = overrides?.angle ?? preset.angle ?? 135;
  const type = overrides?.type ?? preset.type;

  return generateCSSFromStops(stops, type, angle);
}

/**
 * Filter gradients by category
 */
export function filterGradientsByCategory(
  gradients: GradientPreset[],
  category: GradientCategory | 'all'
): GradientPreset[] {
  if (category === 'all') {
    return gradients;
  }
  return gradients.filter((g) => g.category === category);
}

/**
 * Search gradients by query
 */
export function searchGradients(
  gradients: GradientPreset[],
  query: string
): GradientPreset[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return gradients;
  }

  return gradients.filter((g) => {
    return (
      g.name.toLowerCase().includes(lowerQuery) ||
      g.description?.toLowerCase().includes(lowerQuery) ||
      g.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Filter gradients by tag
 */
export function filterGradientsByTag(
  gradients: GradientPreset[],
  tag: string
): GradientPreset[] {
  if (!tag) {
    return gradients;
  }
  return gradients.filter((g) => g.tags.includes(tag));
}

/**
 * Get category info with counts
 */
export function getCategoryInfo(): Array<{ id: GradientCategory | 'all'; label: string; count: number }> {
  const counts: Record<GradientCategory, number> = {
    popular: 0,
    stripes: 0,
    circular: 0,
    angular: 0,
    smooth: 0,
    mesh: 0,
    dark: 0,
  };

  GRADIENT_PRESETS.forEach((g) => {
    counts[g.category]++;
  });

  const categories = [
    { id: 'all' as const, label: 'All', count: GRADIENT_PRESETS.length },
    ...GRADIENT_CATEGORIES.map((cat) => ({
      id: cat.id as GradientCategory,
      label: cat.label,
      count: counts[cat.id as GradientCategory] || 0,
    })),
  ];

  return categories;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * Download gradient as CSS file
 */
export function downloadGradient(preset: GradientPreset, customCSS?: string): void {
  const css = customCSS || preset.css;
  const content = `/* ${preset.name} */
/* ${preset.description || preset.tags.join(', ')} */

.gradient {
  background: ${css};
}

/* Color Variables */
:root {
${preset.stops
  .map((s, i) => `  --gradient-color-${i + 1}: ${s.color};`)
  .join('\n')}
}
`;

  const blob = new Blob([content], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${preset.id}.css`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate a unique ID for edited gradient
 */
export function generateGradientId(originalId: string): string {
  return `${originalId}-edited-${Date.now()}`;
}
