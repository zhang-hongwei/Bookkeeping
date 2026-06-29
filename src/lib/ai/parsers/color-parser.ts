/**
 * Color Response Parser
 * Parse and validate AI-generated color palette responses
 */

import type { ColorPalette, ColorInfo, DesignTokenTheme, ColorScaleStep } from '@/types/ai';

export interface RawColorResponse {
  name?: string;
  description?: string;
  colors: Array<{
    hex: string;
    name?: string;
    description?: string;
  }>;
  tags?: string[];
}

/**
 * Validate and normalize HEX color
 */
export function normalizeHexColor(hex: string): string | null {
  // Remove any whitespace
  let normalized = hex.trim().toUpperCase();

  // Add # if missing
  if (!normalized.startsWith('#')) {
    normalized = '#' + normalized;
  }

  // Validate format
  const hexPattern = /^#([A-F0-9]{3}|[A-F0-9]{6})$/;
  if (!hexPattern.test(normalized)) {
    return null;
  }

  // Expand 3-digit hex to 6-digit
  if (normalized.length === 4) {
    normalized = '#' + normalized[1] + normalized[1] + normalized[2] + normalized[2] + normalized[3] + normalized[3];
  }

  return normalized;
}

/**
 * Generate a name for a color based on its hex value
 */
export function generateColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#FFFFFF': 'White',
    '#000000': 'Black',
    '#FFA500': 'Orange',
    '#800080': 'Purple',
    '#FFC0CB': 'Pink',
    '#A52A2A': 'Brown',
    '#808080': 'Gray',
    '#008000': 'Dark Green',
    '#000080': 'Navy',
    '#FFD700': 'Gold',
    '#4B0082': 'Indigo',
    '#F5F5DC': 'Beige',
    '#FF6347': 'Tomato',
    '#40E0D0': 'Turquoise',
  };

  const upperHex = hex.toUpperCase();
  if (colorNames[upperHex]) {
    return colorNames[upperHex];
  }

  // Parse RGB values
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Determine basic color family
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2 / 255;

  // Check for grayscale
  if (max - min < 20) {
    if (lightness > 0.8) return 'Light Gray';
    if (lightness > 0.5) return 'Gray';
    if (lightness > 0.2) return 'Dark Gray';
    return 'Charcoal';
  }

  // Determine hue
  let hue: string;
  if (r >= g && r >= b) {
    hue = g > b ? 'Orange' : 'Red';
  } else if (g >= r && g >= b) {
    hue = r > b ? 'Yellow' : 'Green';
  } else {
    hue = r > g ? 'Purple' : 'Blue';
  }

  // Add lightness prefix
  if (lightness > 0.7) return `Light ${hue}`;
  if (lightness < 0.3) return `Dark ${hue}`;
  return hue;
}

/**
 * Parse raw AI response into validated ColorPalette
 */
export function parseColorResponse(raw: RawColorResponse, id?: string): ColorPalette | null {
  try {
    if (!raw.colors || !Array.isArray(raw.colors) || raw.colors.length === 0) {
      return null;
    }

    const colors: ColorInfo[] = [];
    const seenHex = new Set<string>();

    for (const color of raw.colors) {
      const normalizedHex = normalizeHexColor(color.hex);
      if (!normalizedHex || seenHex.has(normalizedHex)) {
        continue;
      }
      seenHex.add(normalizedHex);

      colors.push({
        hex: normalizedHex,
        name: color.name || generateColorName(normalizedHex),
        description: color.description,
      });
    }

    if (colors.length === 0) {
      return null;
    }

    return {
      id: id || generatePaletteId(),
      name: raw.name || 'Generated Palette',
      description: raw.description || 'AI-generated color palette',
      colors,
      tags: raw.tags || [],
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Generate unique palette ID
 */
function generatePaletteId(): string {
  return `palette_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Export colors in different formats
 */
export function exportAsCSS(palette: ColorPalette): string {
  const lines = [`/* ${palette.name} */`, `/* ${palette.description} */`, ''];

  palette.colors.forEach((color, index) => {
    const varName = index === 0 ? 'primary' : index === 1 ? 'secondary' : `color-${index + 1}`;
    lines.push(`--${varName}: ${color.hex}; /* ${color.name} */`);
  });

  return lines.join('\n');
}

export function exportAsJSON(palette: ColorPalette): string {
  return JSON.stringify(
    {
      name: palette.name,
      description: palette.description,
      colors: palette.colors.map((c) => ({
        hex: c.hex,
        name: c.name,
      })),
      tags: palette.tags,
    },
    null,
    2
  );
}

export function exportAsTailwind(palette: ColorPalette): string {
  const lines = [`// ${palette.name}`, 'export const colors = {'];

  palette.colors.forEach((color, index) => {
    const name = index === 0 ? 'primary' : index === 1 ? 'secondary' : `accent-${index - 1}`;
    lines.push(`  ${name}: '${color.hex}', // ${color.name}`);
  });

  lines.push('};');
  return lines.join('\n');
}

/**
 * Export design token theme as CSS custom properties with color scales
 */
const SCALE_STEPS: ColorScaleStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export function exportDesignTokensAsCSS(theme: DesignTokenTheme): string {
  const lines = [
    `/* Design Token Theme: ${theme.source} */`,
    '',
    '/* Semantic Tokens */',
  ];

  for (const [key, value] of Object.entries(theme.semantic)) {
    lines.push(`--color-${key}: ${value};`);
  }

  lines.push('', '/* Color Scales */');

  for (const [token, scale] of Object.entries(theme.scales)) {
    for (const step of SCALE_STEPS) {
      lines.push(`--color-${token}-${step}: ${scale[step]};`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Export design token theme as Tailwind config with color scales
 */
export function exportDesignTokensAsTailwind(theme: DesignTokenTheme): string {
  const lines = [`// Design Token Theme: ${theme.source}`, 'export const theme = {', '  colors: {'];

  for (const [token, scale] of Object.entries(theme.scales)) {
    lines.push(`    ${token}: {`);
    for (const step of SCALE_STEPS) {
      lines.push(`      ${step}: '${scale[step]}',`);
    }
    lines.push('    },');
  }

  lines.push('  },', '};');
  return lines.join('\n');
}
