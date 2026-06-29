/**
 * Poster Card Editor - Test Utilities
 *
 * Based on: 08-testing-strategy.md
 * Shared test fixtures for engine tests.
 */

import { nanoid } from 'nanoid';

import type {
  PosterNode,
  CanvasNode,
  GroupNode,
  TextNode,
  ShapeNode,
  Matrix2D,
} from './node-tree/types';
import { IDENTITY_MATRIX } from './matrix-utils';

/**
 * Create a standard test tree:
 *   canvas
 *   ├── group1
 *   │   ├── text1 "Hello"
 *   │   └── shape1 (rectangle)
 *   ├── text2 "World"
 *   └── shape2 (circle)
 */
export function createTestTree(): {
  nodes: Record<string, PosterNode>;
  rootNodeId: string;
  ids: {
    canvas: string;
    group1: string;
    text1: string;
    shape1: string;
    text2: string;
    shape2: string;
  };
} {
  const ids = {
    canvas: nanoid(10),
    group1: nanoid(10),
    text1: nanoid(10),
    shape1: nanoid(10),
    text2: nanoid(10),
    shape2: nanoid(10),
  };

  const nodes: Record<string, PosterNode> = {
    [ids.canvas]: {
      id: ids.canvas,
      type: 'canvas',
      parentId: null,
      childrenIds: [ids.group1, ids.text2, ids.shape2],
      localMatrix: [1, 0, 0, 1, 0, 0] as Matrix2D,
      width: 1080,
      height: 1440,
      opacity: 100,
      visible: true,
      locked: false,
      canvasWidth: 1080,
      canvasHeight: 1440,
      background: { type: 'solid', color: '#1a1a2e' },
    } as CanvasNode,

    [ids.group1]: {
      id: ids.group1,
      type: 'group',
      parentId: ids.canvas,
      childrenIds: [ids.text1, ids.shape1],
      localMatrix: [1, 0, 0, 1, 100, 100] as Matrix2D,
      width: 400,
      height: 300,
      opacity: 100,
      visible: true,
      locked: false,
    } as GroupNode,

    [ids.text1]: {
      id: ids.text1,
      type: 'text',
      parentId: ids.group1,
      childrenIds: [],
      localMatrix: [1, 0, 0, 1, 10, 10] as Matrix2D,
      width: 380,
      height: 60,
      opacity: 100,
      visible: true,
      locked: false,
      content: 'Hello',
      fontFamily: 'sans-serif',
      fontSize: 24,
      fontWeight: 400,
      color: '#000000',
      textAlign: 'left',
      lineHeight: 1.4,
      letterSpacing: 0,
      backgroundColor: '',
      padding: 0,
    } as TextNode,

    [ids.shape1]: {
      id: ids.shape1,
      type: 'shape',
      parentId: ids.group1,
      childrenIds: [],
      localMatrix: [1, 0, 0, 1, 10, 80] as Matrix2D,
      width: 380,
      height: 200,
      opacity: 100,
      visible: true,
      locked: false,
      shapeType: 'rectangle',
      fill: '#e0e0e0',
      stroke: '#999',
      strokeWidth: 1,
      borderRadius: 4,
    } as ShapeNode,

    [ids.text2]: {
      id: ids.text2,
      type: 'text',
      parentId: ids.canvas,
      childrenIds: [],
      localMatrix: [1, 0, 0, 1, 500, 200] as Matrix2D,
      width: 400,
      height: 60,
      opacity: 100,
      visible: true,
      locked: false,
      content: 'World',
      fontFamily: 'sans-serif',
      fontSize: 32,
      fontWeight: 700,
      color: '#333',
      textAlign: 'center',
      lineHeight: 1.4,
      letterSpacing: 2,
      backgroundColor: '',
      padding: 0,
    } as TextNode,

    [ids.shape2]: {
      id: ids.shape2,
      type: 'shape',
      parentId: ids.canvas,
      childrenIds: [],
      localMatrix: [1, 0, 0, 1, 600, 400] as Matrix2D,
      width: 200,
      height: 200,
      opacity: 80,
      visible: true,
      locked: false,
      shapeType: 'circle',
      fill: '#ff6b6b',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
    } as ShapeNode,
  };

  return { nodes, rootNodeId: ids.canvas, ids };
}

/**
 * Create a single test node with sensible defaults.
 */
export function createTestNode(
  overrides: Partial<PosterNode> & { type?: PosterNode['type'] } = {},
): PosterNode {
  const type = overrides.type ?? 'text';
  const id = overrides.id ?? nanoid(10);

  const base = {
    id,
    type,
    parentId: null,
    childrenIds: [],
    localMatrix: [...IDENTITY_MATRIX] as Matrix2D,
    width: 100,
    height: 100,
    opacity: 100,
    visible: true,
    locked: false,
  };

  switch (type) {
    case 'text':
      return {
        ...base,
        type: 'text',
        content: 'Test',
        fontFamily: 'sans-serif',
        fontSize: 16,
        fontWeight: 400,
        color: '#000',
        textAlign: 'left' as const,
        lineHeight: 1.4,
        letterSpacing: 0,
        backgroundColor: '',
        padding: 0,
        ...overrides,
      };
    case 'shape':
      return {
        ...base,
        type: 'shape',
        shapeType: 'rectangle',
        fill: '#e0e0e0',
        stroke: '#999',
        strokeWidth: 1,
        borderRadius: 0,
        ...overrides,
      };
    case 'image':
      return {
        ...base,
        type: 'image',
        src: 'https://example.com/test.jpg',
        objectFit: 'cover' as const,
        borderRadius: 0,
        ...overrides,
      };
    case 'decorative':
      return {
        ...base,
        type: 'decorative',
        decorativeType: 'border',
        color: '#ccc',
        strokeWidth: 1,
        spacing: 10,
        ...overrides,
      };
    default:
      return { ...base, ...overrides } as PosterNode;
  }
}
