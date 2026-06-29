/**
 * Poster Card Editor - Command Slice
 *
 * Based on: 02-command-system.md, 09-architecture-upgrades.md (修正3)
 * Patch-based command system for undo/redo.
 */

import type { Command } from '../commands/types';
import type { CommandSlice, EditorState } from './types';

const MAX_UNDO = 50;

export function createCommandSlice(
  set: (fn: (draft: EditorState) => void) => void,
  get: () => EditorState,
): CommandSlice {
  return {
    undoStack: [],
    redoStack: [],
    isExecuting: false,

    execute: (command: Command) => {
      const state = get();
      if (state.isExecuting) return;

      const patch = command.execute();

      set((draft: EditorState) => {
        patch(draft.nodes);
        draft.version++;

        // Merge check
        const topCommand = draft.undoStack[draft.undoStack.length - 1];
        const merged = topCommand?.merge?.(command) ?? null;

        if (merged) {
          draft.undoStack[draft.undoStack.length - 1] = merged;
        } else {
          draft.undoStack.push(command);
        }

        draft.redoStack = [];

        // Stack overflow protection
        if (draft.undoStack.length > MAX_UNDO) {
          draft.undoStack.shift();
        }
      });
    },

    undo: () => {
      const state = get();
      if (state.undoStack.length === 0) return;

      const command = state.undoStack[state.undoStack.length - 1];
      const patch = command.undo();

      set((draft: EditorState) => {
        draft.isExecuting = true;
        patch(draft.nodes);
        draft.version++;
        draft.undoStack.pop();
        draft.redoStack.push(command);
        draft.isExecuting = false;
      });
    },

    redo: () => {
      const state = get();
      if (state.redoStack.length === 0) return;

      const command = state.redoStack[state.redoStack.length - 1];
      const patch = command.execute();

      set((draft: EditorState) => {
        draft.isExecuting = true;
        patch(draft.nodes);
        draft.version++;
        draft.redoStack.pop();
        draft.undoStack.push(command);
        draft.isExecuting = false;
      });
    },

    canUndo: () => get().undoStack.length > 0,
    canRedo: () => get().redoStack.length > 0,

    clearHistory: () => {
      set((state) => {
        state.undoStack = [];
        state.redoStack = [];
      });
    },
  };
}
