/**
 * Poster Card Editor - MoveNodeCommand
 */

import { nanoid } from 'nanoid';

import type { Command, StatePatch } from '../types';

export class MoveNodeCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'move-node' as const;
  readonly timestamp = Date.now();

  constructor(
    private nodeId: string,
    private from: { parentId: string; index: number },
    private to: { parentId: string; index: number },
    readonly description = `Move ${this.nodeId}`,
  ) {}

  execute(): StatePatch {
    return (draft) => {
      const node = draft[this.nodeId];
      if (!node) return;

      // Remove from old parent
      const oldParent = draft[this.from.parentId];
      if (oldParent) {
        oldParent.childrenIds = oldParent.childrenIds.filter((cid) => cid !== this.nodeId);
      }

      // Add to new parent
      const newParent = draft[this.to.parentId];
      if (newParent) {
        newParent.childrenIds.splice(this.to.index, 0, this.nodeId);
      }

      node.parentId = this.to.parentId;
    };
  }

  undo(): StatePatch {
    return (draft) => {
      const node = draft[this.nodeId];
      if (!node) return;

      // Remove from current (to) parent
      const currentParent = draft[this.to.parentId];
      if (currentParent) {
        currentParent.childrenIds = currentParent.childrenIds.filter((cid) => cid !== this.nodeId);
      }

      // Restore to original (from) parent at original index
      const originalParent = draft[this.from.parentId];
      if (originalParent) {
        originalParent.childrenIds.splice(this.from.index, 0, this.nodeId);
      }

      node.parentId = this.from.parentId;
    };
  }

  serialize() {
    return { type: 'move-node', nodeId: this.nodeId, from: this.from, to: this.to };
  }
}
