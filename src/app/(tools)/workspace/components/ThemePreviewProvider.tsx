/**
 * ThemePreviewProvider
 * Wraps children with a dynamic MUI theme based on palette semantic colors
 */

'use client';

import React, { useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

interface ThemePreviewProviderProps {
  semanticColors: Record<string, string>;
  children: React.ReactNode;
}

export function ThemePreviewProvider({ semanticColors, children }: ThemePreviewProviderProps) {
  const theme = useMemo(() => {
    const primary = semanticColors.primary || '#1976d2';
    const secondary = semanticColors.secondary || '#9c27b0';
    const background = semanticColors.background || '#ffffff';
    const surface = semanticColors.surface || '#f5f5f5';
    const text = semanticColors.text || '#212121';

    return createTheme({
      palette: {
        mode: isLightColor(background) ? 'light' : 'dark',
        primary: {
          main: primary,
          contrastText: getContrastColor(primary),
        },
        secondary: {
          main: secondary,
          contrastText: getContrastColor(secondary),
        },
        background: {
          default: background,
          paper: surface,
        },
        text: {
          primary: text,
          secondary: adjustColorOpacity(text, 0.7),
        },
        divider: adjustColorOpacity(text, 0.12),
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
      },
    });
  }, [semanticColors]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

// Helper: Check if a color is light
function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

// Helper: Get contrast color (black or white)
function getContrastColor(hex: string): string {
  return isLightColor(hex) ? '#000000' : '#ffffff';
}

// Helper: Adjust color opacity
function adjustColorOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

// Helper: Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
