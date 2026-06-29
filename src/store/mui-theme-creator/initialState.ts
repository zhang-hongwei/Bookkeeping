import { createTheme } from "@mui/material/styles";
import { ThemeCreatorState, EditorState } from "./types";
import { defaultThemeOptions } from "@/features/mui-theme-creator/siteTheme";
import { generateThemeId } from "@/features/mui-theme-creator/utils";
import JSON5 from "json5";
import { ThemeOptions } from "@mui/material/styles";

// ============ Helper Function ============

const stringify = (themeOptions: ThemeOptions) => {
  return `import { ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = ${JSON5.stringify(
    themeOptions,
    null,
    2
  )};`;
};

// ============ Editor Initial State ============

export const editorInitialState: EditorState = {
  themeInput: stringify(defaultThemeOptions),
  initialVersion: 0,
  currentVersion: 0,
  lastVersion: 0,
  savedVersion: 0,
  canRedo: false,
  canUndo: false,
  errors: [],
  formatOnSave: true,
  outputTypescript: true,
};

// ============ Theme Creator Initial State ============

const defaultThemeId = generateThemeId({});

export const themeCreatorInitialState: ThemeCreatorState = {
  // Editor State
  editor: editorInitialState,

  // Theme State
  themeId: defaultThemeId,
  themeOptions: defaultThemeOptions,
  themeObject: createTheme(defaultThemeOptions),
  savedThemes: {
    [defaultThemeId]: {
      id: defaultThemeId,
      name: "My Theme",
      themeOptions: defaultThemeOptions,
      fonts: ["Roboto"],
      lastUpdated: new Date().toISOString(),
    },
  },

  // Component Theme Config
  componentThemeConfig: {},

  // Font State
  loadedFonts: new Set(),

  // UI State
  activeTab: "preview",
  selectedComponentId: null,
  previewSize: false,
  tutorialStep: 0,
  tutorialOpen: false,
  componentNavOpen: false,
  themeConfigOpen: false,
  mobileWarningSeen: false,
};

// Initial fonts to load
export const initialFonts = ["Droid Sans", "Droid Serif", "Open Sans", "Roboto"];
