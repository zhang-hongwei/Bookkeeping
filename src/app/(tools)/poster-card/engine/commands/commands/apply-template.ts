/**
 * Poster Card Editor - ApplyTemplateCommand
 *
 * Heavy command: stores full tree snapshots.
 */

import { nanoid } from 'nanoid';

import type { PosterNode } from '../../node-tree/types';
import type { Command, StatePatch } from '../types';

export class ApplyTemplateCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'apply-template' as const;
  readonly timestamp = Date.now();

  constructor(
    private previousNodes: Record<string, PosterNode>,
    private previousRootId: string | null,
    private newNodes: Record<string, PosterNode>,
    private newRootId: string,
    readonly description = 'Apply template',
  ) {}

  execute(): StatePatch {
    return (draft) => {
      // Clear and replace with new nodes
      for (const key of Object.keys(draft)) {
        delete draft[key];
      }
      for (const [key, node] of Object.entries(this.newNodes)) {
        draft[key] = { ...node } as PosterNode;
      }
    };
  }

  undo(): StatePatch {
    return (draft) => {
      // Clear and restore previous nodes
      for (const key of Object.keys(draft)) {
        delete draft[key];
      }
      for (const [key, node] of Object.entries(this.previousNodes)) {
        draft[key] = { ...node } as PosterNode;
      }
    };
  }

  /** Returns the new root ID for the store to update rootNodeId. */
  getNewRootId(): string {
    return this.newRootId;
  }

  getPreviousRootId(): string | null {
    return this.previousRootId;
  }

  serialize() {
    return { type: 'apply-template', newRootId: this.newRootId };
  }
}
