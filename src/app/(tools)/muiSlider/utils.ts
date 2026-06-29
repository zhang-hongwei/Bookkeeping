/**
 * MUI Slider Theme Designer - Utility Functions
 * Generate theme configurations and export formats
 */

import type { SliderThemeConfig } from "./types";

/**
 * Generate MuiSwitch theme overrides for createTheme
 */
export function generateCreateTheme(config: SliderThemeConfig): string {
  const variant = config.exportVariant || "medium";
  const sizeConfig = config.size[variant];

  return `import { createTheme } from '@mui/material/styles';

export const sliderTheme = createTheme({
  components: {
    MuiSlider: {
      styleOverrides: {
        root: {
          height: ${config.root.height},
          '@media (pointer: coarse)': {
            // Reach 42px touch target
            '& .MuiSlider-thumb': {
              width: 'max(16px, ${sizeConfig.thumbWidth}px)',
              height: 'max(16px, ${sizeConfig.thumbHeight}px)',
            },
          },
        },
        rail: {
          height: ${config.rail.height},
          backgroundColor: '${config.rail.backgroundColor}',
          borderRadius: '${config.rail.borderRadius}',
          opacity: ${config.rail.opacity},
        },
        track: {
          height: ${config.track.height},
          backgroundColor: '${config.track.backgroundColor}',
          borderRadius: '${config.track.borderRadius}',
          opacity: ${config.track.opacity},
        },
        thumb: {
          width: ${sizeConfig.thumbWidth},
          height: ${sizeConfig.thumbHeight},
          backgroundColor: '${config.thumb.color}',
          '&:hover': {
            boxShadow: '${config.thumb.boxShadow}',
            backgroundColor: '${config.thumb.hoverColor}',
          },
          '&:active': {
            backgroundColor: '${config.thumb.activeColor}',
          },
          borderRadius: '${config.thumb.borderRadius}',
          boxShadow: '${config.thumb.boxShadow}',
          ${config.thumb.borderWidth > 0 ? `border: '${config.thumb.borderWidth}px solid ${config.thumb.borderColor}',` : ''}
        },
        mark: {
          width: ${config.mark.width},
          height: ${config.mark.height},
          backgroundColor: '${config.mark.backgroundColor}',
          borderRadius: '${config.mark.borderRadius}',
        },
        markActive: {
          backgroundColor: '${config.mark.activeColor}',
        },
        markLabel: {
          fontSize: ${config.mark.labelFontSize},
          color: '${config.mark.labelColor}',
        },
        valueLabel: {
          fontSize: ${config.valueLabel.fontSize},
          fontWeight: ${config.valueLabel.fontWeight},
          color: '${config.valueLabel.color}',
          backgroundColor: '${config.valueLabel.backgroundColor}',
          borderRadius: '${config.valueLabel.borderRadius}',
          paddingLeft: ${config.valueLabel.paddingX},
          paddingRight: ${config.valueLabel.paddingX},
          paddingTop: ${config.valueLabel.paddingY},
          paddingBottom: ${config.valueLabel.paddingY},
          boxShadow: '${config.valueLabel.shadowBox}',
        },
      },
    },
  },
});`;
}

/**
 * Generate theme.components format
 */
export function generateThemeComponents(config: SliderThemeConfig): string {
  const variant = config.exportVariant || "medium";
  const sizeConfig = config.size[variant];

  return `// Add to your existing theme
components: {
  MuiSlider: {
    styleOverrides: {
      root: {
        height: ${config.root.height},
      },
      rail: {
        height: ${config.rail.height},
        backgroundColor: '${config.rail.backgroundColor}',
        borderRadius: '${config.rail.borderRadius}',
        opacity: ${config.rail.opacity},
      },
      track: {
        height: ${config.track.height},
        backgroundColor: '${config.track.backgroundColor}',
        borderRadius: '${config.track.borderRadius}',
        opacity: ${config.track.opacity},
      },
      thumb: {
        width: ${sizeConfig.thumbWidth},
        height: ${sizeConfig.thumbHeight},
        backgroundColor: '${config.thumb.color}',
        '&:hover': {
          boxShadow: '${config.thumb.boxShadow}',
          backgroundColor: '${config.thumb.hoverColor}',
        },
        '&:active': {
          backgroundColor: '${config.thumb.activeColor}',
        },
        borderRadius: '${config.thumb.borderRadius}',
        boxShadow: '${config.thumb.boxShadow}',
      },
      mark: {
        width: ${config.mark.width},
        height: ${config.mark.height},
        backgroundColor: '${config.mark.backgroundColor}',
        borderRadius: '${config.mark.borderRadius}',
      },
      markActive: {
        backgroundColor: '${config.mark.activeColor}',
      },
      markLabel: {
        fontSize: ${config.mark.labelFontSize},
        color: '${config.mark.labelColor}',
      },
      valueLabel: {
        fontSize: ${config.valueLabel.fontSize},
        fontWeight: ${config.valueLabel.fontWeight},
        color: '${config.valueLabel.color}',
        backgroundColor: '${config.valueLabel.backgroundColor}',
        borderRadius: '${config.valueLabel.borderRadius}',
        paddingLeft: ${config.valueLabel.paddingX},
        paddingRight: ${config.valueLabel.paddingX},
        paddingTop: ${config.valueLabel.paddingY},
        paddingBottom: ${config.valueLabel.paddingY},
        boxShadow: '${config.valueLabel.shadowBox}',
      },
    },
  },
}`;
}

