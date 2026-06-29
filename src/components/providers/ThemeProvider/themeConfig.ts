import type { CommonColors } from '@mui/material/styles';

import type { ThemeCssVariables } from './types';
import type { PaletteColorNoChannels } from './core/palette';
import type { OpacityConfig } from './core/opacity';
import type { LayoutConfig } from './core/layout';

// ----------------------------------------------------------------------

type ThemeConfig = {
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
    PaletteColorNoChannels
  > & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<
      '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      string
    >;
  };
  opacity: OpacityConfig;
  layout: LayoutConfig;
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  classesPrefix: 'mui',
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'DM Sans Variable',
    secondary: 'Barlow',
  },
  /** **************************************
   * Palette
   *************************************** */
  palette: {
    primary: {
      lighter: '#EFD6FF',
      light: '#C684FF',
      main: '#643DFF',
      dark: '#5119B7',
      darker: '#27097A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#EFD6FF',
      light: '#C684FF',
      main: '#8E33FF',
      dark: '#5119B7',
      darker: '#27097A',
      contrastText: '#FFFFFF',
    },
    info: {
      lighter: '#CAFDF5',
      light: '#61F3F3',
      main: '#00A6FF',
      dark: '#006C9C',
      darker: '#003768',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#D3FCD2',
      light: '#77ED8B',
      main: '#29CCB0',
      dark: '#118D57',
      darker: '#065E49',
      contrastText: '#ffffff',
    },
    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FC9532',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#FFE9D5',
      light: '#FFAC82',
      main: '#EC3131',
      dark: '#B71D18',
      darker: '#7A0916',
      contrastText: '#FFFFFF',
    },
    grey: {
      '50': '#FCFDFD',
      '100': '#FBFAFC',
      '200': '#F4F6F8',
      '300': '#DFE3E8',
      '400': '#C4CDD5',
      '500': '#919EAB',
      // '500': '#F0EFF1',
      '600': '#637381',
      '700': '#454F5B',
      '800': '#1C252E',
      '900': '#141A21',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
  /** **************************************
   * Opacity
   *************************************** */
  opacity: {
    inputPlaceholder: 1,
    inputUnderline: 0.32,
    switchTrackDisabled: 0.48,
    switchTrack: 1,
    filled: {
      commonHoverBg: 0.72,
    },
    outlined: {
      border: 0.48,
    },
    soft: {
      bg: 0.16,
      hoverBg: 0.32,
      commonBg: 0.08,
      commonHoverBg: 0.16,
      border: 0.24,
    },
  },
  /** **************************************
   * Layout
   *************************************** */
  layout: {
    nav: {
      zIndex: 1201,
      mobileWidth: 288,
      miniWidth: 88,
      verticalWidth: 300,
      horizontalHeight: 64,
    },
    header: {
      blur: 8,
      zIndex: 1101,
      mobileHeight: 64,
      desktopHeight: 72,
    },
    transition: {
      easing: 'linear',
      duration: 120,
    },
    dashboard: {
      content: {
        pt: 1,
        pb: 8,
        px: 5,
      },
    },
  },
};
