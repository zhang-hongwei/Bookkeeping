/**
 * Color Extractor Store
 * Zustand store for managing color extractor state
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  ColorExtractorStore,
  CustomColor,
  PickedLocation,
  HarmonyType,
  HarmonyColor,
  ColorBlindnessType,
  PreviewMode,
  ExtractorTab,
  SavedPalette,
  DesignTokenTheme,
} from '../types';
import { generateHarmony } from '../utils/colorHarmony';
import {
  loadPalettes,
  savePalette as savePaletteToStorage,
  deletePalette as deletePaletteFromStorage,
  toggleFavorite as toggleFavoriteInStorage,
} from '../utils/paletteStorage';

// ==================== Initial State ====================

const initialState = {
  // Image & Theme
  image: null as string | null,
  imageName: '',
  theme: null as DesignTokenTheme | null,
  loading: false,
  error: null as string | null,

  // Custom Palette
  customColors: [] as CustomColor[],
  pickedLocations: [] as PickedLocation[],

  // Eyedropper
  eyedropperActive: false,
  magnifierPosition: null as { x: number; y: number } | null,
  magnifierColor: null as string | null,

  // Harmony
  selectedHarmonyType: 'complementary' as HarmonyType,
  harmonyBaseColor: null as string | null,
  harmonyColors: [] as HarmonyColor[],

  // Contrast
  contrastBaseColor: null as string | null,
  showContrastBadges: false,

  // Color Blindness
  blindnessType: null as ColorBlindnessType | null,

  // UI Preview
  previewMode: 'light' as PreviewMode,

  // History
  savedPalettes: [] as SavedPalette[],
  historyLoaded: false,

  // Tab
  activeTab: 'raw' as ExtractorTab,
};

// ==================== Store ====================

export const useColorExtractorStore = create<ColorExtractorStore>((set, get) => ({
  ...initialState,

  // ==================== Image & Theme ====================

  setImage: (image, imageName) => {
    set({ image, imageName, theme: null, error: null });
  },

  setTheme: (theme) => {
    set({ theme });
    // Generate harmony colors based on primary color
    if (theme?.semantic.primary) {
      const harmonyColors = generateHarmony(theme.semantic.primary, get().selectedHarmonyType);
      set({ harmonyBaseColor: theme.semantic.primary, harmonyColors });
    }
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),

  // ==================== Custom Palette ====================

  addCustomColor: (color) => {
    const newColor: CustomColor = {
      ...color,
      id: nanoid(),
    };
    set((state) => ({
      customColors: [...state.customColors, newColor],
    }));
  },

  removeCustomColor: (id) => {
    set((state) => ({
      customColors: state.customColors.filter((c) => c.id !== id),
    }));
  },

  updateCustomColor: (id, updates) => {
    set((state) => ({
      customColors: state.customColors.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  clearCustomColors: () => set({ customColors: [] }),

  // ==================== Picked Locations ====================

  addPickedLocation: (location) => {
    const newLocation: PickedLocation = {
      ...location,
      id: nanoid(),
    };
    set((state) => ({
      pickedLocations: [...state.pickedLocations, newLocation],
    }));
  },

  removePickedLocation: (id) => {
    set((state) => ({
      pickedLocations: state.pickedLocations.filter((l) => l.id !== id),
    }));
  },

  clearPickedLocations: () => set({ pickedLocations: [] }),

  // ==================== Eyedropper ====================

  setEyedropperActive: (active) => set({ eyedropperActive: active }),

  setMagnifierPosition: (position) => set({ magnifierPosition: position }),

  setMagnifierColor: (color) => set({ magnifierColor: color }),

  // ==================== Harmony ====================

  setHarmonyType: (type) => {
    set({ selectedHarmonyType: type });
    const { harmonyBaseColor } = get();
    if (harmonyBaseColor) {
      const harmonyColors = generateHarmony(harmonyBaseColor, type);
      set({ harmonyColors });
    }
  },

  setHarmonyBaseColor: (color) => {
    set({ harmonyBaseColor: color });
    if (color) {
      const harmonyColors = generateHarmony(color, get().selectedHarmonyType);
      set({ harmonyColors });
    } else {
      set({ harmonyColors: [] });
    }
  },

  setHarmonyColors: (colors) => set({ harmonyColors: colors }),

  addHarmonyColorToPalette: (color) => {
    const { selectedHarmonyType } = get();
    get().addCustomColor({
      hex: color.hex,
      name: `${selectedHarmonyType} - ${color.relationship}`,
      source: 'harmony',
      harmonyType: selectedHarmonyType,
    });
  },

  // ==================== Contrast ====================

  setContrastBaseColor: (color) => set({ contrastBaseColor: color }),

  setShowContrastBadges: (show) => set({ showContrastBadges: show }),

  // ==================== Color Blindness ====================

  setBlindnessType: (type) => set({ blindnessType: type }),

  // ==================== UI Preview ====================

  setPreviewMode: (mode) => set({ previewMode: mode }),

  // ==================== History ====================

  loadPalettes: () => {
    const palettes = loadPalettes();
    set({ savedPalettes: palettes, historyLoaded: true });
  },

  saveCurrentPalette: (name, tags) => {
    const { theme, customColors, pickedLocations } = get();
    if (!theme) return;

    const palette: SavedPalette = {
      id: nanoid(),
      name,
      theme,
      customColors,
      pickedLocations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags || [],
      favorite: false,
    };

    savePaletteToStorage(palette);
    set((state) => ({
      savedPalettes: [palette, ...state.savedPalettes],
    }));
  },

  deletePalette: (id) => {
    deletePaletteFromStorage(id);
    set((state) => ({
      savedPalettes: state.savedPalettes.filter((p) => p.id !== id),
    }));
  },

  toggleFavorite: (id) => {
    toggleFavoriteInStorage(id);
    set((state) => ({
      savedPalettes: state.savedPalettes.map((p) =>
        p.id === id ? { ...p, favorite: !p.favorite } : p
      ),
    }));
  },

  loadPalette: (palette) => {
    set({
      theme: palette.theme,
      customColors: palette.customColors,
      pickedLocations: palette.pickedLocations,
    });
  },

  // ==================== Tab ====================

  setActiveTab: (tab) => set({ activeTab: tab }),
}));
