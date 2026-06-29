/**
 * Poster Card Editor - Node Tree Type System (v2 with Matrix2D)
 *
 * Based on: 01-node-tree.md, 09-architecture-upgrades.md (修正1)
 * Key change: Transform uses Matrix2D instead of pseudo-2D parameters
 */

// ═══════════════════════════════════════
// Matrix2D (2D Affine Matrix)
// ═══════════════════════════════════════

/**
 * 2D affine matrix: [a, b, c, d, e, f]
 * | a  c  e |     | scaleX  skewY   tx |
 * | b  d  f |  =  | skewX   scaleY  ty |
 * | 0  0  1 |     | 0       0       1  |
 */
export type Matrix2D = [number, number, number, number, number, number];

// ═══════════════════════════════════════
// Node Type Discriminator
// ═══════════════════════════════════════

export type NodeType = 'canvas' | 'group' | 'text' | 'shape' | 'decorative' | 'image';

// ═══════════════════════════════════════
// Base Node (shared by all nodes)
// ═══════════════════════════════════════

export interface BaseNode {
  id: string;
  type: NodeType;
  parentId: string | null; // null = root canvas node
  childrenIds: string[]; // ordered, index = z-order (0=bottom)
  localMatrix: Matrix2D; // local transform relative to parent
  width: number;
  height: number;
  opacity: number; // 0-100
  visible: boolean;
  locked: boolean;
  name?: string; // user-friendly layer name
}

// ═══════════════════════════════════════
// Background Types
// ═══════════════════════════════════════

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

// ═══════════════════════════════════════
// Canvas Aspect Ratio
// ═══════════════════════════════════════

export type CanvasAspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface CanvasSize {
  width: number;
  height: number;
}

export const ASPECT_RATIOS: Record<CanvasAspectRatio, CanvasSize & { label: string }> = {
  '1:1': { width: 1080, height: 1080, label: 'Square' },
  '3:4': { width: 1080, height: 1440, label: 'Portrait' },
  '4:3': { width: 1080, height: 810, label: 'Landscape' },
  '9:16': { width: 1080, height: 1920, label: 'Story' },
  '16:9': { width: 1920, height: 1080, label: 'Widescreen' },
};

// ═══════════════════════════════════════
// Container Nodes
// ═══════════════════════════════════════

export interface CanvasNode extends BaseNode {
  type: 'canvas';
  canvasWidth: number;
  canvasHeight: number;
  background: Background;
}

export interface GroupNode extends BaseNode {
  type: 'group';
}

// ═══════════════════════════════════════
// Leaf Nodes
// ═══════════════════════════════════════

export interface TextNode extends BaseNode {
  type: 'text';
  content: string;
  fontFamily: string; // fallback when fontAssetId not set
  fontSize: number;
  fontWeight: number;
  color: string; // fallback when colorId not set
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  backgroundColor: string;
  padding: number;
  // Asset references (v3)
  fontAssetId?: string;
  typographyId?: string;
  colorId?: string;
}

export interface ShapeNode extends BaseNode {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line' | 'svg';
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
  // Asset references (v3)
  assetId?: string;
  svgContent?: string;
}

export interface DecorativeNode extends BaseNode {
  type: 'decorative';
  decorativeType: 'border' | 'scanlines' | 'dots' | 'grid';
  color: string;
  strokeWidth: number;
  spacing: number;
}

export interface ImageNode extends BaseNode {
  type: 'image';
  src?: string; // fallback when assetId not set (backward compat)
  objectFit: 'cover' | 'contain' | 'fill';
  borderRadius: number;
  // Asset references (v3)
  assetId?: string;
}

// ═══════════════════════════════════════
// Union Types
// ═══════════════════════════════════════

export type PosterNode =
  | CanvasNode
  | GroupNode
  | TextNode
  | ShapeNode
  | DecorativeNode
  | ImageNode;

export type LeafNode = TextNode | ShapeNode | DecorativeNode | ImageNode;
export type ContainerNode = CanvasNode | GroupNode;

// ═══════════════════════════════════════
// Type Guards
// ═══════════════════════════════════════

export function isContainerNode(node: PosterNode): node is ContainerNode {
  return node.type === 'canvas' || node.type === 'group';
}

export function isLeafNode(node: PosterNode): node is LeafNode {
  return !isContainerNode(node);
}
