/**
 * Poster Card Editor - Command Manager (pure logic)
 *
 * Based on: 02-command-system.md section 5
 * Pure functions for managing undo/redo stacks.
 */

import type { Command, StatePatch } from './types';

export interface CommandManagerState {
  undoStack: Command[];
  redoStack: Command[];
  isExecuting: boolean;
}

const MAX_UNDO = 50;

export function executeCommand(
  state: CommandManagerState,
  command: Command,
): { state: CommandManagerState; patch: StatePatch } {
  if (state.isExecuting) {
    return { state, patch: (draft) => {} };
  }

  const patch = command.execute();

  // Check merge with top of undo stack
  const topCommand = state.undoStack[state.undoStack.length - 1];
  const merged = topCommand?.merge?.(command) ?? null;

  let newUndoStack: Command[];
  if (merged) {
    newUndoStack = [...state.undoStack.slice(0, -1), merged];
  } else {
    newUndoStack = [...state.undoStack, command];
  }

  // Stack overflow protection
  if (newUndoStack.length > MAX_UNDO) {
    newUndoStack = newUndoStack.slice(-MAX_UNDO);
  }

  return {
    state: {
      undoStack: newUndoStack,
      redoStack: [],
      isExecuting: false,
    },
    patch,
  };
}

export function undoCommand(
  state: CommandManagerState,
): { state: CommandManagerState; patch: StatePatch | null } {
  if (state.undoStack.length === 0) {
    return { state, patch: null };
  }

  const command = state.undoStack[state.undoStack.length - 1];
  const patch = command.undo();

  return {
    state: {
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, command],
      isExecuting: false,
    },
    patch,
  };
}

export function redoCommand(
  state: CommandManagerState,
): { state: CommandManagerState; patch: StatePatch | null } {
  if (state.redoStack.length === 0) {
    return { state, patch: null };
  }

  const command = state.redoStack[state.redoStack.length - 1];
  const patch = command.execute();

  return {
    state: {
      undoStack: [...state.undoStack, command],
      redoStack: state.redoStack.slice(0, -1),
      isExecuting: false,
    },
    patch,
  };
}

export function canUndo(state: CommandManagerState): boolean {
  return state.undoStack.length > 0;
}

export function canRedo(state: CommandManagerState): boolean {
  return state.redoStack.length > 0;
}

export function clearHistory(): CommandManagerState {
  return { undoStack: [], redoStack: [], isExecuting: false };
}
