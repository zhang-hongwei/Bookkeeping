/**
 * Gradient Border Store Types
 */

import type { ColorStop, GradientBorderConfig, GradientType } from '@/app/(tools)/gradient-border/types';
import type { ColorStop as SharedColorStop } from '@/components/shared/color-stop';

// ================== Store State ==================

export interface GradientBorderState {
  config: GradientBorderConfig;
  selectedStopId: string | null;
  innerBgSelectedStopId: string | null;
  exportDialogOpen: boolean;
  showBorderImageOptions: boolean;
  copied: boolean;
  objectUrl: string;
}

// ================== Store Actions ==================

export interface GradientBorderActions {
  // Config updates
  updateConfig: (partial: Partial<GradientBorderConfig>) => void;
  updateBorderImageOption: (field: string, value: string | boolean) => void;
  updateColorStop: (id: string, field: keyof ColorStop, value: string | number) => void;
  addColorStop: (position?: number) => void;
  removeColorStop: (id: string) => void;
  moveColorStop: (id: string, position: number) => void;
  duplicateColorStop: (id: string) => void;
  selectColorStop: (id: string | null) => void;
  updateColorStopPartial: (id: string, updates: Partial<SharedColorStop>) => void;

  // Inner background stops
  addInnerBgStop: (position?: number) => void;
  removeInnerBgStop: (id: string) => void;
  moveInnerBgStop: (id: string, position: number) => void;
  duplicateInnerBgStop: (id: string) => void;
  selectInnerBgStop: (id: string | null) => void;
  updateInnerBgStopPartial: (id: string, updates: Partial<SharedColorStop>) => void;

  // Preset & copy
  applyPreset: (name: string) => void;
  copyCSS: () => Promise<void>;

  // Toggle handlers
  setGradientType: (type: GradientType) => void;
  setImplementation: (impl: GradientBorderConfig['implementation']) => void;

  // File upload
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setImageUrl: (url: string) => void;

  // UI toggles
  setExportDialogOpen: (open: boolean) => void;
  toggleBorderImageOptions: () => void;

  // Reset
  reset: () => void;
}

export type GradientBorderStore = GradientBorderState & GradientBorderActions;
