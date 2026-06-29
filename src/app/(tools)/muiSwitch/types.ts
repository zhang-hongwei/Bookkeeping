/**
 * MUI Switch Theme Designer Types
 * Configurable design tokens for MuiSwitch theme customization
 */

/** Thumb style tokens */
export interface ThumbTokens {
  width: number;
  height: number;
  color: string;
  checkedColor: string;
  borderRadius: string;
  boxShadow: string;
}

/** Track style tokens */
export interface TrackTokens {
  width: number;
  height: number;
  backgroundColor: string;
  borderRadius: string;
  opacity: number;
}

/** Root-level style tokens */
export interface RootTokens {
  // Legacy padding fields (for backward compatibility)
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  transitionDuration: string;
  // New unified controls (aligned with MUI source)
  width?: number;
  height?: number;
  padding?: number;
  switchBasePadding?: number;
  translateX?: number;
}

/** Size variant tokens */
export interface SizeTokens {
  thumbWidth: number;
  thumbHeight: number;
  trackWidth: number;
  trackHeight: number;
}

/** Complete switch theme configuration */
export interface SwitchThemeConfig {
  root: RootTokens;
  thumb: ThumbTokens;
  track: TrackTokens;
  trackChecked: TrackTokens;
  size: SizeTokens;
  exportVariant?: 'medium' | 'small'; // 导出格式：覆盖指定尺寸
}

export interface SwitchThemePreset {
  name: string;
  description: string;
  config: SwitchThemeConfig;
}

export type SwitchThemeExportFormat = "createTheme" | "theme-components" | "css" | "json";

/** MUI defaults extracted from Switch source */
export const MUI_DEFAULTS: SwitchThemeConfig = {
  root: {
    // Legacy padding fields (for backward compatibility)
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    transitionDuration: "200ms",
    // New unified controls (aligned with MUI source)
    width: 50,
    height: 28,
    padding: 7,
    switchBasePadding: 9,
    translateX: 16,
  },
  thumb: {
    width: 16,
    height: 16,
    color: "#fff",
    checkedColor: "#643DFF",
    borderRadius: "50%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  track: {
    width: 42,
    height: 26,
    backgroundColor: "#919EAB",
    borderRadius: "20px",
    opacity: 1,
  },
  trackChecked: {
    width: 42,
    height: 26,
    backgroundColor: "#643DFF",
    borderRadius: "20px",
    opacity: 1,
  },
  size: {
    thumbWidth: 16,
    thumbHeight: 16,
    trackWidth: 36,
    trackHeight: 14,
  },
};
