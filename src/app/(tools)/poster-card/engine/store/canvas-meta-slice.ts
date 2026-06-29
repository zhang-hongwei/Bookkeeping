/**
 * Poster Card Editor - Canvas Meta Slice
 */

import type { CanvasMetaSlice, EditorState } from './types';

export function createCanvasMetaSlice(
  set: (fn: (draft: EditorState) => void) => void,
): CanvasMetaSlice {
  return {
    zoom: 0.5,
    panOffset: { x: 0, y: 0 },
    editingTextId: null as string | null,
    exportScale: 2,
    activeTemplateId: null as string | null,

    setZoom: (zoom) => {
      set((state) => {
        state.zoom = Math.max(0.1, Math.min(3, zoom));
      });
    },

    setPanOffset: (offset) => {
      set((state) => {
        state.panOffset = offset;
      });
    },

    setEditingTextId: (id) => {
      set((state) => {
        state.editingTextId = id;
      });
    },

    setExportScale: (scale) => {
      set((state) => {
        state.exportScale = scale;
      });
    },

    setActiveTemplateId: (id) => {
      set((state) => {
        state.activeTemplateId = id;
      });
    },
  };
}
