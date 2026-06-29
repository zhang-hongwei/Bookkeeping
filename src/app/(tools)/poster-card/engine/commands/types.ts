/**
 * Poster Card Editor - Command System Types
 *
 * Based on: 02-command-system.md, 09-architecture-upgrades.md (修正3)
 * Patch-based commands: execute() and undo() return StatePatch functions
 * instead of directly calling the store.
 */

import type { PosterNode } from '../node-tree/types';

/**
 * A patch is a function that mutates an immer draft of the nodes map.
 * This is the only way commands modify state.
 */
export type StatePatch = (draft: Record<string, PosterNode>) => void;

export type CommandType =
  | 'add-node'
  | 'remove-node'
  | 'move-node'
  | 'update-node'
  | 'reorder-node'
  | 'group-nodes'
  | 'ungroup-node'
  | 'change-background'
  | 'apply-template';

export interface Command {
  readonly id: string;
  readonly type: CommandType | 'composite';
  readonly description: string;
  readonly timestamp: number;

  /** Returns a patch function to apply this command. Does NOT directly modify store. */
  execute(): StatePatch;

  /** Returns a patch function to reverse this command. */
  undo(): StatePatch;

  /** Optional: serialize for AI replay / macro operations. */
  serialize?(): unknown;

  /** Optional: merge consecutive commands (e.g. drag debounce). */
  merge?(other: Command): Command | null;
}
