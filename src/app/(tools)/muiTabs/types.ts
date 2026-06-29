/**
 * MUI Tabs Theme Designer Types
 * Configurable design tokens for MuiTabs theme customization
 */

/** Root container tokens */
export interface RootTokens {
  minHeight: number;
  backgroundColor: string;
}

/** Tab individual button tokens */
export interface TabTokens {
  minHeight: number;
  paddingX: number;
  fontSize: number;
  fontWeight: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color: string;
  hoverColor: string;
  selectedColor: string;
  selectedBackgroundColor: string;
  borderRadius: string;
}

/** Indicator (active underline) tokens */
export interface IndicatorTokens {
  height: number;
  backgroundColor: string;
  borderRadius: string;
  transitionDuration: string;
}

/** FlexContainer tokens */
export interface FlexContainerTokens {
  gap: number;
}

/** Scrollable tabs tokens */
export interface ScrollButtonsTokens {
  color: string;
}

/** Complete Tabs theme configuration */
export interface TabsThemeConfig {
  root: RootTokens;
  tab: TabTokens;
  indicator: IndicatorTokens;
  flexContainer: FlexContainerTokens;
  scrollButtons: ScrollButtonsTokens;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  exportVariant?: 'standard' | 'scrollable' | 'fullWidth';
}

export interface TabsThemePreset {
  name: string;
  description: string;
  config: TabsThemeConfig;
}

export type TabsThemeExportFormat = "createTheme" | "theme-components" | "css" | "json";

/** MUI defaults */
export const MUI_DEFAULTS: TabsThemeConfig = {
  root: {
    minHeight: 48,
    backgroundColor: 'transparent',
  },
  tab: {
    minHeight: 48,
    paddingX: 12,
    fontSize: 14,
    fontWeight: 500,
    textTransform: 'none',
    color: 'rgba(0, 0, 0, 0.6)',
    hoverColor: 'rgba(0, 0, 0, 0.87)',
    selectedColor: '#643DFF',
    selectedBackgroundColor: 'transparent',
    borderRadius: '4px',
  },
  indicator: {
    height: 2,
    backgroundColor: '#643DFF',
    borderRadius: '2px',
    transitionDuration: '250ms',
  },
  flexContainer: {
    gap: 0,
  },
  scrollButtons: {
    color: 'rgba(0, 0, 0, 0.6)',
  },
  orientation: 'horizontal',
  variant: 'standard',
};
