/**
 * SVG Icon Editor - Type Definitions
 */

// =============================================================================
// SVG Element Model
// =============================================================================

export type SvgTag =
  | 'svg'
  | 'g'
  | 'defs'
  | 'clipPath'
  | 'mask'
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'polyline'
  | 'polygon'
  | 'path'
  | 'text'
  | 'tspan'
  | 'textPath'
  | 'image'
  | 'use'
  | 'symbol'
  | 'linearGradient'
  | 'radialGradient'
  | 'stop'
  | 'filter'
  | 'pattern';

/** Core element data — preserves ALL SVG attributes */
export interface SvgElementData {
  id: string;
  tag: SvgTag;
  attrs: Record<string, string>;
  children: SvgElementData[];
  textContent?: string;
  parentId: string | null;
}

// =============================================================================
// Path Commands
// =============================================================================

export type PathCommandType =
  | 'M' | 'm' | 'L' | 'l' | 'H' | 'h' | 'V' | 'v'
  | 'C' | 'c' | 'S' | 's' | 'Q' | 'q' | 'T' | 't'
  | 'A' | 'a' | 'Z' | 'z';

export interface PathCommand {
  type: PathCommandType;
  args: number[];
}

export interface PathNode {
  id: string;
  x: number;
  y: number;
  cp1x?: number;
  cp1y?: number;
  cp2x?: number;
  cp2y?: number;
  cpx?: number;
  cpy?: number;
  commandType: PathCommandType;
  isRelative: boolean;
}

// =============================================================================
// Geometry
// =============================================================================

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

// =============================================================================
// Tools
// =============================================================================

export type EditorTool =
  | 'select'
  | 'hand'
  | 'zoom'
  | 'pen'
  | 'pencil'
  | 'line'
  | 'rect'
  | 'ellipse'
  | 'polygon'
  | 'text';

export type ShapeVariant = 'rect' | 'ellipse' | 'line' | 'polygon';

// =============================================================================
// Selection & Interaction
// =============================================================================

export type SelectionMode = 'none' | 'single' | 'multi';

export interface SelectionState {
  elementIds: string[];
  mode: SelectionMode;
}

export type DragMode = 'none' | 'move' | 'resize' | 'rotate' | 'create' | 'pathDraw';

export type ResizeHandlePosition =
  | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  handle?: ResizeHandlePosition;
  elementId?: string;
  originalAttrs?: Record<string, string>;
  originalBBox?: BBox;
}

// =============================================================================
// Path Editing
// =============================================================================

export interface PathEditState {
  elementId: string;
  nodes: PathNode[];
  selectedNodeIndices: number[];
  hoveredNodeIndex: number | null;
}

// =============================================================================
// Pen Tool
// =============================================================================

export interface PenToolState {
  isActive: boolean;
  elementId: string | null;
  points: Array<{ x: number; y: number; cp1x?: number; cp1y?: number }>;
  isClosed: boolean;
}

// =============================================================================
// Viewport
// =============================================================================

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
}

// =============================================================================
// Snap
// =============================================================================

export interface SnapConfig {
  enabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  snapToElement: boolean;
  snapThreshold: number;
}

export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
}

// =============================================================================
// Panels
// =============================================================================

export type RightPanelTab = 'properties' | 'layers' | 'elements' | 'attributes';

// =============================================================================
// History
// =============================================================================

export interface HistoryEntry {
  document: SvgElementData;
  timestamp: number;
  label: string;
}

// =============================================================================
// Editor Store
// =============================================================================

export interface SvgEditorState {
  document: SvgElementData;
  viewport: ViewportState;
  selection: SelectionState;
  activeTool: EditorTool;
  shapeVariant: ShapeVariant;
  drag: DragState;
  pathEdit: PathEditState | null;
  penTool: PenToolState;
  snapConfig: SnapConfig;
  rightPanelTab: RightPanelTab;
  showCodePanel: boolean;
  showGrid: boolean;
  clipboard: SvgElementData[];
  history: HistoryEntry[];
  historyIndex: number;
}

export interface SvgEditorActions {
  // Document
  newDocument: (width: number, height: number) => void;
  importSvg: (svgString: string) => void;
  getSvgString: () => string;

  // Elements CRUD
  addElement: (parentId: string | null, element: Omit<SvgElementData, 'id'>) => string;
  removeElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  updateElementAttrs: (id: string, attrs: Record<string, string>) => void;
  moveElementInTree: (elementId: string, newParentId: string, index: number) => void;

  // Group operations
  groupElements: (ids: string[]) => void;
  ungroupElement: (id: string) => void;

  // Selection
  selectElements: (ids: string[], mode?: SelectionMode) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Tool
  setActiveTool: (tool: EditorTool) => void;
  setShapeVariant: (variant: ShapeVariant) => void;

  // Drag/Interaction
  startDrag: (state: Omit<DragState, 'currentX' | 'currentY'> & { currentX?: number; currentY?: number }) => void;
  updateDrag: (currentX: number, currentY: number) => void;
  endDrag: () => void;

  // Path editing
  startPathEdit: (elementId: string) => void;
  endPathEdit: () => void;
  updatePathNode: (nodeIndex: number, updates: Partial<PathNode>) => void;
  deletePathNodes: (indices: number[]) => void;
  convertToPathAndEdit: (elementId: string) => void;

  // Text editing
  updateElementTextContent: (id: string, text: string) => void;

  // Pen tool
  penToolClick: (x: number, y: number) => void;
  penToolClose: () => void;
  penToolFinish: () => void;

  // Viewport
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  zoomToFitIn: (containerWidth: number, containerHeight: number) => void;
  setPan: (x: number, y: number) => void;

  // Panels
  setRightPanelTab: (tab: RightPanelTab) => void;
  toggleCodePanel: () => void;
  toggleGrid: () => void;

  // Snap
  updateSnapConfig: (updates: Partial<SnapConfig>) => void;

  // Clipboard
  copySelection: () => void;
  pasteClipboard: () => void;
  cutSelection: () => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: (label: string) => void;
}

export type SvgEditorStore = SvgEditorState & SvgEditorActions;
