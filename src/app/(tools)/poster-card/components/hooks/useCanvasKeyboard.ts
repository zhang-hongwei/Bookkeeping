/**
 * Canvas keyboard shortcuts hook
 * Handles space (pan mode), delete, undo/redo, Ctrl+A/C/V/D
 */

"use client";

import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../engine/store';
import { deleteSelectedWithTransaction } from '../../engine/selection/selection-ops';
import { copyNodes, pasteNodes, duplicateNodes } from '../../engine/clipboard';

export function useCanvasKeyboard(
  selectedElementId: string | null,
  editingTextId: string | null,
) {
  const isSpaceHeld = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextId) return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        isSpaceHeld.current = true;
      }

      const mod = e.ctrlKey || e.metaKey;

      // Delete all selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && !mod) {
        const s = useEditorStore.getState();
        if (s.selectedIds.size > 0) {
          s.execute(deleteSelectedWithTransaction(s.selectedIds, s.nodes));
        }
      }

      // Undo
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().undo();
      }

      // Redo
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        useEditorStore.getState().redo();
      }

      // Select all
      if (mod && e.key === 'a') {
        e.preventDefault();
        useEditorStore.getState().selectAll();
      }

      // Copy
      if (mod && e.key === 'c' && !e.shiftKey) {
        e.preventDefault();
        const s = useEditorStore.getState();
        if (s.selectedIds.size > 0) {
          copyNodes(s.selectedIds, s.nodes);
        }
      }

      // Paste
      if (mod && e.key === 'v' && !e.shiftKey) {
        e.preventDefault();
        const s = useEditorStore.getState();
        if (s.rootNodeId) {
          const cmd = pasteNodes(s.rootNodeId, s.nodes);
          if (cmd) s.execute(cmd);
        }
      }

      // Duplicate (Ctrl+D)
      if (mod && e.key === 'd') {
        e.preventDefault();
        const s = useEditorStore.getState();
        if (s.selectedIds.size > 0 && s.rootNodeId) {
          const cmd = duplicateNodes(s.selectedIds, s.rootNodeId, s.nodes);
          if (cmd) s.execute(cmd);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceHeld.current = false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedElementId, editingTextId]);

  return { isSpaceHeld };
}
