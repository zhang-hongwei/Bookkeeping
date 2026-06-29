/**
 * Poster Card Editor - ReorderNodeCommand
 */

import { nanoid } from 'nanoid';

import type { Command, StatePatch } from '../types';

export class ReorderNodeCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'reorder-node' as const;
  readonly timestamp = Date.now();

  constructor(
    private parentId: string,
    private oldChildrenIds: string[],
    private newChildrenIds: string[],
    readonly description = 'Reorder children',
  ) {}

  execute(): StatePatch {
    return (draft) => {
      const parent = draft[this.parentId];
      if (parent) {
        parent.childrenIds = [...this.newChildrenIds];
      }
    };
  }

  undo(): StatePatch {
    return (draft) => {
      const parent = draft[this.parentId];
      if (parent) {
        parent.childrenIds = [...this.oldChildrenIds];
      }
    };
  }

  serialize() {
    return { type: 'reorder-node', parentId: this.parentId };
  }
}
