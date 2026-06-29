/**
 * MUI TextField Theme Designer - Utility Functions
 * Generate theme configurations and export formats
 */

import type { TextFieldThemeConfig, TextFieldThemeExportFormat } from "./types";

/**
 * Generate MuiTextField theme overrides for createTheme
 */
export function generateCreateTheme(config: TextFieldThemeConfig): string {
  const variant = config.exportVariant || config.variant;

  return `import { createTheme } from '@mui/material/styles';

export const textFieldTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '${config.root.backgroundColor}',
          borderRadius: '${config.root.borderRadius}',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          height: ${config.inputBase.height},
          backgroundColor: 'transparent',
        },
        input: {
          padding: ${config.inputBase.padding}px,
          fontSize: ${config.inputBase.fontSize}px,
          fontWeight: ${config.inputBase.fontWeight},
          color: '${config.inputBase.color}',
        },
      },
    }${generateVariantCode(variant, config)},
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: ${config.label.fontSize}px,
          fontWeight: ${config.label.fontWeight},
          color: '${config.label.color}',
          '&.Mui-focused': {
            color: '${config.label.focusColor}',
          },
          '&.Mui-error': {
            color: '${config.label.errorColor}',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: ${config.helperText.fontSize}px,
          color: '${config.helperText.color}',
          '&.Mui-error': {
            color: '${config.helperText.errorColor}',
          },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: '${config.adornment.color}',
          '& p, & svg': {
            fontSize: ${config.adornment.fontSize}px,
          },
        },
      },
    },
  },
});`;
}

function generateVariantCode(variant: string, config: TextFieldThemeConfig): string {
  switch (variant) {
    case 'outlined':
      return `,
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '${config.outlined.borderColor}',
            borderWidth: ${config.outlined.borderWidth}px,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '${config.outlined.hoverBorderColor}',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '${config.outlined.focusBorderColor}',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '${config.outlined.errorBorderColor}',
          },
          borderRadius: '${config.outlined.borderRadius}',
        },
      },
    }`;

    case 'filled':
      return `,
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: '${config.filled.backgroundColor}',
          '&:hover': {
            backgroundColor: '${config.filled.hoverBackgroundColor}',
            '@media (hover: none)': {
              backgroundColor: '${config.filled.hoverBackgroundColor}',
            },
          },
          '&.Mui-focused': {
            backgroundColor: '${config.filled.focusBackgroundColor}',
          },
          borderRadius: '${config.filled.borderRadius}',
        },
      },
    }`;

    case 'standard':
      return `,
    MuiInput: {
      styleOverrides: {
        root: {
          borderBottomColor: '${config.standard.borderBottomColor}',
          borderWidth: ${config.standard.borderBottomWidth}px,
          '&:hover:not(.Mui-disabled):before': {
            borderBottomColor: '${config.standard.hoverBorderBottomColor}',
          },
          '&.Mui-focused:after': {
            borderBottomColor: '${config.standard.focusBorderBottomColor}',
          },
        },
      },
    }`;

    default:
      return '';
  }
}

/**
 * Generate theme.components format
 */
export function generateThemeComponents(config: TextFieldThemeConfig): string {
  const variant = config.exportVariant || config.variant;

  return `// Add to your existing theme
components: {
  MuiTextField: {
    styleOverrides: {
      root: {
        backgroundColor: '${config.root.backgroundColor}',
        borderRadius: '${config.root.borderRadius}',
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        height: ${config.inputBase.height},
      },
      input: {
        padding: ${config.inputBase.padding}px,
        fontSize: ${config.inputBase.fontSize}px,
        fontWeight: ${config.inputBase.fontWeight},
        color: '${config.inputBase.color}',
      },
    },
  }${generateVariantComponents(variant, config)},
  MuiFormLabel: {
    styleOverrides: {
      root: {
        fontSize: ${config.label.fontSize}px,
        fontWeight: ${config.label.fontWeight},
        color: '${config.label.color}',
        '&.Mui-focused': {
          color: '${config.label.focusColor}',
        },
        '&.Mui-error': {
          color: '${config.label.errorColor}',
        },
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        fontSize: ${config.helperText.fontSize}px,
        color: '${config.helperText.color}',
        '&.Mui-error': {
          color: '${config.helperText.errorColor}',
        },
      },
    },
  },
}`;
}

