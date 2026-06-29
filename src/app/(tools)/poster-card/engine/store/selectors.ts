/**
 * Poster Card Editor - Store Selector Hooks
 *
 * Based on: 05-store-design.md section 4, 09-architecture-upgrades.md (修正4)
 * Fine-grained selectors to minimize re-renders.
 */

import { useShallow } from 'zustand/react/shallow';

import type { PosterNode } from '../node-tree/types';

// Store is imported from index - no circular dependency since index doesn't import this file
// eslint-disable-next-line import/no-cycle
import { useEditorStore } from './index';

/** Get a single node by ID. Only re-renders when this specific node changes. */
export function useNode(id: string | null): PosterNode | null {
  return useEditorStore(
    useShallow((state) => (id ? state.nodes[id] ?? null : null)),
  );
}

/** Get root canvas node's children IDs. Canvas rendering uses this. */
export function useRootChildrenIds(): string[] {
  return useEditorStore(
    useShallow((state) => {
      if (!state.rootNodeId) return [];
      const root = state.nodes[state.rootNodeId];
      return root ? root.childrenIds : [];
    }),
  );
}

/** Get selected node IDs. */
export function useSelectedIds(): Set<string> {
  return useEditorStore((state) => state.selectedIds);
}

/** Get selected nodes with full data. */
export function useSelectedNodes(): PosterNode[] {
  return useEditorStore(
    useShallow((state) =>
      [...state.selectedIds]
        .map((id) => state.nodes[id])
        .filter(Boolean) as PosterNode[],
    ),
  );
}

/** Get sorted children for rendering. */
export function useSortedChildren(): PosterNode[] {
  return useEditorStore(
    useShallow((state) => {
      if (!state.rootNodeId) return [];
      const root = state.nodes[state.rootNodeId];
      if (!root) return [];
      return root.childrenIds
        .map((id) => state.nodes[id])
        .filter(Boolean) as PosterNode[];
    }),
  );
}

/** Get canvas settings (width, height, background). */
export function useCanvasSettings(): {
  width: number;
  height: number;
  background: import('../node-tree/types').Background;
} | null {
  return useEditorStore(
    useShallow((state) => {
      const root = state.rootNodeId ? state.nodes[state.rootNodeId] : null;
      if (!root || root.type !== 'canvas') return null;
      return {
        width: root.canvasWidth,
        height: root.canvasHeight,
        background: root.background,
      };
    }),
  );
}

/** Get undo/redo availability. */
export function useUndoRedo(): { canUndo: boolean; canRedo: boolean } {
  return useEditorStore(
    useShallow((state) => ({
      canUndo: state.undoStack.length > 0,
      canRedo: state.redoStack.length > 0,
    })),
  );
}
