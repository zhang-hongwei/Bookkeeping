/**
 * Poster Card Editor - Selection Slice
 *
 * Based on: 03-selection-engine.md, 09-architecture-upgrades.md (修正5)
 */

import type { SelectionSlice, EditorState } from './types';
import { getLeafNodes } from '../node-tree/selectors';

export function createSelectionSlice(
  set: (fn: (draft: EditorState) => void) => void,
  get: () => EditorState,
): SelectionSlice {
  return {
    selectedIds: new Set<string>(),
    activeGroupId: null as string | null,
    hoverNodeId: null as string | null,

    singleSelect: (id) => {
      set((state) => {
        const node = state.nodes[id];
        if (!node || node.locked) return;
        state.selectedIds = new Set([id]);
      });
    },

    toggleSelect: (id) => {
      set((state) => {
        const node = state.nodes[id];
        if (!node || node.locked) return;

        const newSet = new Set(state.selectedIds);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        state.selectedIds = newSet;
      });
    },

    boxSelect: (nodeIds) => {
      set((state) => {
        state.selectedIds = new Set(
          nodeIds.filter((id) => {
            const node = state.nodes[id];
            return node && node.visible && !node.locked;
          }),
        );
      });
    },

    selectAll: () => {
      set((state) => {
        const { nodes, rootNodeId, activeGroupId } = state;
        if (!rootNodeId) return;

        const scopeId = activeGroupId ?? rootNodeId;
        const leaves = getLeafNodes(nodes, scopeId);
        state.selectedIds = new Set(
          leaves.filter((n) => n.visible && !n.locked).map((n) => n.id),
        );
      });
    },

    clearSelection: () => {
      set((state) => {
        state.selectedIds = new Set();
      });
    },

    enterGroup: (id) => {
      set((state) => {
        state.activeGroupId = id;
        state.selectedIds = new Set();
      });
    },

    exitGroup: () => {
      set((state) => {
        if (state.activeGroupId) {
          const group = state.nodes[state.activeGroupId];
          if (group?.parentId) {
            state.activeGroupId = null;
          }
        }
        state.selectedIds = new Set();
      });
    },

    setHoverNode: (id) => {
      set((state) => {
        state.hoverNodeId = id;
      });
    },
  };
}
