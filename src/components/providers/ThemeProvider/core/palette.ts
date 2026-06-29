import type {
  PaletteColor,
  ColorSystemOptions,
  PaletteColorChannel,
} from "@mui/material/styles";

import { varAlpha, createPaletteChannel } from "@/utils/color";

import { themeConfig } from "../themeConfig";

import type { ThemeColorScheme } from "../types";

// ----------------------------------------------------------------------

/**
 * TypeScript (type definition and extension)
 * @to {@link file://./../extendThemeTypes.d.ts}
 */

// Keys for the palette colors
export type PaletteColorKey =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error";

// Palette color without additional channels
export type PaletteColorNoChannels = Omit<
  PaletteColor,
  "lighterChannel" | "darkerChannel"
>;

// Palette color with additional channels
export type PaletteColorWithChannels = PaletteColor & PaletteColorChannel;

// Extended common colors
export type CommonColorsExtend = {
  whiteChannel: string;
  blackChannel: string;
};

// Extended text colors
export type TypeTextExtend = {
  disabledChannel: string;
};

// Extended background colors
export type TypeBackgroundExtend = {
  neutral: string;
  neutralChannel: string;
};

// Extended action colors
export type TypeActionExtend = {
  activeChannel: string;
  selectedChannel: string;
};

// Extended palette colors
export type PaletteColorExtend = {
  lighter: string;
  darker: string;
  lighterChannel: string;
  darkerChannel: string;
};

// Extended grey channels
export type GreyExtend = {
  "50Channel": string;
  "100Channel": string;
  "200Channel": string;
  "300Channel": string;
  "400Channel": string;
  "500Channel": string;
  "600Channel": string;
  "700Channel": string;
  "800Channel": string;
  "900Channel": string;
};

// ----------------------------------------------------------------------

// Primary color
export const primary = createPaletteChannel(themeConfig.palette.primary);

// Secondary color
export const secondary = createPaletteChannel(themeConfig.palette.secondary);

// Info color
export const info = createPaletteChannel(themeConfig.palette.info);

// Success color
export const success = createPaletteChannel(themeConfig.palette.success);

// Warning color
export const warning = createPaletteChannel(themeConfig.palette.warning);

// Error color
export const error = createPaletteChannel(themeConfig.palette.error);

// Common color
export const common = createPaletteChannel(themeConfig.palette.common);

// Grey color
export const grey = createPaletteChannel(themeConfig.palette.grey);

// Text color
export const text = {
  light: createPaletteChannel({
    primary: grey[800],
    secondary: grey[600],
    disabled: grey[500],
  }),
};

// Background color
export const background = {
  light: createPaletteChannel({
    paper: "#FFFFFF",
    default: grey[100],
    neutral: grey[200],
  }),
};

// Base action color
export const baseAction = {
  hover: varAlpha(grey["500Channel"], 0.08),
  selected: varAlpha(grey["500Channel"], 0.16),
  focus: varAlpha(grey["500Channel"], 0.24),
  disabled: varAlpha(grey["500Channel"], 0.8),
  disabledBackground: varAlpha(grey["500Channel"], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

// Action color
export const action = {
  light: {
    ...baseAction,
    active: grey[600],
    activeChannel: grey["600Channel"],
    selectedChannel: grey["500Channel"],
  },
};

// ----------------------------------------------------------------------

// Base palette
export const basePalette = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  grey,
  divider: varAlpha(grey["500Channel"], 0.2),
};

// Dark mode colors
export const textDark = {
  dark: createPaletteChannel({
    primary: "#FFFFFF",
    secondary: grey[500],
    disabled: grey[600],
  }),
};

export const backgroundDark = {
  dark: createPaletteChannel({
    paper: "#212B36",
    default: "#161C24",
    neutral: grey[700],
  }),
};

export const actionDark = {
  dark: {
    ...baseAction,
    active: grey[500],
    activeChannel: grey["500Channel"],
    selectedChannel: grey["500Channel"],
  },
};

export const palette: Partial<
  Record<ThemeColorScheme, ColorSystemOptions["palette"]>
> = {
  light: {
    ...basePalette,
    text: text.light,
    background: background.light,
    action: action.light,
  },
  dark: {
    ...basePalette,
    text: textDark.dark,
    background: backgroundDark.dark,
    action: actionDark.dark,
  },
};