function generateVariantComponents(variant: string, config: TextFieldThemeConfig): string {
  switch (variant) {
    case 'outlined':
      return `,
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '${config.outlined.borderColor}',
          borderWidth: ${config.outlined.borderWidth}px,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '${config.outlined.hoverBorderColor}',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '${config.outlined.focusBorderColor}',
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: '${config.outlined.errorBorderColor}',
        },
        borderRadius: '${config.outlined.borderRadius}',
      },
    },
  }`;

    case 'filled':
      return `,
  MuiFilledInput: {
    styleOverrides: {
      root: {
        backgroundColor: '${config.filled.backgroundColor}',
        '&:hover': {
          backgroundColor: '${config.filled.hoverBackgroundColor}',
        },
        '&.Mui-focused': {
          backgroundColor: '${config.filled.focusBackgroundColor}',
        },
        borderRadius: '${config.filled.borderRadius}',
      },
    },
  }`;

    case 'standard':
      return `,
  MuiInput: {
    styleOverrides: {
      root: {
        borderBottomColor: '${config.standard.borderBottomColor}',
        borderWidth: ${config.standard.borderBottomWidth}px,
        '&:hover:not(.Mui-disabled):before': {
          borderBottomColor: '${config.standard.hoverBorderBottomColor}',
        },
        '&.Mui-focused:after': {
          borderBottomColor: '${config.standard.focusBorderBottomColor}',
        },
      },
    },
  }`;

    default:
      return '';
  }
}

/**
 * Generate CSS format
 */
export function generateCSS(config: TextFieldThemeConfig): string {
  const variant = config.exportVariant || config.variant;

  return `/* MUI TextField Custom CSS */

/* Base styles */
.MuiTextField-root {
  background-color: ${config.root.backgroundColor};
  border-radius: ${config.root.borderRadius};
}

.MuiInputBase-root {
  height: ${config.inputBase.height}px !important;
}

.MuiInputBase-input {
  padding: ${config.inputBase.padding}px !important;
  font-size: ${config.inputBase.fontSize}px !important;
  font-weight: ${config.inputBase.fontWeight} !important;
  color: ${config.inputBase.color} !important;
}

/* Label styles */
.MuiFormLabel-root {
  font-size: ${config.label.fontSize}px !important;
  font-weight: ${config.label.fontWeight} !important;
  color: ${config.label.color} !important;
}

.MuiFormLabel-root.Mui-focused {
  color: ${config.label.focusColor} !important;
}

.MuiFormLabel-root.Mui-error {
  color: ${config.label.errorColor} !important;
}

/* Helper text styles */
.MuiFormHelperText-root {
  font-size: ${config.helperText.fontSize}px !important;
  color: ${config.helperText.color} !important;
}

.MuiFormHelperText-root.Mui-error {
  color: ${config.helperText.errorColor} !important;
}

/* Adornment styles */
.MuiInputAdornment-root {
  color: ${config.adornment.color} !important;
}

.MuiInputAdornment-root p,
.MuiInputAdornment-root svg {
  font-size: ${config.adornment.fontSize}px !important;
}
${generateVariantCSS(variant, config)}`;
}

