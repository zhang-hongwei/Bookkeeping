import type {} from "@mui/material/themeCssVarsAugmentation";

import type { FontStyleExtend } from "./core/typography";
import type { CustomShadows } from "./core/customShadows";
import type {
  GreyExtend,
  TypeTextExtend,
  CommonColorsExtend,
  PaletteColorExtend,
  TypeBackgroundExtend,
  TypeActionExtend,
} from "./core/palette";
import type { OpacityConfig } from "./core/opacity";
import type { LayoutConfig } from "./core/layout";

// ----------------------------------------------------------------------

/** **************************************
 * EXTEND CORE
 * Palette, typography, shadows...
 *************************************** */

/**
 * Palette
 * https://mui.com/customization/palette/
 * @from {@link file://./core/palette.ts}
 */
declare module "@mui/material/styles" {
  // grey
  interface Color extends GreyExtend {}
  // text
  interface TypeText extends TypeTextExtend {}
  // black & white
  interface CommonColors extends CommonColorsExtend {}
  // background
  interface TypeBackground extends TypeBackgroundExtend {}
  // action
  interface TypeAction extends TypeActionExtend {}
  // primary, secondary, info, success, warning, error
  interface PaletteColor extends PaletteColorExtend {}
  interface SimplePaletteColorOptions extends Partial<PaletteColorExtend> {}
}

/**
 * Typography
 * https://mui.com/customization/typography/
 * @from {@link file://./core/typography.ts}
 */
declare module "@mui/material/styles" {
  interface TypographyVariants extends FontStyleExtend {}
  interface TypographyVariantsOptions extends Partial<FontStyleExtend> {}
}

declare module "@mui/material/styles" {
  /**
   * Custom shadows
   * @from {@link file://./core/customShadows.ts}
   */
  interface Theme {
    customShadows: CustomShadows;
    opacity: OpacityConfig;
    layout: LayoutConfig;
  }
  interface ThemeOptions {
    customShadows?: CustomShadows;
    opacity?: OpacityConfig;
    layout?: LayoutConfig;
  }
  interface ThemeVars {
    customShadows: CustomShadows;
    typography: Theme["typography"];
    transitions: Theme["transitions"];
  }
}
