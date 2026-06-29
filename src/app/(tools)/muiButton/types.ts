/**
 * MUI Button Theme Designer Types
 * Configurable design tokens for MuiButton theme customization
 */

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

/** Per-size style tokens */
export interface SizeTokens {
  /** Vertical + horizontal padding, e.g. "6px 16px" */
  containedPadding: string;
  outlinedPadding: string;
  textPadding: string;
  /** Font size in rem */
  fontSize: string;
  /** Icon size in px */
  iconSize: number;
}

/** Root-level style tokens */
export interface RootTokens {
  borderRadius: number;
  textTransform: TextTransform;
  fontWeight: number;
  minWidth: number;
  letterSpacing: string;
}

/** Contained variant elevation tokens */
export interface ElevationTokens {
  boxShadow: string;
  hoverBoxShadow: string;
}

/** Complete button theme configuration */
export interface ButtonThemeConfig {
  root: RootTokens;
  small: SizeTokens;
  medium: SizeTokens;
  large: SizeTokens;
  elevation: ElevationTokens;
}

export interface ButtonThemePreset {
  name: string;
  description: string;
  config: ButtonThemeConfig;
}

export type ButtonThemeExportFormat = 'createTheme' | 'theme-components' | 'css' | 'json';

/** MUI defaults extracted from Button source */
export const MUI_DEFAULTS: ButtonThemeConfig = {
  root: {
    borderRadius: 4,
    textTransform: 'uppercase',
    fontWeight: 500,
    minWidth: 64,
    letterSpacing: '0.02857em',
  },
  small: {
    containedPadding: '4px 10px',
    outlinedPadding: '3px 9px',
    textPadding: '4px 5px',
    fontSize: '0.8125rem',   // pxToRem(13)
    iconSize: 18,
  },
  medium: {
    containedPadding: '6px 16px',
    outlinedPadding: '5px 15px',
    textPadding: '6px 8px',
    fontSize: '0.875rem',    // pxToRem(14)
    iconSize: 20,
  },
  large: {
    containedPadding: '8px 22px',
    outlinedPadding: '7px 21px',
    textPadding: '8px 11px',
    fontSize: '0.9375rem',   // pxToRem(15)
    iconSize: 22,
  },
  elevation: {
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    hoverBoxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
};
