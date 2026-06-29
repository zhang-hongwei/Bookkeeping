import { StateCreator } from "zustand";
import { createTheme, ThemeOptions } from "@mui/material/styles";
import type { TypographyOptions } from "@mui/material/styles";
import type { BreakpointValues } from "@mui/material/styles";
import deepmerge from "deepmerge";
import JSON5 from "json5";
import {
  ThemeCreatorStore,
  ThemeCreatorActions,
  EditorStateOptions,
  NewSavedTheme,
  PreviewSize,
  SavedTheme,
} from "./types";
import { themeCreatorInitialState, initialFonts } from "./initialState";
import { setByPath, removeByPath, getByPath, generateThemeId, isSetEq, verbose, parseEditorOutput } from "@/features/mui-theme-creator/utils";
import { defaultTheme, defaultThemeOptions } from "@/features/mui-theme-creator/siteTheme";

// ============ Helper Functions ============

const stringify = (themeOptions: ThemeOptions) => {
  return `import { ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = ${JSON5.stringify(
    themeOptions,
    null,
    2
  )};`;
};

/**
 * Parse a `ThemeOptions` object to get a list of google fonts included
 */
const getFontsFromThemeOptions = (
  themeOptions: ThemeOptions,
  previousFonts: string[] | undefined,
  loadedFonts: Set<string>
) => {
  const typography = themeOptions.typography as TypographyOptions | undefined;

  const fontList: string[] = [
    typography?.fontFamily || "Roboto",
    typography?.h1?.fontFamily,
    typography?.h2?.fontFamily,
    typography?.h3?.fontFamily,
    typography?.h4?.fontFamily,
    typography?.h5?.fontFamily,
    typography?.h6?.fontFamily,
    typography?.subtitle1?.fontFamily,
    typography?.subtitle2?.fontFamily,
    typography?.body1?.fontFamily,
    typography?.body2?.fontFamily,
    typography?.button?.fontFamily,
    typography?.caption?.fontFamily,
    typography?.overline?.fontFamily,
  ]
    .flatMap((x) => (x == null ? [] : x?.replace(/"/g, "").split(",")))
    .map((x) => x.trim());

  const fontSet = new Set<string>();
  fontList.forEach((x) => loadedFonts.has(x) && fontSet.add(x));

  if (previousFonts && isSetEq(new Set(previousFonts), fontSet)) {
    return previousFonts;
  }

  return [...fontSet];
};

/**
 * Load fonts using webfontloader
 * IMPORTANT: This function only works in the browser (client-side)
 */
async function loadFontsHelper(fonts: string[]): Promise<boolean> {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    verbose("loadFonts: skipping in SSR environment");
    return false;
  }

  return new Promise<boolean>((resolve) => {
    try {
      // Dynamically import webfontloader with proper error handling
      const WebFont = require("webfontloader");

      if (!WebFont || typeof WebFont.load !== 'function') {
        console.error("webfontloader module is not properly loaded");
        resolve(false);
        return;
      }

      WebFont.load({
        google: {
          families: fonts,
        },
        active: () => {
          verbose("loadFonts: webfonts loaded", fonts);
          resolve(true);
        },
        inactive: () => {
          verbose("loadFonts: webfonts could not load", fonts);
          resolve(false);
        },
        timeout: 5000, // 5 second timeout
      });
    } catch (err) {
      console.error("Failed to load webfontloader:", err);
      resolve(false);
    }
  });
}

/**
 * Create preview theme with spoofed breakpoints
 */
const createPreviewMuiTheme = (
  themeOptions: ThemeOptions,
  previewSize: PreviewSize
) => {
  const spoofedBreakpoints: Record<string, BreakpointValues> = {
    xs: { xs: 0, sm: 10000, md: 10001, lg: 10002, xl: 10003 },
    sm: { xs: 0, sm: 1, md: 10001, lg: 10002, xl: 10003 },
    md: { xs: 0, sm: 1, md: 2, lg: 10002, xl: 10003 },
    lg: { xs: 0, sm: 1, md: 2, lg: 3, xl: 10003 },
    xl: { xs: 0, sm: 1, md: 2, lg: 3, xl: 4 },
  };

  if (!previewSize) return createTheme(themeOptions);

  return createTheme(
    deepmerge(
      { breakpoints: { values: spoofedBreakpoints[previewSize] } },
      themeOptions
    )
  );
};

// ============ Create Actions ============

export const createThemeCreatorActions = (): StateCreator<
  ThemeCreatorStore,
  [],
  [],
  ThemeCreatorActions
> => (set, get) => ({
  // ============ Editor Actions ============

  saveEditorToTheme: (code: string) => {
    let themeOptions: ThemeOptions;

    try {
      themeOptions = parseEditorOutput(code);
    } catch (err: any) {
      set((state) => ({
        editor: {
          ...state.editor,
          errors: [
            {
              category: 1,
              messageText: `Error while JSON5 parsing code: ${err.message}`,
            } as any,
          ],
        },
      }));
      return;
    }

    const state = get();
    set({
      themeOptions,
      themeObject: createPreviewMuiTheme(themeOptions, state.previewSize),
      savedThemes: {
        ...state.savedThemes,
        [state.themeId]: {
          ...state.savedThemes[state.themeId],
          themeOptions,
          fonts: getFontsFromThemeOptions(
            themeOptions,
            state.savedThemes[state.themeId]?.fonts,
            state.loadedFonts
          ),
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  },

  updateEditorState: (editorState: EditorStateOptions) => {
    set((state) => ({
      editor: {
        ...state.editor,
        ...editorState,
      },
    }));
  },

  updateVersionStates: (nextVersionId: number) => {
    const { editor } = get();
    const { initialVersion, lastVersion, currentVersion } = editor;

    let nextState: EditorStateOptions = {};
    if (nextVersionId < currentVersion) {
      nextState = {
        canRedo: true,
        canUndo: nextVersionId !== initialVersion,
      };
    } else {
      nextState = {
        canUndo: true,
        canRedo: nextVersionId < lastVersion,
        lastVersion: Math.max(currentVersion, lastVersion),
      };
    }
    nextState.currentVersion = nextVersionId;
    get().updateEditorState(nextState);
  },

  // ============ Theme Management ============

  updateTheme: (themeOptions: ThemeOptions) => {
    const state = get();
    set({
      themeOptions,
      themeObject: createPreviewMuiTheme(themeOptions, state.previewSize),
      editor: {
        ...state.editor,
        themeInput: stringify(themeOptions),
      },
      savedThemes: {
        ...state.savedThemes,
        [state.themeId]: {
          ...state.savedThemes[state.themeId],
          themeOptions,
          fonts: getFontsFromThemeOptions(
            themeOptions,
            state.savedThemes[state.themeId]?.fonts,
            state.loadedFonts
          ),
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  },

  setThemeOption: async (path: string, value: any) => {
    if (!get().canSave()) {
      const confirmed = confirm(
        "There are unsaved changes in the code editor. Wipe changes and proceed?"
      );
      if (!confirmed) return;
    }

    const updatedThemeOptions = setByPath(get().themeOptions, path, value);
    get().updateTheme(updatedThemeOptions);
  },

  setThemeOptions: async (configs: Array<{ path: string; value: any }>) => {
    if (!get().canSave()) {
      const confirmed = confirm(
        "There are unsaved changes in the code editor. Wipe changes and proceed?"
      );
      if (!confirmed) return;
    }

    let updatedThemeOptions = get().themeOptions;
    configs.forEach(
      ({ path, value }) =>
        (updatedThemeOptions = setByPath(updatedThemeOptions, path, value))
    );
    get().updateTheme(updatedThemeOptions);
  },

  removeThemeOption: async (path: string) => {
    if (!get().canSave()) {
      const confirmed = confirm(
        "There are unsaved changes in the code editor. Wipe changes and proceed?"
      );
      if (!confirmed) return;
    }

    let updatedThemeOptions: ThemeOptions;

    if (path.endsWith("main")) {
      const defaultValueForPath = getByPath(defaultTheme, path);
      updatedThemeOptions = setByPath(
        get().themeOptions,
        path,
        defaultValueForPath
      );
    } else {
      updatedThemeOptions = removeByPath(get().themeOptions, path);
    }

    get().updateTheme(updatedThemeOptions);
  },

  removeThemeOptions: async (configs: Array<{ path: string; value: any }>) => {
    if (!get().canSave()) {
      const confirmed = confirm(
        "There are unsaved changes in the code editor. Wipe changes and proceed?"
      );
      if (!confirmed) return;
    }

    let updatedThemeOptions = get().themeOptions;
    configs.forEach(
      ({ path }) => (updatedThemeOptions = removeByPath(updatedThemeOptions, path))
    );
    get().updateTheme(updatedThemeOptions);
  },

  // ============ Saved Themes ============

  addNewSavedTheme: (name: string) => {
    const state = get();
    const newThemeId = generateThemeId(state.savedThemes);
    const newSavedTheme = {
      name,
      themeOptions: defaultThemeOptions,
      fonts: ["Roboto"],
    };

    set({
      themeId: newThemeId,
      themeOptions: newSavedTheme.themeOptions,
      themeObject: createPreviewMuiTheme(newSavedTheme.themeOptions, state.previewSize),
      editor: {
        ...state.editor,
        themeInput: stringify(newSavedTheme.themeOptions),
      },
      savedThemes: {
        ...state.savedThemes,
        [newThemeId]: {
          id: newThemeId,
          ...newSavedTheme,
          lastUpdated: new Date().toISOString(),
        },
      },
    });

    // Load fonts if needed
    const fontsToLoad = newSavedTheme.fonts.filter(
      (x) => !state.loadedFonts.has(x)
    );
    if (fontsToLoad.length > 0) {
      get().addFonts(fontsToLoad);
    }
  },

  addNewDefaultTheme: (newSavedTheme: NewSavedTheme) => {
    const state = get();
    const newThemeId = generateThemeId(state.savedThemes);

    set({
      themeId: newThemeId,
      themeOptions: newSavedTheme.themeOptions,
      themeObject: createPreviewMuiTheme(newSavedTheme.themeOptions, state.previewSize),
      editor: {
        ...state.editor,
        themeInput: stringify(newSavedTheme.themeOptions),
      },
      savedThemes: {
        ...state.savedThemes,
        [newThemeId]: {
          id: newThemeId,
          ...newSavedTheme,
          lastUpdated: new Date().toISOString(),
        },
      },
    });

    // Load fonts if needed
    const fontsToLoad = newSavedTheme.fonts.filter(
      (x) => !state.loadedFonts.has(x)
    );
    if (fontsToLoad.length > 0) {
      get().addFonts(fontsToLoad);
    }
  },

  loadSavedTheme: (themeId: string) => {
    const state = get();
    const savedTheme = state.savedThemes[themeId];

    if (!savedTheme) return;

    set({
      themeId,
      themeOptions: savedTheme.themeOptions,
      themeObject: createPreviewMuiTheme(savedTheme.themeOptions, state.previewSize),
      editor: {
        ...state.editor,
        themeInput: stringify(savedTheme.themeOptions),
      },
    });

    // Load fonts if needed
    const fontsToLoad = savedTheme.fonts.filter(
      (x) => !state.loadedFonts.has(x)
    );
    if (fontsToLoad.length > 0) {
      get().addFonts(fontsToLoad);
    }
  },

  removeSavedTheme: (themeId: string) => {
    const state = get();
    // Don't remove if it's the current theme
    if (state.themeId === themeId) {
      return false;
    }

    const newSavedThemes = { ...state.savedThemes };
    delete newSavedThemes[themeId];
    set({ savedThemes: newSavedThemes });
    return true;
  },

  renameSavedTheme: (themeId: string, name: string) => {
    const state = get();
    set({
      savedThemes: {
        ...state.savedThemes,
        [themeId]: {
          ...state.savedThemes[themeId],
          name,
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  },

  // ============ Font Management ============

  loadFonts: loadFontsHelper,

  addFonts: async (fonts: string[]) => {
    const state = get();
    const fontsToLoad = fonts.filter((x) => !state.loadedFonts.has(x));

    if (fontsToLoad.length === 0) return true;

    const fontsLoaded = await loadFontsHelper(fontsToLoad);
    if (fontsLoaded) {
      const loadedFonts = new Set(
        [...state.loadedFonts, ...fontsToLoad].sort()
      );
      set({ loadedFonts });
      return true;
    }
    return false;
  },

  // ============ Component Theme Config ============

  setComponentThemeConfig: (componentName: string, config: any) => {
    const state = get();
    const updatedComponentThemeConfig = {
      ...state.componentThemeConfig,
      [componentName]: config,
    };

    // Merge component theme config into themeObject
    const mergedThemeOptions = deepmerge(state.themeOptions, {
      components: {
        [componentName]: config,
      },
    });

    set({
      componentThemeConfig: updatedComponentThemeConfig,
      themeObject: createPreviewMuiTheme(mergedThemeOptions, state.previewSize),
    });
  },

  clearComponentThemeConfig: (componentName: string) => {
    const state = get();
    const updatedComponentThemeConfig = { ...state.componentThemeConfig };
    delete updatedComponentThemeConfig[componentName];

    set({
      componentThemeConfig: updatedComponentThemeConfig,
      themeObject: createPreviewMuiTheme(state.themeOptions, state.previewSize),
    });
  },

  // ============ UI State ============

  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
  },

  setSelectedComponentId: (componentId: string | null) => {
    set({ selectedComponentId: componentId });
  },

  setPreviewSize: (previewSize: PreviewSize) => {
    const state = get();
    set({
      previewSize,
      themeObject: createPreviewMuiTheme(state.themeOptions, previewSize),
    });
  },

  incrementTutorialStep: () => {
    set((state) => ({ tutorialStep: state.tutorialStep + 1 }));
  },

  decrementTutorialStep: () => {
    set((state) => ({ tutorialStep: state.tutorialStep - 1 }));
  },

  resetTutorialStep: () => {
    set({ tutorialStep: 0 });
  },

  toggleTutorial: () => {
    set((state) => ({ tutorialOpen: !state.tutorialOpen }));
  },

  toggleComponentNav: () => {
    set((state) => ({ componentNavOpen: !state.componentNavOpen }));
  },

  toggleThemeConfig: () => {
    set((state) => ({ themeConfigOpen: !state.themeConfigOpen }));
  },

  setMobileWarningSeen: () => {
    set({ mobileWarningSeen: true });
  },

  // ============ Utility ============

  reset: () => {
    set(themeCreatorInitialState);
  },

  resetSiteData: () => {
    set(themeCreatorInitialState);
  },

  // ============ Selectors ============

  canSave: () => {
    const { editor } = get();
    return (
      editor.errors.length === 0 && editor.currentVersion === editor.savedVersion
    );
  },
});
