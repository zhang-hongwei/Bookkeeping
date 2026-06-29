/**
 * MUI Switch Theme Designer Utilities
 * Functions to generate theme code from configuration
 */

import type { SwitchThemeConfig, SwitchThemeExportFormat } from "./types";
import { createTheme, Theme } from "@mui/material/styles";
import { switchClasses } from "@mui/material/Switch";

/** Convert SwitchThemeConfig to MUI Theme for ThemeProvider */
export function createSwitchTheme(config: SwitchThemeConfig): Theme {
  const width = config.root.width ?? 50;
  const height = config.root.height ?? 28;
  const padding = config.root.padding ?? 7;
  const switchBasePadding = config.root.switchBasePadding ?? 9;
  const translateX = config.root.translateX ?? 16;

  return createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: config.thumb.checkedColor,
      },
      background: {
        default: "#1a1a1a",
        paper: "#2a2a2a",
      },
    },
    components: {
      MuiSwitch: {
        styleOverrides: {
          root: {
            variants: [
              {
                props: { size: 'medium' },
                style: {
                  width,
                  height,
                  padding,
                  [`& .${switchClasses.thumb}`]: {
                    width: config.thumb.width,
                    height: config.thumb.height,
                    borderRadius: config.thumb.borderRadius,
                    boxShadow: config.thumb.boxShadow,
                  },
                  [`& .${switchClasses.track}`]: {
                    borderRadius: config.track.borderRadius,
                    backgroundColor: config.track.backgroundColor,
                    opacity: config.track.opacity,
                  },
                  [`& .${switchClasses.switchBase}`]: {
                    padding: switchBasePadding,
                    transitionDuration: config.root.transitionDuration,
                    [`&.${switchClasses.checked}`]: {
                      transform: `translateX(${translateX}px)`,
                      color: config.thumb.checkedColor,
                      '& + .MuiSwitch-track': {
                        backgroundColor: config.trackChecked.backgroundColor,
                        opacity: config.trackChecked.opacity,
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  });
}

export function generateCreateTheme(config: SwitchThemeConfig): string {
  const width = config.root.width ?? 50;
  const height = config.root.height ?? 28;
  const padding = config.root.padding ?? 7;
  const switchBasePadding = config.root.switchBasePadding ?? 9;
  const translateX = config.root.translateX ?? 16;
  const variant = config.exportVariant ?? 'medium'; // 默认 medium

  // Variants format: affects only specific size (medium or small)
  return `import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiSwitch: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { size: '${variant}' },
              style: {
                width: ${width},
                height: ${height},
                padding: ${padding},
                '& .MuiSwitch-thumb': {
                  width: ${config.thumb.width},
                  height: ${config.thumb.height},
                  borderRadius: '${config.thumb.borderRadius}',
                  boxShadow: '${config.thumb.boxShadow}',
                },
                '& .MuiSwitch-track': {
                  borderRadius: '${config.track.borderRadius}',
                  backgroundColor: '${config.track.backgroundColor}',
                  opacity: ${config.track.opacity},
                },
                '& .MuiSwitch-switchBase': {
                  padding: ${switchBasePadding},
                  transitionDuration: '${config.root.transitionDuration}',
                  '&.Mui-checked': {
                    transform: 'translateX(${translateX}px)',
                    color: '${config.thumb.checkedColor}',
                    '& + .MuiSwitch-track': {
                      backgroundColor: '${config.trackChecked.backgroundColor}',
                      opacity: ${config.trackChecked.opacity},
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },
  },
});

export default theme;

// Usage: <Switch size="${variant}" />`;
}

export function generateStyledComponents(config: SwitchThemeConfig): string {
  // Use new unified fields with fallback to legacy fields
  const padding = config.root.padding ?? config.root.paddingTop ?? 7;
  const width = config.root.width ?? 50;
  const height = config.root.height ?? 28;
  const switchBasePadding = config.root.switchBasePadding ?? 9;
  const translateX = config.root.translateX ?? 16;

  return `import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

export const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: ${width},
  height: ${height},
  padding: ${padding},
  '& .MuiSwitch-thumb': {
    width: ${config.thumb.width},
    height: ${config.thumb.height},
    borderRadius: '${config.thumb.borderRadius}',
    boxShadow: '${config.thumb.boxShadow}',
  },
  '& .MuiSwitch-track': {
    borderRadius: '${config.track.borderRadius}',
  },
  '& .MuiSwitch-switchBase': {
    padding: ${switchBasePadding},
    '&.Mui-checked': {
      transform: 'translateX(${translateX}px)',
      color: '${config.thumb.checkedColor}',
      '& + .MuiSwitch-track': {
        backgroundColor: '${config.trackChecked.backgroundColor}',
        opacity: 1,
      },
    },
    transitionDuration: '${config.root.transitionDuration}',
  },
}));`;
}

export function generateCSS(config: SwitchThemeConfig): string {
  const padding = config.root.padding ?? 7;
  const width = config.root.width ?? 50;
  const height = config.root.height ?? 28;
  const switchBasePadding = config.root.switchBasePadding ?? 9;
  const translateX = config.root.translateX ?? 16;

  return `.custom-switch {
  width: ${width}px;
  height: ${height}px;
  padding: ${padding}px;
}

.custom-switch .MuiSwitch-thumb {
  width: ${config.thumb.width}px;
  height: ${config.thumb.height}px;
  border-radius: ${config.thumb.borderRadius};
  box-shadow: ${config.thumb.boxShadow};
}

.custom-switch .MuiSwitch-track {
  border-radius: ${config.track.borderRadius};
}

.custom-switch .MuiSwitch-switchBase {
  padding: ${switchBasePadding}px;
  transition-duration: ${config.root.transitionDuration};
}

.custom-switch .MuiSwitch-switchBase.Mui-checked {
  transform: translateX(${translateX}px);
  color: ${config.thumb.checkedColor};
}

.custom-switch .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track {
  background-color: ${config.trackChecked.backgroundColor};
  opacity: ${config.trackChecked.opacity}
`;
}

export function generateJSON(config: SwitchThemeConfig): string {
  return JSON.stringify(
    {
      muiSwitch: {
        root: config.root,
        thumb: config.thumb,
        track: config.track,
        trackChecked: config.trackChecked,
        size: config.size,
      },
    },
    null,
    2
  );
}

export function generateCode(
  config: SwitchThemeConfig,
  format: SwitchThemeExportFormat
): string {
  switch (format) {
    case "createTheme":
      return generateCreateTheme(config);
    case "theme-components":
      return generateStyledComponents(config);
    case "css":
      return generateCSS(config);
    case "json":
      return generateJSON(config);
    default:
      return generateCreateTheme(config);
  }
}

export function downloadCode(code: string, filename: string): void {
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
