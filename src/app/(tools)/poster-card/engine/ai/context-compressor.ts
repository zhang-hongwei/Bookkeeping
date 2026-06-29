/**
 * AI Context Compressor
 * Converts the node tree into a compact summary for AI consumption.
 */

import type {
  PosterNode,
  TextNode,
  ImageNode,
  ShapeNode,
  DecorativeNode,
  CanvasNode,
} from '../node-tree/types';
import { decomposeMatrix } from '../matrix-utils';

export interface CompressedElement {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  src?: string;
  shapeType?: string;
  fill?: string;
}

export interface CompressedContext {
  canvas: { width: number; height: number; background: string };
  elements: CompressedElement[];
  selectedIds: string[];
  elementCount: number;
}

export function compressContext(
  nodes: Record<string, PosterNode>,
  rootNodeId: string,
  selectedIds: Set<string>,
): CompressedContext {
  const root = nodes[rootNodeId] as CanvasNode | undefined;
  const canvas = {
    width: root?.canvasWidth ?? 0,
    height: root?.canvasHeight ?? 0,
    background: JSON.stringify(root?.background ?? {}),
  };

  const elements = (root?.childrenIds ?? [])
    .map((id) => nodes[id])
    .filter(Boolean)
    .map(compressNode);

  return {
    canvas,
    elements,
    selectedIds: [...selectedIds],
    elementCount: elements.length,
  };
}

function compressNode(node: PosterNode): CompressedElement {
  const { x, y, rotation } = decomposeMatrix(node.localMatrix);
  const base: CompressedElement = {
    id: node.id,
    type: node.type,
    position: { x: Math.round(x), y: Math.round(y) },
    size: { width: Math.round(node.width), height: Math.round(node.height) },
    rotation: Math.round(rotation * 10) / 10,
    opacity: node.opacity,
    visible: node.visible,
    locked: node.locked,
  };

  switch (node.type) {
    case 'text': {
      const tn = node as TextNode;
      return {
        ...base,
        content: tn.content,
        fontFamily: tn.fontFamily,
        fontSize: tn.fontSize,
        color: tn.color,
      };
    }
    case 'image': {
      const im = node as ImageNode;
      return { ...base, src: im.src ? `${im.src.slice(0, 50)}...` : undefined };
    }
    case 'shape': {
      const sn = node as ShapeNode;
      return { ...base, shapeType: sn.shapeType, fill: sn.fill };
    }
    case 'decorative': {
      const dn = node as DecorativeNode;
      return { ...base, fill: dn.color };
    }
    default:
      return base;
  }
}

export function contextToPromptText(ctx: CompressedContext): string {
  const lines: string[] = [
    `Canvas: ${ctx.canvas.width}x${ctx.canvas.height}`,
    `Elements: ${ctx.elementCount}`,
    `Selected: ${ctx.selectedIds.length > 0 ? ctx.selectedIds.join(', ') : 'none'}`,
    '',
    '--- Elements ---',
  ];

  for (const el of ctx.elements) {
    const pos = `(${el.position.x}, ${el.position.y})`;
    const size = `${el.size.width}x${el.size.height}`;
    let desc = `[${el.type}] ${el.id} at ${pos} size ${size}`;
    if (el.content) desc += ` text="${el.content.slice(0, 80)}"`;
    if (el.fontFamily) desc += ` font=${el.fontFamily}`;
    if (el.fill) desc += ` fill=${el.fill}`;
    if (el.rotation) desc += ` rot=${el.rotation}deg`;
    if (!el.visible) desc += ' HIDDEN';
    if (el.locked) desc += ' LOCKED';
    lines.push(desc);
  }

  return lines.join('\n');
}
