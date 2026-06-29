/**
 * Glass Effect Store Types
 */

import type { GlassConfig, GlassEffectType, PreviewTemplate } from '@/app/(tools)/glassmorphism/types';

// ─── State ─────────────────────────────────────────────────────────────

export interface GlassState {
  config: GlassConfig;
  exportDialogOpen: boolean;
  copied: boolean;
  /** Tracks blob URL for cleanup on file upload */
  objectUrl: string;
}

// ─── Actions ───────────────────────────────────────────────────────────

export interface GlassActions {
  updateConfig: (partial: Partial<GlassConfig>) => void;
  setEffectType: (type: GlassEffectType) => void;
  setPreviewTemplate: (template: PreviewTemplate) => void;
  applyPreset: (name: string) => void;
  setBackgroundPreset: (value: string) => void;
  setBackgroundImage: (url: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearBackgroundImage: () => void;
  setExportDialogOpen: (open: boolean) => void;
  copyCSS: () => Promise<void>;
  reset: () => void;
}

export type GlassStore = GlassState & GlassActions;
