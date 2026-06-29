/**
 * Smart UI Color Derivation
 * Derives appropriate UI theme colors from palette semantic colors.
 *
 * Strategy:
 * - primary / secondary / accent → keep as-is (interactive elements)
 * - background / surface / text → derive from primary to ensure readability
 */

import { createTheme } from '@mui/material/styles';

interface SemanticColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

/**
 * Derive a proper UI theme from palette semantic colors.
 * Only primary/secondary/accent are used directly.
 * Background/surface/text are derived to ensure good contrast.
 */
export function deriveUITheme(semantic: SemanticColors, darkMode: boolean) {
  const primary = semantic.primary || '#1976d2';
  const secondary = semantic.secondary || '#9c27b0';
  const accent = semantic.accent || '#f50057';

  // Derive background/surface/text from primary hue
  const bg = darkMode
    ? deriveDarkBackground(primary)
    : deriveLightBackground(primary);

  const surface = darkMode
    ? lightenHex(bg, 8)
    : darkenHex(bg, 3);

  const text = darkMode
    ? '#f0f0f0'
    : '#1a1a1a';

  const textSecondary = darkMode
    ? 'rgba(255,255,255,0.7)'
    : 'rgba(0,0,0,0.6)';

  const divider = darkMode
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(0,0,0,0.08)';

  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: primary,
        contrastText: contrastText(primary),
      },
      secondary: {
        main: secondary,
        contrastText: contrastText(secondary),
      },
      error: {
        main: '#f44336',
      },
      warning: {
        main: '#ff9800',
      },
      info: {
        main: '#2196f3',
      },
      success: {
        main: '#4caf50',
      },
      background: {
        default: bg,
        paper: surface,
      },
      text: {
        primary: text,
        secondary: textSecondary,
      },
      divider,
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
    },
  });
}

// ==================== Color Helpers ====================

/**
 * Derive a light background from primary color.
 * Takes the hue of primary but makes it very light and desaturated.
 */
function deriveLightBackground(primary: string): string {
  const hsl = hexToHSL(primary);
  // Very light, low saturation background
  return hslToHex(hsl.h, Math.min(hsl.s * 0.15, 12), 97);
}

/**
 * Derive a dark background from primary color.
 * Takes the hue but makes it very dark.
 */
function deriveDarkBackground(primary: string): string {
  const hsl = hexToHSL(primary);
  return hslToHex(hsl.h, Math.min(hsl.s * 0.3, 15), 10);
}

/**
 * Get contrast text (black or white) for a given color.
 */
function contrastText(hex: string): string {
  const [r, g, b] = hexToRGB(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

/**
 * Lighten a hex color by a percentage.
 */
function lightenHex(hex: string, percent: number): string {
  const [r, g, b] = hexToRGB(hex);
  const lr = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  const lg = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  const lb = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  return rgbToHex(lr, lg, lb);
}

/**
 * Darken a hex color by a percentage.
 */
function darkenHex(hex: string, percent: number): string {
  const [r, g, b] = hexToRGB(hex);
  const dr = Math.max(0, Math.round(r * (1 - percent / 100)));
  const dg = Math.max(0, Math.round(g * (1 - percent / 100)));
  const db = Math.max(0, Math.round(b * (1 - percent / 100)));
  return rgbToHex(dr, dg, db);
}

// ==================== Color Conversion ====================

function hexToRGB(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

interface HSL { h: number; s: number; l: number; }

function hexToHSL(hex: string): HSL {
  const [r, g, b] = hexToRGB(hex).map((v) => v / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return rgbToHex(Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255));
}
