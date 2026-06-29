/**
 * Poster Card Editor - Node Tree Slice
 *
 * Based on: 05-store-design.md section 2.1
 */

import { nanoid } from 'nanoid';

import type { PosterNode, Background } from '../node-tree/types';
import type { NodeTreeSlice, EditorState } from './types';

type SetFn = (fn: (draft: EditorState) => void) => void;

export function createNodeTreeSlice(
  set: SetFn,
  _get: () => EditorState,
): NodeTreeSlice {
  return {
    nodes: {} as Record<string, PosterNode>,
    rootNodeId: null as string | null,
    version: 0,

    initCanvas: (width, height, background) => {
      const bg: Background = background ?? { type: 'solid', color: '#1a1a2e' };
      const id = nanoid(10);
      set((state) => {
        state.nodes[id] = {
          id,
          type: 'canvas',
          parentId: null,
          childrenIds: [],
          localMatrix: [1, 0, 0, 1, 0, 0],
          width,
          height,
          opacity: 100,
          visible: true,
          locked: false,
          canvasWidth: width,
          canvasHeight: height,
          background: bg,
        } as PosterNode;
        state.rootNodeId = id;
        state.version++;
      });
      return id;
    },

    resetAndInitCanvas: (width, height, background) => {
      const bg: Background = background ?? { type: 'solid', color: '#1a1a2e' };
      const id = nanoid(10);
      set((state) => {
        state.nodes = {} as Record<string, PosterNode>;
        state.rootNodeId = id;
        state.selectedIds = new Set();
        state.undoStack = [];
        state.redoStack = [];
        state.activeGroupId = null;
        state.hoverNodeId = null;
        state.editingTextId = null;
        state.activeGuides = [];

        state.nodes[id] = {
          id,
          type: 'canvas',
          parentId: null,
          childrenIds: [],
          localMatrix: [1, 0, 0, 1, 0, 0],
          width,
          height,
          opacity: 100,
          visible: true,
          locked: false,
          canvasWidth: width,
          canvasHeight: height,
          background: bg,
        } as PosterNode;
        state.version++;
      });
      return id;
    },

    addNode: (nodeData, parentId, index) => {
      const id = nanoid(10);
      set((state) => {
        const node = { ...nodeData, id } as PosterNode;
        const pid = parentId ?? state.rootNodeId ?? '';
        node.parentId = pid;
        state.nodes[id] = node;

        const parent = state.nodes[pid];
        if (parent) {
          if (index !== undefined) {
            parent.childrenIds.splice(index, 0, id);
          } else {
            parent.childrenIds.push(id);
          }
        }
        state.version++;
      });
      return id;
    },

    removeNode: (id) => {
      set((state) => {
        const node = state.nodes[id];
        if (!node) return;

        // Collect all descendants
        const toRemove = new Set<string>();
        const collectDescendants = (nodeId: string) => {
          toRemove.add(nodeId);
          const n = state.nodes[nodeId];
          if (n) {
            for (const childId of n.childrenIds) {
              collectDescendants(childId);
            }
          }
        };
        collectDescendants(id);

        // Remove from parent's childrenIds
        if (node.parentId) {
          const parent = state.nodes[node.parentId];
          if (parent) {
            parent.childrenIds = parent.childrenIds.filter((cid) => cid !== id);
          }
        }

        // Delete all collected nodes
        for (const nodeId of toRemove) {
          delete state.nodes[nodeId];
        }

        // Remove from selection if selected
        for (const nodeId of toRemove) {
          state.selectedIds.delete(nodeId);
        }

        state.version++;
      });
    },

    moveNode: (id, newParentId, newIndex) => {
      set((state) => {
        const node = state.nodes[id];
        if (!node) return;

        // Remove from old parent
        if (node.parentId) {
          const oldParent = state.nodes[node.parentId];
          if (oldParent) {
            oldParent.childrenIds = oldParent.childrenIds.filter((cid) => cid !== id);
          }
        }

        // Add to new parent
        const newParent = state.nodes[newParentId];
        if (newParent) {
          if (newIndex !== undefined) {
            newParent.childrenIds.splice(newIndex, 0, id);
          } else {
            newParent.childrenIds.push(id);
          }
        }
        node.parentId = newParentId;
        state.version++;
      });
    },

    updateNode: (id, updates) => {
      set((state) => {
        const node = state.nodes[id];
        if (!node) return;

        // Forbidden fields
        const forbidden = new Set(['id', 'parentId', 'childrenIds']);
        for (const key of forbidden) {
          if (key in updates) {
            delete (updates as Record<string, unknown>)[key];
          }
        }

        Object.assign(node, updates);
        state.version++;
      });
    },

    setNodes: (newNodes, newRootId) => {
      set((state) => {
        state.nodes = newNodes;
        state.rootNodeId = newRootId;
        state.selectedIds = new Set();
        state.undoStack = [];
        state.redoStack = [];
        state.version++;
      });
    },

    reorderNode: (id, direction) => {
      set((state) => {
        const node = state.nodes[id];
        if (!node || !node.parentId) return;

        const parent = state.nodes[node.parentId];
        if (!parent) return;

        const idx = parent.childrenIds.indexOf(id);
        if (idx === -1) return;

        parent.childrenIds.splice(idx, 1);

        switch (direction) {
          case 'up':
            parent.childrenIds.splice(Math.min(idx + 1, parent.childrenIds.length), 0, id);
            break;
          case 'down':
            parent.childrenIds.splice(Math.max(idx - 1, 0), 0, id);
            break;
          case 'top':
            parent.childrenIds.push(id);
            break;
          case 'bottom':
            parent.childrenIds.unshift(id);
            break;
        }
        state.version++;
      });
    },
  };
}
