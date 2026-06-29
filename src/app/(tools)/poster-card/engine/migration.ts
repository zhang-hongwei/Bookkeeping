/**
 * Poster Card Editor - Migration Utilities
 *
 * Based on: 06-migration.md
 * Convert old flat elements[] format to new tree-based nodes format.
 */

import { nanoid } from 'nanoid';

import type {
  PosterNode,
  CanvasNode,
  TextNode,
  ShapeNode,
  DecorativeNode,
  ImageNode,
  Background,
  CanvasAspectRatio,
  Matrix2D,
} from './node-tree/types';
import { ASPECT_RATIOS } from './node-tree/types';
import { createMatrix, decomposeMatrix } from './matrix-utils';

// Re-import old types for migration
type OldElementType = 'text' | 'shape' | 'decorative' | 'image';

interface OldBaseElement {
  id?: string;
  type: OldElementType;
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

interface OldTextElement extends OldBaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  backgroundColor: string;
  padding: number;
}

interface OldShapeElement extends OldBaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

interface OldDecorativeElement extends OldBaseElement {
  type: 'decorative';
  decorativeType: 'border' | 'scanlines' | 'dots' | 'grid';
  color: string;
  strokeWidth: number;
  spacing: number;
}

interface OldImageElement extends OldBaseElement {
  type: 'image';
  src: string;
  objectFit: 'cover' | 'contain' | 'fill';
  borderRadius: number;
}

type OldPosterElement = OldTextElement | OldShapeElement | OldDecorativeElement | OldImageElement;

interface OldState {
  canvasAspectRatio: CanvasAspectRatio;
  elements: OldPosterElement[];
  background: Background;
  zoom: number;
}

interface NewState {
  nodes: Record<string, PosterNode>;
  rootNodeId: string;
}

export function migrateOldToNew(old: OldState): NewState {
  const nodes: Record<string, PosterNode> = {};
  const canvasSize = ASPECT_RATIOS[old.canvasAspectRatio];

  // 1. Create canvas root
  const rootId = nanoid(10);
  nodes[rootId] = {
    id: rootId,
    type: 'canvas',
    parentId: null,
    childrenIds: [],
    localMatrix: [1, 0, 0, 1, 0, 0] as Matrix2D,
    width: canvasSize.width,
    height: canvasSize.height,
    opacity: 100,
    visible: true,
    locked: false,
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    background: old.background,
  } as CanvasNode;

  // 2. Convert each element to node, sorted by zIndex
  const sorted = [...old.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    const id = el.id ?? nanoid(10);
    const localMatrix = createMatrix({
      x: el.x,
      y: el.y,
      rotation: el.rotation,
    });

    const baseFields = {
      id,
      parentId: rootId,
      childrenIds: [],
      localMatrix,
      width: el.width,
      height: el.height,
      opacity: el.opacity,
      visible: el.visible,
      locked: el.locked,
    };

    switch (el.type) {
      case 'text':
        nodes[id] = {
          ...baseFields,
          type: 'text',
          content: el.content,
          fontFamily: el.fontFamily,
          fontSize: el.fontSize,
          fontWeight: el.fontWeight,
          color: el.color,
          textAlign: el.textAlign,
          lineHeight: el.lineHeight,
          letterSpacing: el.letterSpacing,
          backgroundColor: el.backgroundColor,
          padding: el.padding,
        } as TextNode;
        break;
      case 'shape':
        nodes[id] = {
          ...baseFields,
          type: 'shape',
          shapeType: el.shapeType,
          fill: el.fill,
          stroke: el.stroke,
          strokeWidth: el.strokeWidth,
          borderRadius: el.borderRadius,
        } as ShapeNode;
        break;
      case 'decorative':
        nodes[id] = {
          ...baseFields,
          type: 'decorative',
          decorativeType: el.decorativeType,
          color: el.color,
          strokeWidth: el.strokeWidth,
          spacing: el.spacing,
        } as DecorativeNode;
        break;
      case 'image':
        nodes[id] = {
          ...baseFields,
          type: 'image',
          src: el.src,
          objectFit: el.objectFit,
          borderRadius: el.borderRadius,
        } as ImageNode;
        break;
    }

    nodes[rootId].childrenIds.push(id);
  }

  return { nodes, rootNodeId: rootId };
}

/**
 * Detect aspect ratio from canvas dimensions.
 */
function detectAspectRatio(width: number, height: number): CanvasAspectRatio {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.01) return '1:1';
  if (Math.abs(ratio - 3 / 4) < 0.01) return '3:4';
  if (Math.abs(ratio - 4 / 3) < 0.01) return '4:3';
  if (Math.abs(ratio - 9 / 16) < 0.01) return '9:16';
  if (Math.abs(ratio - 16 / 9) < 0.01) return '16:9';
  return '3:4'; // default
}

/**
 * Convert new tree format back to old flat format (for gradual migration).
 */
export function migrateNewToOld(newState: NewState): OldState {
  const root = newState.nodes[newState.rootNodeId] as CanvasNode;
  const elements: OldPosterElement[] = [];

  for (const childId of root.childrenIds) {
    const node = newState.nodes[childId];
    if (!node) continue;

    // Decompose matrix to get x, y, rotation
    const { x, y, rotation } = decomposeMatrix(node.localMatrix);

    const baseElement = {
      id: node.id,
      type: node.type as OldElementType,
      x,
      y,
      width: node.width,
      height: node.height,
      rotation,
      opacity: node.opacity,
      zIndex: root.childrenIds.indexOf(childId),
      locked: node.locked,
      visible: node.visible,
    };

    switch (node.type) {
      case 'text':
        elements.push({
          ...baseElement,
          type: 'text',
          content: node.content,
          fontFamily: node.fontFamily,
          fontSize: node.fontSize,
          fontWeight: node.fontWeight,
          color: node.color,
          textAlign: node.textAlign,
          lineHeight: node.lineHeight,
          letterSpacing: node.letterSpacing,
          backgroundColor: node.backgroundColor,
          padding: node.padding,
        } as OldTextElement);
        break;
      case 'shape':
        elements.push({
          ...baseElement,
          type: 'shape',
          shapeType: node.shapeType,
          fill: node.fill,
          stroke: node.stroke,
          strokeWidth: node.strokeWidth,
          borderRadius: node.borderRadius,
        } as OldShapeElement);
        break;
      case 'decorative':
        elements.push({
          ...baseElement,
          type: 'decorative',
          decorativeType: node.decorativeType,
          color: node.color,
          strokeWidth: node.strokeWidth,
          spacing: node.spacing,
        } as OldDecorativeElement);
        break;
      case 'image':
        elements.push({
          ...baseElement,
          type: 'image',
          src: node.src,
          objectFit: node.objectFit,
          borderRadius: node.borderRadius,
        } as OldImageElement);
        break;
    }
  }

  return {
    canvasAspectRatio: detectAspectRatio(root.canvasWidth, root.canvasHeight),
    elements,
    background: root.background,
    zoom: 0.5,
  };
}

/**
 * Migrate a template preset to the new format.
 */
export function migrateTemplate(
  preset: {
    canvasSize: CanvasAspectRatio;
    background: Background;
    elements: Omit<OldPosterElement, 'id'>[];
  },
): NewState {
  const elementsWithIds = preset.elements.map((el, i) => ({
    ...el,
    id: undefined,
    zIndex: i,
  })) as OldPosterElement[];

  return migrateOldToNew({
    canvasAspectRatio: preset.canvasSize,
    elements: elementsWithIds,
    background: preset.background,
    zoom: 0.5,
  });
}
