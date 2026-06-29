/**
 * Material-UI Theme Creator
 *
 * A comprehensive theme editor for Material-UI v4
 * Provides visual customization, code editing, and live preview
 */

// Main component
export { MuiThemeCreator } from "./components/MuiThemeCreator";
export type { MuiThemeCreatorProps } from "./components/MuiThemeCreator";

// Store hooks (re-export from centralized store)
export {
  useThemeCreatorStore,
  useThemeCreatorSelector,
  useThemeCreatorActions,
  // Convenience hooks
  useEditorState,
  useThemeOptions,
  useThemeObject,
  useCurrentThemeId,
  useSavedThemes,
  useCurrentTheme,
  useLoadedFonts,
  useActiveTab,
  usePreviewSize,
  useTutorialState,
  useUIState,
  useCanSave,
  // Selector hooks
  useThemeValue,
  useThemeValueInfo,
} from "@/store/mui-theme-creator";

// Types
export type {
  ThemeCreatorStore,
  ThemeCreatorState,
  ThemeCreatorActions,
  EditorState,
  EditorStateOptions,
  SavedTheme,
  NewSavedTheme,
  PreviewSize,
} from "@/store/mui-theme-creator/types";

// Utils
export { setByPath, getByPath, removeByPath, generateThemeId } from "./utils";

/**
 * Parse editor output to extract theme options
 */
export const parseEditorOutput = (code: string): any => {
  try {
    // Simple evaluation - in production this should use proper parsing
    const func = new Function(code + '; return themeOptions;');
    return func();
  } catch (error) {
    throw new Error('Failed to parse editor output');
  }
};

// Theme defaults
export { defaultTheme, defaultThemeOptions } from "./siteTheme";
