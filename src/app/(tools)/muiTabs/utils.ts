/**
 * MUI Tabs Theme Designer - Utility Functions
 * Generate theme configurations and export formats
 */

import type { TabsThemeConfig } from "./types";

/**
 * Generate MuiTabs theme overrides for createTheme
 */
export function generateCreateTheme(config: TabsThemeConfig): string {
  return `import { createTheme } from '@mui/material/styles';

export const tabsTheme = createTheme({
  components: {
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: ${config.root.minHeight}px,
          backgroundColor: '${config.root.backgroundColor}',
        },
        flexContainer: {
          gap: ${config.flexContainer.gap}px,
        },
        scroller: {
          display: 'flex',
          gap: ${config.flexContainer.gap}px',
        },
        indicator: {
          height: ${config.indicator.height}px,
          backgroundColor: '${config.indicator.backgroundColor}',
          borderRadius: '${config.indicator.borderRadius}',
          transitionDuration: '${config.indicator.transitionDuration}',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: ${config.tab.minHeight}px,
          padding: '0 ${config.tab.paddingX}px',
          fontSize: ${config.tab.fontSize}px,
          fontWeight: ${config.tab.fontWeight},
          textTransform: '${config.tab.textTransform}',
          color: '${config.tab.color}',
          borderRadius: '${config.tab.borderRadius}',
          '&:hover': {
            color: '${config.tab.hoverColor}',
            backgroundColor: 'transparent',
          },
          '&.Mui-selected': {
            color: '${config.tab.selectedColor}',
            backgroundColor: '${config.tab.selectedBackgroundColor}',
          },
        },
      },
    },
    MuiTabScrollButton: {
      styleOverrides: {
        root: {
          color: '${config.scrollButtons.color}',
        },
      },
    },
  },
});`;
}

/**
 * Generate theme.components format
 */
export function generateThemeComponents(config: TabsThemeConfig): string {
  return `// Add to your existing theme
components: {
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: ${config.root.minHeight}px,
        backgroundColor: '${config.root.backgroundColor}',
      },
      flexContainer: {
        gap: ${config.flexContainer.gap}px,
      },
      scroller: {
        display: 'flex',
        gap: ${config.flexContainer.gap}px,
      },
      indicator: {
        height: ${config.indicator.height}px,
        backgroundColor: '${config.indicator.backgroundColor}',
        borderRadius: '${config.indicator.borderRadius}',
        transitionDuration: '${config.indicator.transitionDuration}',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: ${config.tab.minHeight}px,
        padding: '0 ${config.tab.paddingX}px',
        fontSize: ${config.tab.fontSize}px,
        fontWeight: ${config.tab.fontWeight},
        textTransform: '${config.tab.textTransform}',
        color: '${config.tab.color}',
        borderRadius: '${config.tab.borderRadius}',
        '&:hover': {
          color: '${config.tab.hoverColor}',
          backgroundColor: 'transparent',
        },
        '&.Mui-selected': {
          color: '${config.tab.selectedColor}',
          backgroundColor: '${config.tab.selectedBackgroundColor}',
        },
      },
    },
  },
  MuiTabScrollButton: {
    styleOverrides: {
      root: {
        color: '${config.scrollButtons.color}',
      },
    },
  },
}`;
}

/**
 * Generate CSS format
 */
export function generateCSS(config: TabsThemeConfig): string {
  return `/* MUI Tabs Custom CSS */

/* Root container */
.MuiTabs-root {
  min-height: ${config.root.minHeight}px !important;
  background-color: ${config.root.backgroundColor} !important;
}

/* Flex container */
.MuiTabs-flexContainer {
  gap: ${config.flexContainer.gap}px !important;
}

.MuiTabs-scroller {
  display: flex !important;
  gap: ${config.flexContainer.gap}px !important;
}

/* Indicator */
.MuiTabs-indicator {
  height: ${config.indicator.height}px !important;
  background-color: ${config.indicator.backgroundColor} !important;
  border-radius: ${config.indicator.borderRadius} !important;
  transition-duration: ${config.indicator.transitionDuration} !important;
}

/* Tab */
.MuiTab-root {
  min-height: ${config.tab.minHeight}px !important;
  padding: 0 ${config.tab.paddingX}px !important;
  font-size: ${config.tab.fontSize}px !important;
  font-weight: ${config.tab.fontWeight} !important;
  text-transform: ${config.tab.textTransform} !important;
  color: ${config.tab.color} !important;
  border-radius: ${config.tab.borderRadius} !important;
}

.MuiTab-root:hover {
  color: ${config.tab.hoverColor} !important;
  background-color: transparent !important;
}

.MuiTab-root.Mui-selected {
  color: ${config.tab.selectedColor} !important;
  background-color: ${config.tab.selectedBackgroundColor} !important;
}

/* Scroll buttons */
.MuiTabScrollButton-root {
  color: ${config.scrollButtons.color} !important;
}
`;
}

/**
 * Generate JSON format
 */
export function generateJSON(config: TabsThemeConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Create a temporary theme for preview
 */
export function createTabsTheme(config: TabsThemeConfig) {
  return {
    components: {
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: config.root.minHeight,
            backgroundColor: config.root.backgroundColor,
          },
          flexContainer: {
            gap: config.flexContainer.gap,
          },
          scroller: {
            display: "flex",
            gap: config.flexContainer.gap,
          },
          indicator: {
            height: config.indicator.height,
            backgroundColor: config.indicator.backgroundColor,
            borderRadius: config.indicator.borderRadius,
            transitionDuration: config.indicator.transitionDuration,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: config.tab.minHeight,
            padding: `0 ${config.tab.paddingX}px`,
            fontSize: config.tab.fontSize,
            fontWeight: config.tab.fontWeight,
            textTransform: config.tab.textTransform,
            color: config.tab.color,
            borderRadius: config.tab.borderRadius,
            "&:hover": {
              color: config.tab.hoverColor,
              backgroundColor: "transparent",
            },
            "&.Mui-selected": {
              color: config.tab.selectedColor,
              backgroundColor: config.tab.selectedBackgroundColor,
            },
          },
        },
      },
      MuiTabScrollButton: {
        styleOverrides: {
          root: {
            color: config.scrollButtons.color,
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
  config: TabsThemeConfig,
  format: TabsThemeExportFormat
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
