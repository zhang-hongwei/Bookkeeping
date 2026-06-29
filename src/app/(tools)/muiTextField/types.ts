/**
 * MUI TextField Theme Designer Types
 * Configurable design tokens for MuiTextField theme customization
 */

/** Root container tokens */
export interface RootTokens {
  backgroundColor: string;
  borderRadius: string;
}

/** Input base tokens */
export interface InputBaseTokens {
  height: number;
  padding: number;
  fontSize: number;
  fontWeight: number;
  color: string;
}

/** Outlined input specific tokens */
export interface OutlinedInputTokens {
  borderColor: string;
  borderWidth: number;
  borderRadius: string;
  hoverBorderColor: string;
  focusBorderColor: string;
  errorBorderColor: string;
}

/** Filled input specific tokens */
export interface FilledInputTokens {
  backgroundColor: string;
  hoverBackgroundColor: string;
  focusBackgroundColor: string;
  borderRadius: string;
}

/** Standard input specific tokens */
export interface StandardInputTokens {
  borderBottomColor: string;
  borderBottomWidth: number;
  hoverBorderBottomColor: string;
  focusBorderBottomColor: string;
}

/** Label tokens */
export interface LabelTokens {
  fontSize: number;
  fontWeight: number;
  color: string;
  focusColor: string;
  errorColor: string;
  shrinkOffset: number;
}

/** Helper text tokens */
export interface HelperTextTokens {
  fontSize: number;
  color: string;
  errorColor: string;
}

/** Adornment tokens (start/end icons) */
export interface AdornmentTokens {
  color: string;
  fontSize: number;
}

/** Complete TextField theme configuration */
export interface TextFieldThemeConfig {
  root: RootTokens;
  inputBase: InputBaseTokens;
  outlined: OutlinedInputTokens;
  filled: FilledInputTokens;
  standard: StandardInputTokens;
  label: LabelTokens;
  helperText: HelperTextTokens;
  adornment: AdornmentTokens;
  variant: 'outlined' | 'filled' | 'standard';
  exportVariant?: 'outlined' | 'filled' | 'standard';
}

export interface TextFieldThemePreset {
  name: string;
  description: string;
  config: TextFieldThemeConfig;
}

export type TextFieldThemeExportFormat = "createTheme" | "theme-components" | "css" | "json";

/** MUI defaults */
export const MUI_DEFAULTS: TextFieldThemeConfig = {
  root: {
    backgroundColor: 'transparent',
    borderRadius: '4px',
  },
  inputBase: {
    height: 56,
    padding: 16.5,
    fontSize: 16,
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.87)',
  },
  outlined: {
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderWidth: 1,
    borderRadius: '4px',
    hoverBorderColor: 'rgba(0, 0, 0, 0.87)',
    focusBorderColor: '#643DFF',
    errorBorderColor: '#d32f2f',
  },
  filled: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    hoverBackgroundColor: 'rgba(0, 0, 0, 0.09)',
    focusBackgroundColor: 'rgba(0, 0, 0, 0.13)',
    borderRadius: '4px',
  },
  standard: {
    borderBottomColor: 'rgba(0, 0, 0, 0.42)',
    borderBottomWidth: 1,
    hoverBorderBottomColor: 'rgba(0, 0, 0, 0.87)',
    focusBorderBottomColor: '#643DFF',
  },
  label: {
    fontSize: 16,
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.6)',
    focusColor: '#643DFF',
    errorColor: '#d32f2f',
    shrinkOffset: 9,
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    errorColor: '#d32f2f',
  },
  adornment: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: 24,
  },
  variant: 'outlined',
};
