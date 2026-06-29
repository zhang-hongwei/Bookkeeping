/**
 * Chart Editor Store Types
 */

import type { ChartEditorConfig, ChartEditorSeries } from '@/app/(tools)/chartEditor/types';

// ─── State ───────────────────────────────────────────────────────────────

export interface ChartEditorState {
  config: ChartEditorConfig;
  selectedSeriesId: string | null;
  exportDialogOpen: boolean;
  copied: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────

export interface ChartEditorActions {
  updateConfig: (partial: Partial<ChartEditorConfig>) => void;
  addSeries: () => void;
  removeSeries: (id: string) => void;
  updateSeries: (id: string, updates: Partial<ChartEditorSeries>) => void;
  updateSeriesData: (id: string, dataIndex: number, value: number) => void;
  addDataPoint: (seriesId: string) => void;
  removeDataPoint: (seriesId: string, dataIndex: number) => void;
  selectSeries: (id: string | null) => void;
  applyPreset: (preset: Partial<ChartEditorConfig>) => void;
  reset: () => void;
  setExportDialogOpen: (open: boolean) => void;
  setCopied: (copied: boolean) => void;
}

export type ChartEditorStore = ChartEditorState & ChartEditorActions;
