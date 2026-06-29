/**
 * MUI ToggleButton Theme Designer - Utility Functions
 * Generate theme configurations and export formats
 */

import type { ToggleButtonThemeConfig } from "./types";

/**
 * Generate MuiToggleButton theme overrides for createTheme
 */
export function generateCreateTheme(config: ToggleButtonThemeConfig): string {
  const hasGap = config.group.gap > 0;

  return `import { createTheme } from '@mui/material/styles';

export const toggleButtonTheme = createTheme({
  components: {
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          ${hasGap ? `gap: ${config.group.gap}px,` : ''}
          backgroundColor: '${config.group.backgroundColor}',
          borderRadius: '${config.group.borderRadius}',
          ${hasGap ? `
          '& .MuiToggleButtonGroup-grouped': {
            marginLeft: 0,
            borderTopWidth: 1,
            marginTop: 0,
          },
          ` : ''}
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: ${config.button.minHeight}px,
          padding: '0 ${config.button.paddingX}px',
          fontSize: ${config.button.fontSize}px,
          fontWeight: ${config.button.fontWeight},
          textTransform: '${config.button.textTransform}',
          borderRadius: '${config.button.borderRadius}',
          color: '${config.button.defaultColor}',
          backgroundColor: '${config.button.defaultBackgroundColor}',
          border: '${config.button.borderWidth}px solid ${config.button.borderColor}',
          '&:hover': {
            color: '${config.button.hoverColor}',
            backgroundColor: '${config.button.hoverBackgroundColor}',
          },
          '&.Mui-selected': {
            color: '${config.button.selectedColor}',
            backgroundColor: '${config.button.selectedBackgroundColor}',
            '&:hover': {
              backgroundColor: '${config.button.selectedBackgroundColor}',
            },
          },
        },
        sizeSmall: {
          padding: '0 7px',
          fontSize: 13,
        },
        sizeLarge: {
          padding: '0 15px',
          fontSize: 15,
        },
      },
    },
  },
});`;
}

/**
 * Generate theme.components format
 */
export function generateThemeComponents(config: ToggleButtonThemeConfig): string {
  const hasGap = config.group.gap > 0;

  return `// Add to your existing theme
components: {
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        ${hasGap ? `gap: ${config.group.gap}px,` : ''}
        backgroundColor: '${config.group.backgroundColor}',
        borderRadius: '${config.group.borderRadius}',
        ${hasGap ? `
        '& .MuiToggleButtonGroup-grouped': {
          marginLeft: 0,
          borderTopWidth: 1,
          marginTop: 0,
        },
        ` : ''}
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        minHeight: ${config.button.minHeight}px,
        padding: '0 ${config.button.paddingX}px',
        fontSize: ${config.button.fontSize}px,
        fontWeight: ${config.button.fontWeight},
        textTransform: '${config.button.textTransform}',
        borderRadius: '${config.button.borderRadius}',
        color: '${config.button.defaultColor}',
        backgroundColor: '${config.button.defaultBackgroundColor}',
        border: '${config.button.borderWidth}px solid ${config.button.borderColor}',
        '&:hover': {
          color: '${config.button.hoverColor}',
          backgroundColor: '${config.button.hoverBackgroundColor}',
        },
        '&.Mui-selected': {
          color: '${config.button.selectedColor}',
          backgroundColor: '${config.button.selectedBackgroundColor}',
          '&:hover': {
            backgroundColor: '${config.button.selectedBackgroundColor}',
          },
        },
      },
      sizeSmall: {
        padding: '0 7px',
        fontSize: 13,
      },
      sizeLarge: {
        padding: '0 15px',
        fontSize: 15,
      },
    },
  },
}`;
}

/**
 * Generate CSS format
 */
export function generateCSS(config: ToggleButtonThemeConfig): string {
  const hasGap = config.group.gap > 0;

  return `/* MUI ToggleButton Custom CSS */

/* ToggleButton Group */
.MuiToggleButtonGroup-root {
  ${hasGap ? `gap: ${config.group.gap}px !important;` : ''}
  background-color: ${config.group.backgroundColor} !important;
  border-radius: ${config.group.borderRadius} !important;
}

${hasGap ? `
/* Disable negative margins when using gap */
.MuiToggleButtonGroup-root .MuiToggleButtonGroup-grouped {
  margin-left: 0 !important;
  margin-top: 0 !important;
  border-top-width: 1px !important;
}
` : ''}

/* ToggleButton */
.MuiToggleButton-root {
  min-height: ${config.button.minHeight}px !important;
  padding: 0 ${config.button.paddingX}px !important;
  font-size: ${config.button.fontSize}px !important;
  font-weight: ${config.button.fontWeight} !important;
  text-transform: ${config.button.textTransform} !important;
  border-radius: ${config.button.borderRadius} !important;
  color: ${config.button.defaultColor} !important;
  background-color: ${config.button.defaultBackgroundColor} !important;
  border: ${config.button.borderWidth}px solid ${config.button.borderColor} !important;
}

.MuiToggleButton-root:hover {
  color: ${config.button.hoverColor} !important;
  background-color: ${config.button.hoverBackgroundColor} !important;
}

.MuiToggleButton-root.Mui-selected {
  color: ${config.button.selectedColor} !important;
  background-color: ${config.button.selectedBackgroundColor} !important;
}

.MuiToggleButton-root.Mui-selected:hover {
  background-color: ${config.button.selectedBackgroundColor} !important;
}

/* Size variants */
.MuiToggleButton-root.MuiToggleButton-sizeSmall {
  padding: 0 7px !important;
  font-size: 13px !important;
}

.MuiToggleButton-root.MuiToggleButton-sizeLarge {
  padding: 0 15px !important;
  font-size: 15px !important;
}
`;
}

/**
 * Generate JSON format
 */
export function generateJSON(config: ToggleButtonThemeConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Create a temporary theme for preview
 */
export function createToggleButtonTheme(config: ToggleButtonThemeConfig) {
  const hasGap = config.group.gap > 0;

  return {
    components: {
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            ...(hasGap && { gap: config.group.gap }),
            backgroundColor: config.group.backgroundColor,
            borderRadius: config.group.borderRadius,
            ...(hasGap && {
              "& .MuiToggleButtonGroup-grouped": {
                marginLeft: 0,
                borderTopWidth: 1,
                marginTop: 0,
              },
            }),
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minHeight: config.button.minHeight,
            padding: `0 ${config.button.paddingX}px`,
            fontSize: config.button.fontSize,
            fontWeight: config.button.fontWeight,
            textTransform: config.button.textTransform,
            borderRadius: config.button.borderRadius,
            color: config.button.defaultColor,
            backgroundColor: config.button.defaultBackgroundColor,
            border: `${config.button.borderWidth}px solid ${config.button.borderColor}`,
            "&:hover": {
              color: config.button.hoverColor,
              backgroundColor: config.button.hoverBackgroundColor,
            },
            "&.Mui-selected": {
              color: config.button.selectedColor,
              backgroundColor: config.button.selectedBackgroundColor,
              "&:hover": {
                backgroundColor: config.button.selectedBackgroundColor,
              },
            },
          },
          sizeSmall: {
            padding: "0 7px",
            fontSize: 13,
          },
          sizeLarge: {
            padding: "0 15px",
            fontSize: 15,
          },
        },
      },
    },
  };
}

/**
 * Export configuration in specified format
 */
export function exportConfig(
  config: ToggleButtonThemeConfig,
  format: "createTheme" | "theme-components" | "css" | "json"
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
