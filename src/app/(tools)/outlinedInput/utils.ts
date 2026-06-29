/**
 * MUI OutlinedInput Theme Designer - Utility Functions
 * Generate theme configurations and export formats
 */

import type { OutlinedInputThemeConfig, OutlinedInputExportFormat } from './types';

export function generateCreateTheme(config: OutlinedInputThemeConfig): string {
  return `import { createTheme } from '@mui/material/styles';

export const outlinedInputTheme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '${config.border.borderRadius}',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '${config.border.hoverBorderColor}',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '${config.border.focusBorderColor}',
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '${config.border.errorBorderColor}',
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: '${config.border.disabledBorderColor}',
          },
        },
        notchedOutline: {
          borderColor: '${config.border.borderColor}',
          borderWidth: ${config.border.borderWidth},
          legend: {
            fontSize: '${config.notch.legendFontSize}px',
            '& > span': {
              color: '${config.notch.legendColor}',
            },
          },
        },
        input: {
          height: ${config.input.height - config.input.padding * 2}px,
          padding: '${config.input.padding}px 14px',
          fontSize: ${config.input.fontSize}px,
          fontWeight: ${config.input.fontWeight},
          color: '${config.input.color}',
          backgroundColor: '${config.input.backgroundColor}',
          '&::placeholder': {
            color: '${config.input.placeholderColor}',
            opacity: 1,
          },
          '&.Mui-disabled': {
            color: '${config.input.disabledColor}',
            WebkitTextFillColor: '${config.input.disabledColor}',
          },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: '${config.adornment.color}',
          '&:hover': {
            color: '${config.adornment.hoverColor}',
          },
          '& .MuiSvgIcon-root': {
            fontSize: '${config.adornment.fontSize}px',
          },
        },
      },
    },
  },
});`;
}

export function generateThemeComponents(config: OutlinedInputThemeConfig): string {
  return `// Add to your existing theme under components
MuiOutlinedInput: {
  styleOverrides: {
    root: {
      borderRadius: '${config.border.borderRadius}',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '${config.border.hoverBorderColor}',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '${config.border.focusBorderColor}',
        borderWidth: 2,
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: '${config.border.errorBorderColor}',
      },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: '${config.border.disabledBorderColor}',
      },
    },
    notchedOutline: {
      borderColor: '${config.border.borderColor}',
      borderWidth: ${config.border.borderWidth},
    },
    input: {
      padding: '${config.input.padding}px 14px',
      fontSize: ${config.input.fontSize}px,
      fontWeight: ${config.input.fontWeight},
      color: '${config.input.color}',
      backgroundColor: '${config.input.backgroundColor}',
      '&::placeholder': {
        color: '${config.input.placeholderColor}',
        opacity: 1,
      },
    },
  },
},
MuiInputAdornment: {
  styleOverrides: {
    root: {
      color: '${config.adornment.color}',
      '& .MuiSvgIcon-root': {
        fontSize: '${config.adornment.fontSize}px',
      },
    },
  },
},`;
}

export function generateCSS(config: OutlinedInputThemeConfig): string {
  return `/* MUI OutlinedInput Custom CSS */

/* Root */
.MuiOutlinedInput-root {
  border-radius: ${config.border.borderRadius} !important;
}

/* Notched outline - default */
.MuiOutlinedInput-notchedOutline {
  border-color: ${config.border.borderColor} !important;
  border-width: ${config.border.borderWidth}px !important;
}

/* Hover */
.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
  border-color: ${config.border.hoverBorderColor} !important;
}

/* Focus */
.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
  border-color: ${config.border.focusBorderColor} !important;
  border-width: 2px !important;
}

/* Error */
.MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline {
  border-color: ${config.border.errorBorderColor} !important;
}

/* Disabled */
.MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline {
  border-color: ${config.border.disabledBorderColor} !important;
}

/* Input text */
.MuiOutlinedInput-input {
  padding: ${config.input.padding}px 14px !important;
  font-size: ${config.input.fontSize}px !important;
  font-weight: ${config.input.fontWeight} !important;
  color: ${config.input.color} !important;
  background-color: ${config.input.backgroundColor} !important;
}

.MuiOutlinedInput-input::placeholder {
  color: ${config.input.placeholderColor} !important;
  opacity: 1 !important;
}

.MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-input {
  color: ${config.input.disabledColor} !important;
  -webkit-text-fill-color: ${config.input.disabledColor} !important;
}

/* Adornment icons */
.MuiInputAdornment-root {
  color: ${config.adornment.color} !important;
}

.MuiInputAdornment-root:hover {
  color: ${config.adornment.hoverColor} !important;
}

.MuiInputAdornment-root .MuiSvgIcon-root {
  font-size: ${config.adornment.fontSize}px !important;
}

/* Notch legend */
.MuiOutlinedInput-notchedOutline legend {
  font-size: ${config.notch.legendFontSize}px !important;
}

.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline legend > span {
  color: ${config.notch.legendFocusColor} !important;
}`;
}

export function generateJSON(config: OutlinedInputThemeConfig): string {
  return JSON.stringify(config, null, 2);
}

export function createOutlinedInputTheme(config: OutlinedInputThemeConfig) {
  return {
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: config.border.borderRadius,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: config.border.hoverBorderColor,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: config.border.focusBorderColor,
              borderWidth: 2,
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: config.border.errorBorderColor,
            },
            '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
              borderColor: config.border.disabledBorderColor,
            },
          },
          notchedOutline: {
            borderColor: config.border.borderColor,
            borderWidth: config.border.borderWidth,
            legend: {
              fontSize: `${config.notch.legendFontSize}px`,
              '& > span': {
                color: config.notch.legendColor,
              },
            },
          },
          input: {
            height: config.input.height - config.input.padding * 2,
            padding: `${config.input.padding}px 14px`,
            fontSize: config.input.fontSize,
            fontWeight: config.input.fontWeight,
            color: config.input.color,
            backgroundColor: config.input.backgroundColor === 'transparent'
              ? undefined
              : config.input.backgroundColor,
            '&::placeholder': {
              color: config.input.placeholderColor,
              opacity: 1,
            },
            '&.Mui-disabled': {
              color: config.input.disabledColor,
              WebkitTextFillColor: config.input.disabledColor,
            },
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: config.adornment.color,
            '&:hover': {
              color: config.adornment.hoverColor,
            },
            '& .MuiSvgIcon-root': {
              fontSize: `${config.adornment.fontSize}px`,
            },
          },
        },
      },
    },
  };
}

export function exportConfig(
  config: OutlinedInputThemeConfig,
  format: OutlinedInputExportFormat,
): string {
  switch (format) {
    case 'createTheme':
      return generateCreateTheme(config);
    case 'theme-components':
      return generateThemeComponents(config);
    case 'css':
      return generateCSS(config);
    case 'json':
      return generateJSON(config);
    default:
      return generateCreateTheme(config);
  }
}
