/**
 * OutlinedInput Theme Designer - Token Store
 * Zustand store + CSS Variable engine for zero re-render updates
 */

import { create } from "zustand";
import type { OutlinedInputThemeConfig } from "./types";
import { OUTLINED_INPUT_DEFAULTS } from "./types";

const CSS_VAR_PREFIX = "--oi";

function configToCSSVars(config: OutlinedInputThemeConfig): Record<string, string> {
  return {
    [`${CSS_VAR_PREFIX}-border-color`]: config.border.borderColor,
    [`${CSS_VAR_PREFIX}-border-width`]: `${config.border.borderWidth}px`,
    [`${CSS_VAR_PREFIX}-border-radius`]: config.border.borderRadius,
    [`${CSS_VAR_PREFIX}-border-hover-color`]: config.border.hoverBorderColor,
    [`${CSS_VAR_PREFIX}-border-focus-color`]: config.border.focusBorderColor,
    [`${CSS_VAR_PREFIX}-border-error-color`]: config.border.errorBorderColor,
    [`${CSS_VAR_PREFIX}-border-disabled-color`]: config.border.disabledBorderColor,

    [`${CSS_VAR_PREFIX}-input-color`]: config.input.color,
    [`${CSS_VAR_PREFIX}-input-font-size`]: `${config.input.fontSize}px`,
    [`${CSS_VAR_PREFIX}-input-font-weight`]: String(config.input.fontWeight),
    [`${CSS_VAR_PREFIX}-input-placeholder-color`]: config.input.placeholderColor,
    [`${CSS_VAR_PREFIX}-input-disabled-color`]: config.input.disabledColor,
    [`${CSS_VAR_PREFIX}-input-bg`]: config.input.backgroundColor,
    [`${CSS_VAR_PREFIX}-input-padding`]: `${config.input.padding}px`,
    [`${CSS_VAR_PREFIX}-input-height`]: `${config.input.height - config.input.padding * 2}px`,

    [`${CSS_VAR_PREFIX}-adornment-color`]: config.adornment.color,
    [`${CSS_VAR_PREFIX}-adornment-hover-color`]: config.adornment.hoverColor,
    [`${CSS_VAR_PREFIX}-adornment-font-size`]: `${config.adornment.fontSize}px`,

    [`${CSS_VAR_PREFIX}-legend-font-size`]: `${config.notch.legendFontSize}px`,
    [`${CSS_VAR_PREFIX}-legend-color`]: config.notch.legendColor,
    [`${CSS_VAR_PREFIX}-legend-focus-color`]: config.notch.legendFocusColor,
  };
}

function applyCSSVars(vars: Record<string, string>) {
  const root = document.documentElement;
  const keys = Object.keys(vars);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    root.style.setProperty(key, vars[key]);
  }
}

function removeAllCSSVars() {
  const root = document.documentElement;
  const prefix = CSS_VAR_PREFIX;
  const styles = root.style;
  for (let i = styles.length - 1; i >= 0; i--) {
    const prop = styles[i];
    if (prop?.startsWith(prefix)) {
      styles.removeProperty(prop);
    }
  }
}

interface OutlinedInputStore {
  config: OutlinedInputThemeConfig;
  exportDialogOpen: boolean;

  updateConfig: (config: OutlinedInputThemeConfig) => void;
  updateSection: <K extends keyof OutlinedInputThemeConfig>(
    section: K,
    updates: Partial<OutlinedInputThemeConfig[K]>,
  ) => void;
  reset: () => void;
  setExportDialogOpen: (open: boolean) => void;
}

// rAF batching: CSS vars update instantly, React state batches to next frame
let _pendingConfig: OutlinedInputThemeConfig | null = null;
let _rafId: number | null = null;

function batchedSet(config: OutlinedInputThemeConfig, set: (p: { config: OutlinedInputThemeConfig }) => void) {
  _pendingConfig = config;
  if (_rafId !== null) cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(() => {
    if (_pendingConfig) {
      set({ config: _pendingConfig });
      _pendingConfig = null;
    }
    _rafId = null;
  });
}

export const useOutlinedInputStore = create<OutlinedInputStore>((set, get) => ({
  config: {
    border: { ...OUTLINED_INPUT_DEFAULTS.border },
    input: { ...OUTLINED_INPUT_DEFAULTS.input },
    adornment: { ...OUTLINED_INPUT_DEFAULTS.adornment },
    notch: { ...OUTLINED_INPUT_DEFAULTS.notch },
  },
  exportDialogOpen: false,

  updateConfig: (config) => {
    set({ config });
    applyCSSVars(configToCSSVars(config));
  },

  updateSection: (section, updates) => {
    const prev = _pendingConfig ?? get().config;
    const next = {
      ...prev,
      [section]: { ...prev[section], ...updates },
    };
    // CSS vars: immediate for live preview
    applyCSSVars(configToCSSVars(next));
    // React state: batched to next frame
    batchedSet(next, set);
  },

  reset: () => {
    const config: OutlinedInputThemeConfig = {
      border: { ...OUTLINED_INPUT_DEFAULTS.border },
      input: { ...OUTLINED_INPUT_DEFAULTS.input },
      adornment: { ...OUTLINED_INPUT_DEFAULTS.adornment },
      notch: { ...OUTLINED_INPUT_DEFAULTS.notch },
    };
    _pendingConfig = null;
    if (_rafId !== null) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }
    set({ config });
    applyCSSVars(configToCSSVars(config));
  },

  setExportDialogOpen: (open) => set({ exportDialogOpen: open }),
}));

/** Apply CSS variables on mount, clean up on unmount. Call in page component. */
export function useCSSVariableLifecycle() {
  const config = useOutlinedInputStore((s) => s.config);

  // Store ref to avoid re-subscribing
  const configRef = config;

  if (typeof window !== "undefined") {
    // Apply initial values immediately
    applyCSSVars(configToCSSVars(configRef));
  }
}

export { removeAllCSSVars, applyCSSVars, configToCSSVars };
