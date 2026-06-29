import type {
  GradientType,
  ColorSpace,
  HueInterpolation,
  RadialShape,
  RadialSize,
  GradientStop,
  GradientLayer,
  GradientPreset,
  NamedDirection,
  NamedPosition,
} from '@/app/(tools)/hdr-gradient/types';
import type { ParsedGradient } from '@/lib/gradient/parseGradient';

// ─── State ────────────────────────────────────────────────────────────────────

export interface HdrGradientState {
  layers: GradientLayer[];
  activeLayerIndex: number;
  colorPickerOpen: boolean;
  colorPickerStopIndex: number | null;
  importDialogOpen: boolean;
  exportDialogOpen: boolean;
  previewHd: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export interface HdrGradientActions {
  // Gradient config
  setGradientType(type: GradientType): void;
  setGradientSpace(space: ColorSpace): void;
  setInterpolation(method: HueInterpolation): void;

  // Linear controls (bidirectional sync)
  setLinearAngle(angle: string | number | null): void;
  setLinearNamedAngle(name: NamedDirection): void;

  // Radial controls (bidirectional sync)
  setRadialShape(shape: RadialShape): void;
  setRadialSize(size: RadialSize): void;
  setRadialPosition(x: number | null, y: number | null): void;
  setRadialNamedPosition(name: NamedPosition): void;

  // Conic controls (bidirectional sync)
  setConicAngle(angle: string | number): void;
  setConicPosition(x: number | null, y: number | null): void;
  setConicNamedPosition(name: NamedPosition): void;

  // Stops
  setStops(stops: GradientStop[]): void;
  updateStop(index: number, updates: Partial<GradientStop>): void;
  addStop(): void;
  removeStop(index: number): void;
  duplicateStop(index: number): void;
  moveStop(fromIndex: number, toIndex: number): void;

  // Layers
  addLayer(options?: { seed?: 'duplicate' | 'new'; position?: 'top' | 'bottom' }): void;
  selectLayer(index: number): void;
  deleteLayer(index: number): void;
  moveLayer(from: number, to: number): void;
  toggleLayerVisibility(index: number): void;
  renameLayer(index: number, name: string): void;

  // Presets & Import
  applyPreset(preset: GradientPreset): void;
  applyParsedGradient(parsed: ParsedGradient): void;
  restoreFromHash(hash: string): void;
  reset(): void;

  // UI state
  setColorPickerOpen(open: boolean, stopIndex?: number): void;
  setImportDialogOpen(open: boolean): void;
  setExportDialogOpen(open: boolean): void;
  setPreviewHd(hd: boolean): void;
}

export type HdrGradientStore = HdrGradientState & HdrGradientActions;
