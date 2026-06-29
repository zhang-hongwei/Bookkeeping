/**
 * Gradient Text Store Types
 */

import type { ColorStop, GradientTextConfig, GradientType } from '@/app/(tools)/gradient-text/types';
import type { ColorStop as SharedColorStop } from '@/components/shared/color-stop';

// ================== Store State ==================

export interface GradientTextState {
  config: GradientTextConfig;
  selectedStopId: string | null;
  exportDialogOpen: boolean;
  copied: boolean;
}

// ================== Store Actions ==================

export interface GradientTextActions {
  // Config updates
  updateConfig: (partial: Partial<GradientTextConfig>) => void;
  updateColorStop: (id: string, field: keyof ColorStop, value: string | number) => void;
  addColorStop: (position?: number) => void;
  removeColorStop: (id: string) => void;
  moveColorStop: (id: string, position: number) => void;
  duplicateColorStop: (id: string) => void;
  selectColorStop: (id: string | null) => void;
  updateColorStopPartial: (id: string, updates: Partial<SharedColorStop>) => void;

  // Preset & copy
  applyPreset: (name: string) => void;
  copyCSS: () => Promise<void>;

  // Gradient type
  setGradientType: (type: GradientType) => void;

  // UI toggles
  setExportDialogOpen: (open: boolean) => void;

  // Reset
  reset: () => void;
}

export type GradientTextStore = GradientTextState & GradientTextActions;