function generateVariantCSS(variant: string, config: TextFieldThemeConfig): string {
  switch (variant) {
    case 'outlined':
      return `
/* Outlined variant */
.MuiOutlinedInput-notchedOutline {
  border-color: ${config.outlined.borderColor} !important;
  border-width: ${config.outlined.borderWidth}px !important;
}

.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
  border-color: ${config.outlined.hoverBorderColor} !important;
}

.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
  border-color: ${config.outlined.focusBorderColor} !important;
}

.MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline {
  border-color: ${config.outlined.errorBorderColor} !important;
}

.MuiOutlinedInput-root {
  border-radius: ${config.outlined.borderRadius} !important;
}
`;

    case 'filled':
      return `
/* Filled variant */
.MuiFilledInput-root {
  background-color: ${config.filled.backgroundColor} !important;
  border-radius: ${config.filled.borderRadius} !important;
}

.MuiFilledInput-root:hover {
  background-color: ${config.filled.hoverBackgroundColor} !important;
}

.MuiFilledInput-root.Mui-focused {
  background-color: ${config.filled.focusBackgroundColor} !important;
}
`;

    case 'standard':
      return `
/* Standard variant */
.MuiInput-root:before {
  border-bottom-color: ${config.standard.borderBottomColor} !important;
  border-bottom-width: ${config.standard.borderBottomWidth}px !important;
}

.MuiInput-root:hover:not(.Mui-disabled):before {
  border-bottom-color: ${config.standard.hoverBorderBottomColor} !important;
}

.MuiInput-root.Mui-focused:after {
  border-bottom-color: ${config.standard.focusBorderBottomColor} !important;
}
`;

    default:
      return '';
  }
}

/**
 * Generate JSON format
 */
export function generateJSON(config: TextFieldThemeConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Create a temporary theme for preview
 */
export function createTextFieldTheme(config: TextFieldThemeConfig) {
  const variant = config.exportVariant || config.variant;

  return {
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: config.root.backgroundColor,
            borderRadius: config.root.borderRadius,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            height: config.inputBase.height,
          },
          input: {
            padding: config.inputBase.padding,
            fontSize: config.inputBase.fontSize,
            fontWeight: config.inputBase.fontWeight,
            color: config.inputBase.color,
          },
        },
      },
      ...getVariantTheme(variant, config),
      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontSize: config.label.fontSize,
            fontWeight: config.label.fontWeight,
            color: config.label.color,
            "&.Mui-focused": {
              color: config.label.focusColor,
            },
            "&.Mui-error": {
              color: config.label.errorColor,
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: config.helperText.fontSize,
            color: config.helperText.color,
            "&.Mui-error": {
              color: config.helperText.errorColor,
            },
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: config.adornment.color,
            "& p, & svg": {
              fontSize: config.adornment.fontSize,
            },
          },
        },
      },
    },
  };
}

function getVariantTheme(variant: string, config: TextFieldThemeConfig) {
  switch (variant) {
    case 'outlined':
      return {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: config.outlined.borderColor,
                borderWidth: config.outlined.borderWidth,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: config.outlined.hoverBorderColor,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: config.outlined.focusBorderColor,
              },
              "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                borderColor: config.outlined.errorBorderColor,
              },
              borderRadius: config.outlined.borderRadius,
            },
          },
        },
      };

    case 'filled':
      return {
        MuiFilledInput: {
          styleOverrides: {
            root: {
              backgroundColor: config.filled.backgroundColor,
              "&:hover": {
                backgroundColor: config.filled.hoverBackgroundColor,
              },
              "&.Mui-focused": {
                backgroundColor: config.filled.focusBackgroundColor,
              },
              borderRadius: config.filled.borderRadius,
            },
          },
        },
      };

    case 'standard':
      return {
        MuiInput: {
          styleOverrides: {
            root: {
              borderBottomColor: config.standard.borderBottomColor,
              "&:hover:not(.Mui-disabled):before": {
                borderBottomColor: config.standard.hoverBorderBottomColor,
              },
              "&.Mui-focused:after": {
                borderBottomColor: config.standard.focusBorderBottomColor,
              },
            },
          },
        },
      };

    default:
      return {};
  }
}

/**
 * Export configuration in specified format
 */
export function exportConfig(
  config: TextFieldThemeConfig,
  format: TextFieldThemeExportFormat
): string {
  switch (format) {
    case "createTheme":
      return generateCreateTheme(config);
    case "theme-components":
      return generateThemeComponents(config);
    case "css":
      return generateCSS(config);
    case "json":
      return generateJSON(config);
    default:
      return generateCreateTheme(config);
  }
}
