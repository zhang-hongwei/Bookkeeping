import type { Theme } from "@mui/material/styles";

import { createTheme as muiCreateTheme } from "@mui/material/styles";

import { shadows } from "./core/shadows";
import { palette } from "./core/palette";
import { themeConfig } from "./themeConfig";
import { components } from "./core/overrides";
import { typography } from "./core/typography";
import { customShadows } from "./core/customShadows";

import type { ThemeOptions } from "./types";

export const baseTheme: ThemeOptions = {
  colorSchemes: {
    light: {
      palette: palette.light,
      shadows: shadows.light,
      customShadows: customShadows.light,
    },
    dark: {
      palette: palette.dark,
      shadows: shadows.dark,
      customShadows: customShadows.dark,
    },
  },
  components,
  typography,
  shape: { borderRadius: 8 },
  cssVariables: themeConfig.cssVariables,
  opacity: themeConfig.opacity,
  layout: themeConfig.layout,
};

type CreateThemeProps = {
  themeOverrides?: ThemeOptions;
};

export function createTheme({
  themeOverrides = {},
}: CreateThemeProps = {}): Theme {
  return muiCreateTheme(baseTheme, themeOverrides);
}