/**
 * Generate CSS format
 */
export function generateCSS(config: SliderThemeConfig): string {
  const variant = config.exportVariant || "medium";
  const sizeConfig = config.size[variant];

  return `/* MUI Slider Custom CSS */
.MuiSlider-root {
  height: ${config.root.height}px !important;
}

.MuiSlider-rail {
  height: ${config.rail.height}px !important;
  background-color: ${config.rail.backgroundColor} !important;
  border-radius: ${config.rail.borderRadius} !important;
  opacity: ${config.rail.opacity} !important;
}

.MuiSlider-track {
  height: ${config.track.height}px !important;
  background-color: ${config.track.backgroundColor} !important;
  border-radius: ${config.track.borderRadius} !important;
  opacity: ${config.track.opacity} !important;
}

.MuiSlider-thumb {
  width: ${sizeConfig.thumbWidth}px !important;
  height: ${sizeConfig.thumbHeight}px !important;
  background-color: ${config.thumb.color} !important;
  border-radius: ${config.thumb.borderRadius} !important;
  box-shadow: ${config.thumb.boxShadow} !important;
  ${config.thumb.borderWidth > 0 ? `border: ${config.thumb.borderWidth}px solid ${config.thumb.borderColor} !important;` : ''}
}

.MuiSlider-thumb:hover {
  box-shadow: ${config.thumb.boxShadow} !important;
  background-color: ${config.thumb.hoverColor} !important;
}

.MuiSlider-thumb:active {
  background-color: ${config.thumb.activeColor} !important;
}

.MuiSlider-mark {
  width: ${config.mark.width}px !important;
  height: ${config.mark.height}px !important;
  background-color: ${config.mark.backgroundColor} !important;
  border-radius: ${config.mark.borderRadius} !important;
}

.MuiSlider-markActive {
  background-color: ${config.mark.activeColor} !important;
}

.MuiSlider-markLabel {
  font-size: ${config.mark.labelFontSize}px !important;
  color: ${config.mark.labelColor} !important;
}

.MuiSlider-valueLabel {
  font-size: ${config.valueLabel.fontSize}px !important;
  font-weight: ${config.valueLabel.fontWeight} !important;
  color: ${config.valueLabel.color} !important;
  background-color: ${config.valueLabel.backgroundColor} !important;
  border-radius: ${config.valueLabel.borderRadius} !important;
  padding-left: ${config.valueLabel.paddingX}px !important;
  padding-right: ${config.valueLabel.paddingX}px !important;
  padding-top: ${config.valueLabel.paddingY}px !important;
  padding-bottom: ${config.valueLabel.paddingY}px !important;
  box-shadow: ${config.valueLabel.shadowBox} !important;
}`;
}

/**
 * Generate JSON format
 */
export function generateJSON(config: SliderThemeConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Create a temporary theme for preview
 */
export function createSliderTheme(config: SliderThemeConfig) {
  const variant = config.exportVariant || "medium";
  const sizeConfig = config.size[variant];

  return {
    components: {
      MuiSlider: {
        styleOverrides: {
          root: {
            height: config.root.height,
          },
          rail: {
            height: config.rail.height,
            backgroundColor: config.rail.backgroundColor,
            borderRadius: config.rail.borderRadius,
            opacity: config.rail.opacity,
          },
          track: {
            height: config.track.height,
            backgroundColor: config.track.backgroundColor,
            borderRadius: config.track.borderRadius,
            opacity: config.track.opacity,
          },
          thumb: {
            width: sizeConfig.thumbWidth,
            height: sizeConfig.thumbHeight,
            backgroundColor: config.thumb.color,
            "&:hover": {
              boxShadow: config.thumb.boxShadow,
              backgroundColor: config.thumb.hoverColor,
            },
            "&:active": {
              backgroundColor: config.thumb.activeColor,
            },
            borderRadius: config.thumb.borderRadius,
            boxShadow: config.thumb.boxShadow,
            ...(config.thumb.borderWidth > 0 && {
              border: `${config.thumb.borderWidth}px solid ${config.thumb.borderColor}`,
            }),
          },
          mark: {
            width: config.mark.width,
            height: config.mark.height,
            backgroundColor: config.mark.backgroundColor,
            borderRadius: config.mark.borderRadius,
          },
          markActive: {
            backgroundColor: config.mark.activeColor,
          },
          markLabel: {
            fontSize: config.mark.labelFontSize,
            color: config.mark.labelColor,
          },
          valueLabel: {
            fontSize: config.valueLabel.fontSize,
            fontWeight: config.valueLabel.fontWeight,
            color: config.valueLabel.color,
            backgroundColor: config.valueLabel.backgroundColor,
            borderRadius: config.valueLabel.borderRadius,
            paddingLeft: config.valueLabel.paddingX,
            paddingRight: config.valueLabel.paddingX,
            paddingTop: config.valueLabel.paddingY,
            paddingBottom: config.valueLabel.paddingY,
            boxShadow: config.valueLabel.shadowBox,
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
  config: SliderThemeConfig,
  format: SliderThemeExportFormat
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
