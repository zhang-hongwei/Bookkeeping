/**
 * Clip Path Editor Store Types
 */

export interface Point {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

export type ClipPathMode = 'polygon' | 'circle' | 'ellipse' | 'inset';
export type ImageFit = 'stretch' | 'cover';

export interface CircleConfig {
  radius: number;
  centerX: number;
  centerY: number;
}

export interface EllipseConfig {
  radiusX: number;
  radiusY: number;
  centerX: number;
  centerY: number;
}

export interface InsetConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
  borderRadius: number;
}

// ================== Store State ==================

export interface ClipPathEditorState {
  mode: ClipPathMode;
  polygonPoints: Point[];
  circle: CircleConfig;
  ellipse: EllipseConfig;
  inset: InsetConfig;

  canvasSize: { width: number; height: number };
  scale: number;
  imageFit: ImageFit;
  imageUrl: string | null;
  backgroundColor: string;

  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showOutside: boolean;

  selectedPointIndex: number | null;
  exportDialogOpen: boolean;
}

// ================== Store Actions ==================

export interface ClipPathEditorActions {
  setMode: (mode: ClipPathMode) => void;
  movePolygonPoint: (index: number, x: number, y: number) => void;
  addPolygonPoint: (afterIndex: number, point: Point) => void;
  removePolygonPoint: (index: number) => void;

  updateCircle: (updates: Partial<CircleConfig>) => void;
  updateEllipse: (updates: Partial<EllipseConfig>) => void;
  updateInset: (updates: Partial<InsetConfig>) => void;

  applyPreset: (mode: ClipPathMode, config: Record<string, unknown>) => void;

  setScale: (scale: number) => void;
  setCanvasSize: (updates: Partial<{ width: number; height: number }>) => void;
  setImageFit: (fit: ImageFit) => void;
  setImageUrl: (url: string | null) => void;
  setBackgroundColor: (color: string) => void;

  toggleGrid: () => void;
  toggleSnap: () => void;
  setGridSize: (size: number) => void;
  toggleOutside: () => void;

  setSelectedPointIndex: (index: number | null) => void;
  setExportDialogOpen: (open: boolean) => void;

  uploadImage: (file: File) => void;
  centerShape: () => void;
  reset: () => void;
}

export type ClipPathEditorStore = ClipPathEditorState & ClipPathEditorActions;
