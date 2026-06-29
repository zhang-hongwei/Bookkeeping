/**
 * Poster Card Editor - Type Definitions
 */

// === Canvas ===
export type CanvasAspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface CanvasSize {
  width: number;
  height: number;
}

export const ASPECT_RATIOS: Record<CanvasAspectRatio, CanvasSize & { label: string }> = {
  '1:1':  { width: 1080, height: 1080, label: 'Square' },
  '3:4':  { width: 1080, height: 1440, label: 'Portrait' },
  '4:3':  { width: 1080, height: 810,  label: 'Landscape' },
  '9:16': { width: 1080, height: 1920, label: 'Story' },
  '16:9': { width: 1920, height: 1080, label: 'Widescreen' },
};

// === Element Types ===
export type ElementType = 'text' | 'shape' | 'decorative' | 'image';

export type ShapeType = 'rectangle' | 'circle' | 'line';
export type DecorativeType = 'border' | 'scanlines' | 'dots' | 'grid';
export type TextAlign = 'left' | 'center' | 'right';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  backgroundColor: string;
  padding: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

export interface DecorativeElement extends BaseElement {
  type: 'decorative';
  decorativeType: DecorativeType;
  color: string;
  strokeWidth: number;
  spacing: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  objectFit: 'cover' | 'contain' | 'fill';
  borderRadius: number;
}

export type PosterElement = TextElement | ShapeElement | DecorativeElement | ImageElement;

// === Background ===
export type BackgroundType = 'solid' | 'gradient' | 'pattern';

export interface SolidBackground {
  type: 'solid';
  color: string;
}

export interface GradientBackground {
  type: 'gradient';
  angle: number;
  stops: Array<{ color: string; position: number }>;
}

export interface PatternBackground {
  type: 'pattern';
  patternId: string;
  color: string;
  backgroundColor: string;
  scale: number;
}

export type Background = SolidBackground | GradientBackground | PatternBackground;

// === Template ===
export type TemplateStyle =
  | 'bbs-terminal'
  | 'c64'
  | 'win95'
  | 'mac-classic'
  | 'modern-minimal'
  | 'gradient-modern'
  | 'glassmorphism'
  | 'poster-bold'
  | 'swiss-design'
  | 'neon-cyber'
  | 'pastel-dream'
  | 'dark-luxury'
  | 'newspaper'
  | 'pop-art'
  | 'tokyo-night'
  | 'punk-riot';

export interface TemplatePreset {
  id: TemplateStyle;
  label: string;
  labelEn: string;
  description: string;
  category: 'retro' | 'modern';
  emoji: string;
  canvasSize: CanvasAspectRatio;
  background: Background;
  elements: Omit<PosterElement, 'id'>[];
}

// === Smart Guides ===
export interface SmartGuide {
  type: 'center-h' | 'center-v' | 'edge-left' | 'edge-right' | 'edge-top' | 'edge-bottom' | 'spacing-h' | 'spacing-v';
  position: number;
}

// === Interaction ===
export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface DragState {
  elementId: string;
  startMouseX: number;
  startMouseY: number;
  startElementX: number;
  startElementY: number;
}

export interface ResizeState {
  elementId: string;
  handle: ResizeHandle;
  startMouseX: number;
  startMouseY: number;
  startRect: { x: number; y: number; width: number; height: number };
}

// === Store ===
export interface PosterEditorState {
  canvasAspectRatio: CanvasAspectRatio;
  zoom: number;
  elements: PosterElement[];
  selectedElementId: string | null;
  background: Background;
  activeTemplate: TemplateStyle | null;
  exportScale: number;
  editingTextId: string | null;
}

export interface PosterEditorActions {
  setCanvasAspectRatio: (ratio: CanvasAspectRatio) => void;
  setZoom: (zoom: number) => void;
  zoomToFit: () => void;

  addElement: (element: Omit<PosterElement, 'id' | 'zIndex'>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<PosterElement>) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number, x?: number, y?: number) => void;
  reorderElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  toggleElementVisibility: (id: string) => void;
  toggleElementLock: (id: string) => void;

  selectElement: (id: string | null) => void;

  setBackground: (bg: Background) => void;

  setEditingTextId: (id: string | null) => void;

  applyTemplate: (templateId: TemplateStyle) => void;

  setExportScale: (scale: number) => void;

  reset: () => void;
}

export type PosterEditorStore = PosterEditorState & PosterEditorActions;
