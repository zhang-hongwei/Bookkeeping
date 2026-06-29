/**
 * Color Extractor Types
 * Type definitions for the enhanced image color extractor tool
 */

import type { DesignTokenTheme } from '@/types/ai';

// ==================== Color Sources ====================

export type ColorSource = 'extracted' | 'picked' | 'harmony' | 'manual';

export interface CustomColor {
  id: string;
  hex: string;
  name: string;
  source: ColorSource;
  location?: PickedLocation;
  harmonyType?: HarmonyType;
}

export interface PickedLocation {
  id: string;
  x: number;
  y: number;
  hex: string;
}

// ==================== Color Harmony ====================

export type HarmonyType =
  | 'complementary'
  | 'triadic'
  | 'analogous'
  | 'split-complementary'
  | 'tetradic'
  | 'square';

export interface HarmonyColor {
  hex: string;
  type: HarmonyType;
  relationship: string;
  angle: number;
}

export interface HarmonyOption {
  type: HarmonyType;
  label: string;
  description: string;
  icon: string;
}

// ==================== Color Blindness ====================

export type ColorBlindnessType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface BlindnessTypeInfo {
  type: ColorBlindnessType;
  label: string;
  description: string;
  prevalence: string;
}

// ==================== Contrast ====================

export type WCAGLevel = 'AAA' | 'AA' | 'AA Large' | 'AAA Large' | 'Fail';

export interface ContrastInfo {
  ratio: number;
  level: WCAGLevel;
  passing: boolean;
  foreground: string;
  background: string;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}

// ==================== Palette Storage ====================

export interface SavedPalette {
  id: string;
  name: string;
  theme: DesignTokenTheme;
  customColors: CustomColor[];
  pickedLocations: PickedLocation[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  favorite?: boolean;
}

export interface PaletteSettings {
  defaultHarmonyType: HarmonyType;
  defaultBlindnessType: ColorBlindnessType | null;
  autoSave: boolean;
}

export interface PaletteStorageData {
  version: number;
  palettes: SavedPalette[];
  settings: PaletteSettings;
}

// ==================== UI Preview ====================

export type PreviewMode = 'light' | 'dark';

export interface UIPreviewTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

// ==================== Tab State ====================

export type ExtractorTab = 'raw' | 'semantic' | 'scales' | 'custom' | 'harmony';

// ==================== Store State ====================

export interface ColorExtractorState {
  // Image & Theme
  image: string | null;
  imageName: string;
  theme: DesignTokenTheme | null;
  loading: boolean;
  error: string | null;

  // Custom Palette
  customColors: CustomColor[];
  pickedLocations: PickedLocation[];

  // Eyedropper
  eyedropperActive: boolean;
  magnifierPosition: { x: number; y: number } | null;
  magnifierColor: string | null;

  // Harmony
  selectedHarmonyType: HarmonyType;
  harmonyBaseColor: string | null;
  harmonyColors: HarmonyColor[];

  // Contrast
  contrastBaseColor: string | null;
  showContrastBadges: boolean;

  // Color Blindness
  blindnessType: ColorBlindnessType | null;

  // UI Preview
  previewMode: PreviewMode;

  // History
  savedPalettes: SavedPalette[];
  historyLoaded: boolean;

  // Tab
  activeTab: ExtractorTab;
}

// ==================== Actions ====================

export interface ColorExtractorActions {
  // Image & Theme
  setImage: (image: string | null, name: string) => void;
  setTheme: (theme: DesignTokenTheme | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Custom Palette
  addCustomColor: (color: Omit<CustomColor, 'id'>) => void;
  removeCustomColor: (id: string) => void;
  updateCustomColor: (id: string, updates: Partial<CustomColor>) => void;
  clearCustomColors: () => void;

  // Picked Locations
  addPickedLocation: (location: Omit<PickedLocation, 'id'>) => void;
  removePickedLocation: (id: string) => void;
  clearPickedLocations: () => void;

  // Eyedropper
  setEyedropperActive: (active: boolean) => void;
  setMagnifierPosition: (position: { x: number; y: number } | null) => void;
  setMagnifierColor: (color: string | null) => void;

  // Harmony
  setHarmonyType: (type: HarmonyType) => void;
  setHarmonyBaseColor: (color: string | null) => void;
  setHarmonyColors: (colors: HarmonyColor[]) => void;
  addHarmonyColorToPalette: (color: HarmonyColor) => void;

  // Contrast
  setContrastBaseColor: (color: string | null) => void;
  setShowContrastBadges: (show: boolean) => void;

  // Color Blindness
  setBlindnessType: (type: ColorBlindnessType | null) => void;

  // UI Preview
  setPreviewMode: (mode: PreviewMode) => void;

  // History
  loadPalettes: () => void;
  saveCurrentPalette: (name: string, tags?: string[]) => void;
  deletePalette: (id: string) => void;
  toggleFavorite: (id: string) => void;
  loadPalette: (palette: SavedPalette) => void;

  // Tab
  setActiveTab: (tab: ExtractorTab) => void;
}

export type ColorExtractorStore = ColorExtractorState & ColorExtractorActions;
