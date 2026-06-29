import { Theme, ThemeOptions } from "@mui/material/styles";
import * as monaco from "monaco-editor";

// ================== Editor State Types ==================

export interface EditorState {
  themeInput: string;
  initialVersion: number;
  lastVersion: number;
  currentVersion: number;
  savedVersion: number;
  canUndo: boolean;
  canRedo: boolean;
  errors: monaco.languages.typescript.Diagnostic[];
  // User modified settings
  formatOnSave: boolean;
  outputTypescript: boolean;
}

export type EditorStateOptions = Partial<EditorState>;

// ================== Theme Types ==================

export type PreviewSize = "xs" | "sm" | "md" | "lg" | "xl" | false;

export interface SavedTheme {
  id: string;
  name: string;
  themeOptions: ThemeOptions;
  fonts: string[];
  lastUpdated: string;
}

export type NewSavedTheme = Omit<SavedTheme, "id">;

// ================== Main Store State ==================

export interface ThemeCreatorState {
  // Editor State
  editor: EditorState;

  // Theme State
  themeId: string;
  themeObject: Theme;
  themeOptions: ThemeOptions;
  savedThemes: Record<string, SavedTheme>;

  // Component Theme Config (for component-specific overrides)
  componentThemeConfig: Record<string, any>;

  // Font State
  loadedFonts: Set<string>;

  // UI State
  activeTab: string;
  selectedComponentId: string | null;
  previewSize: PreviewSize;
  tutorialStep: number;
  tutorialOpen: boolean;
  componentNavOpen: boolean;
  themeConfigOpen: boolean;
  mobileWarningSeen: boolean;
}

// ================== Store Actions ==================

export interface ThemeCreatorActions {
  // ============ Editor Actions ============
  saveEditorToTheme: (code: string) => void;
  updateEditorState: (editorState: EditorStateOptions) => void;
  updateVersionStates: (nextVersionId: number) => void;

  // ============ Theme Management ============
  setThemeOption: (path: string, value: any) => Promise<void>;
  setThemeOptions: (configs: Array<{ path: string; value: any }>) => Promise<void>;
  removeThemeOption: (path: string) => Promise<void>;
  removeThemeOptions: (configs: Array<{ path: string; value: any }>) => Promise<void>;
  updateTheme: (themeOptions: ThemeOptions) => void;

  // ============ Component Theme Config ============
  setComponentThemeConfig: (componentName: string, config: any) => void;
  clearComponentThemeConfig: (componentName: string) => void;

  // ============ Saved Themes ============
  addNewSavedTheme: (name: string) => void;
  addNewDefaultTheme: (savedTheme: NewSavedTheme) => void;
  loadSavedTheme: (themeId: string) => void;
  removeSavedTheme: (themeId: string) => boolean;
  renameSavedTheme: (themeId: string, name: string) => void;

  // ============ Font Management ============
  loadFonts: (fonts: string[]) => Promise<boolean>;
  addFonts: (fonts: string[]) => Promise<boolean>;

  // ============ UI State ============
  setActiveTab: (tab: string) => void;
  setSelectedComponentId: (componentId: string | null) => void;
  setPreviewSize: (previewSize: PreviewSize) => void;
  incrementTutorialStep: () => void;
  decrementTutorialStep: () => void;
  resetTutorialStep: () => void;
  toggleTutorial: () => void;
  toggleComponentNav: () => void;
  toggleThemeConfig: () => void;
  setMobileWarningSeen: () => void;

  // ============ Utility ============
  reset: () => void;
  resetSiteData: () => void;

  // ============ Selectors ============
  canSave: () => boolean;
}

// Complete Store Type
export type ThemeCreatorStore = ThemeCreatorState & ThemeCreatorActions;
