/**
 * MUI ToggleButton Theme Designer Types
 * Configurable design tokens for MuiToggleButton/MuiToggleButtonGroup theme customization
 */

/** Root container tokens */
export interface RootTokens {
  minHeight: number;
  gap: number;
  backgroundColor: string;
  borderRadius: string;
}

/** Individual button tokens */
export interface ButtonTokens {
  minHeight: number;
  paddingX: number;
  fontSize: number;
  fontWeight: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  borderRadius: string;
  defaultColor: string;
  defaultBackgroundColor: string;
  hoverColor: string;
  hoverBackgroundColor: string;
  selectedColor: string;
  selectedBackgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

/** Group tokens */
export interface GroupTokens {
  gap: number;
  backgroundColor: string;
  borderRadius: string;
}

/** Complete ToggleButton theme configuration */
export interface ToggleButtonThemeConfig {
  root: RootTokens;
  button: ButtonTokens;
  group: GroupTokens;
  exportVariant?: 'standard' | 'outlined' | 'contained';
}

export interface ToggleButtonThemePreset {
  name: string;
  description: string;
  config: ToggleButtonThemeConfig;
}

export type ToggleButtonThemeExportFormat = "createTheme" | "theme-components" | "css" | "json";

/** MUI defaults */
export const MUI_DEFAULTS: ToggleButtonThemeConfig = {
  root: {
    minHeight: 48,
    gap: 0,
    backgroundColor: 'transparent',
    borderRadius: '4px',
  },
  button: {
    minHeight: 48,
    paddingX: 12,
    fontSize: 14,
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '4px',
    defaultColor: 'rgba(0, 0, 0, 0.6)',
    defaultBackgroundColor: 'transparent',
    hoverColor: 'rgba(0, 0, 0, 0.87)',
    hoverBackgroundColor: 'rgba(0, 0, 0, 0.04)',
    selectedColor: '#643DFF',
    selectedBackgroundColor: 'rgba(100, 61, 255, 0.08)',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderWidth: 1,
  },
  group: {
    gap: 0,
    backgroundColor: 'transparent',
    borderRadius: '4px',
  },
};
