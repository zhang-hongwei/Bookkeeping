/**
 * MUI Slider Theme Designer Types
 * Configurable design tokens for MuiSlider theme customization
 */

/** Rail style tokens (background track) */
export interface RailTokens {
  height: number;
  backgroundColor: string;
  borderRadius: string;
  opacity: number;
}

/** Track style tokens (filled portion) */
export interface TrackTokens {
  height: number;
  backgroundColor: string;
  borderRadius: string;
  opacity: number;
}

/** Thumb style tokens (draggable handle) */
export interface ThumbTokens {
  width: number;
  height: number;
  color: string;
  hoverColor: string;
  activeColor: string;
  borderRadius: string;
  boxShadow: string;
  borderWidth: number;
  borderColor: string;
}

/** Mark style tokens (step indicators) */
export interface MarkTokens {
  width: number;
  height: number;
  backgroundColor: string;
  borderRadius: string;
  activeColor: string;
  labelFontSize: number;
  labelColor: string;
}

/** ValueLabel style tokens (tooltip showing value) */
export interface ValueLabelTokens {
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor: string;
  borderRadius: string;
  paddingX: number;
  paddingY: number;
  boxShadow: string;
}

/** Root-level style tokens */
export interface RootTokens {
  height: number;
  transitionDuration: string;
}

/** Size variant tokens */
export interface SizeTokens {
  small: {
    thumbWidth: number;
    thumbHeight: number;
    trackHeight: number;
  };
  medium: {
    thumbWidth: number;
    thumbHeight: number;
    trackHeight: number;
  };
}

/** Complete slider theme configuration */
export interface SliderThemeConfig {
  root: RootTokens;
  rail: RailTokens;
  track: TrackTokens;
  thumb: ThumbTokens;
  mark: MarkTokens;
  valueLabel: ValueLabelTokens;
  size: SizeTokens;
  exportVariant?: 'small' | 'medium';
  showMarks?: boolean;
  showValueLabel?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export interface SliderThemePreset {
  name: string;
  description: string;
  config: SliderThemeConfig;
}

export type SliderThemeExportFormat = "createTheme" | "theme-components" | "css" | "json";

/** MUI defaults extracted from Slider source */
export const MUI_DEFAULTS: SliderThemeConfig = {
  root: {
    height: 4,
    transitionDuration: "150ms",
  },
  rail: {
    height: 4,
    backgroundColor: "#919EAB",
    borderRadius: "2px",
    opacity: 1,
  },
  track: {
    height: 4,
    backgroundColor: "#643DFF",
    borderRadius: "2px",
    opacity: 1,
  },
  thumb: {
    width: 16,
    height: 16,
    color: "#643DFF",
    hoverColor: "#7B5FFF",
    activeColor: "#5A35E0",
    borderRadius: "50%",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    borderWidth: 0,
    borderColor: "transparent",
  },
  mark: {
    width: 2,
    height: 2,
    backgroundColor: "#919EAB",
    borderRadius: "50%",
    activeColor: "#643DFF",
    labelFontSize: 12,
    labelColor: "rgba(0,0,0,0.6)",
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "#fff",
    backgroundColor: "#643DFF",
    borderRadius: "4px",
    paddingX: 8,
    paddingY: 4,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  size: {
    small: {
      thumbWidth: 12,
      thumbHeight: 12,
      trackHeight: 3,
    },
    medium: {
      thumbWidth: 16,
      thumbHeight: 16,
      trackHeight: 4,
    },
  },
};
