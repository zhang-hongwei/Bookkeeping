/**
 * MUI OutlinedInput Theme Designer Types
 * Configurable design tokens for MuiOutlinedInput theme customization
 */

/** Border tokens */
export interface BorderTokens {
  borderColor: string;
  borderWidth: number;
  borderRadius: string;
  hoverBorderColor: string;
  focusBorderColor: string;
  errorBorderColor: string;
  disabledBorderColor: string;
}

/** Input base tokens */
export interface InputTokens {
  height: number;
  padding: number;
  fontSize: number;
  fontWeight: number;
  color: string;
  placeholderColor: string;
  disabledColor: string;
  backgroundColor: string;
}

/** Adornment tokens */
export interface AdornmentTokens {
  color: string;
  hoverColor: string;
  fontSize: number;
}

/** Notch / legend tokens */
export interface NotchTokens {
  legendFontSize: number;
  legendColor: string;
  legendFocusColor: string;
}

/** Complete OutlinedInput theme configuration */
export interface OutlinedInputThemeConfig {
  border: BorderTokens;
  input: InputTokens;
  adornment: AdornmentTokens;
  notch: NotchTokens;
}

export interface OutlinedInputThemePreset {
  name: string;
  description: string;
  config: OutlinedInputThemeConfig;
}

export type OutlinedInputExportFormat = 'createTheme' | 'theme-components' | 'css' | 'json';

/** MUI defaults */
export const OUTLINED_INPUT_DEFAULTS: OutlinedInputThemeConfig = {
  border: {
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderWidth: 1,
    borderRadius: '4px',
    hoverBorderColor: 'rgba(0, 0, 0, 0.87)',
    focusBorderColor: '#643DFF',
    errorBorderColor: '#d32f2f',
    disabledBorderColor: 'rgba(0, 0, 0, 0.26)',
  },
  input: {
    height: 56,
    padding: 16.5,
    fontSize: 16,
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.87)',
    placeholderColor: 'rgba(0, 0, 0, 0.38)',
    disabledColor: 'rgba(0, 0, 0, 0.38)',
    backgroundColor: 'transparent',
  },
  adornment: {
    color: 'rgba(0, 0, 0, 0.54)',
    hoverColor: 'rgba(0, 0, 0, 0.87)',
    fontSize: 24,
  },
  notch: {
    legendFontSize: 12,
    legendColor: 'rgba(0, 0, 0, 0.6)',
    legendFocusColor: '#643DFF',
  },
};
