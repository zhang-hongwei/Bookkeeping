/**
 * Background Utilities
 * Helper functions for background generation
 */

import * as chroma from 'chroma-js';

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Lighten a color
 */
export function lightenColor(color: string, amount: number): string {
  try {
    return chroma.default(color).brighten(amount).hex();
  } catch {
    return color;
  }
}

/**
 * Darken a color
 */
export function darkenColor(color: string, amount: number): string {
  try {
    return chroma.default(color).darken(amount).hex();
  } catch {
    return color;
  }
}

/**
 * Get contrasting text color (black or white)
 */
export function getContrastColor(backgroundColor: string): string {
  try {
    const chromaColor = chroma.default(backgroundColor);
    const [r, g, b] = chromaColor.rgb();
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

/**
 * Generate complementary colors
 */
export function getComplementaryColors(baseColor: string, count: number = 4): string[] {
  try {
    const colors: string[] = [baseColor];
    const baseHue = chroma.default(baseColor).hsl()[0] || 0;

    for (let i = 1; i < count; i++) {
      const hue = (baseHue + (360 / count) * i) % 360;
      const newColor = chroma.default.hsl(hue, 0.7, 0.5).hex();
      colors.push(newColor);
    }

    return colors;
  } catch {
    return [baseColor];
  }
}

/**
 * Generate analogous colors
 */
export function getAnalogousColors(baseColor: string, count: number = 4): string[] {
  try {
    const colors: string[] = [baseColor];
    const baseHue = chroma.default(baseColor).hsl()[0] || 0;

    for (let i = 1; i < count; i++) {
      const offset = (i % 2 === 0 ? 1 : -1) * Math.floor((i + 1) / 2) * 30;
      const hue = (baseHue + offset + 360) % 360;
      const newColor = chroma.default.hsl(hue, 0.7, 0.5).hex();
      colors.push(newColor);
    }

    return colors;
  } catch {
    return [baseColor];
  }
}

/**
 * Generate a gradient between two colors
 */
export function generateGradient(color1: string, color2: string, steps: number): string[] {
  try {
    const scale = chroma.default.scale([color1, color2]);
    return Array.from({ length: steps }, (_, i) => scale(i / (steps - 1)).hex());
  } catch {
    return [color1, color2];
  }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download SVG string as a file
 */
export function downloadSvg(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  downloadBlob(blob, filename);
}

/**
 * Copy image to clipboard
 */
export async function copyImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
      }, 'image/png');
    });
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate aspect ratio string
 */
export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}
