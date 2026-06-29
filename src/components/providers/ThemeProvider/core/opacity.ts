/**
 * Opacity configuration for Material UI theme
 */

export interface OpacityConfig {
  // Input states
  inputPlaceholder: number;
  inputUnderline: number;

  // Switch states
  switchTrackDisabled: number;
  switchTrack: number;

  // Button variants
  filled: {
    commonHoverBg: number;
  };
  outlined: {
    border: number;
  };
  soft: {
    bg: number;
    hoverBg: number;
    commonBg: number;
    commonHoverBg: number;
    border: number;
  };
}

export const opacity: OpacityConfig = {
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
};
