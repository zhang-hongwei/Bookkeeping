/**
 * Poster Card Editor - AddNodeCommand
 */

import { nanoid } from 'nanoid';

import type { PosterNode } from '../../node-tree/types';
import type { Command, StatePatch } from '../types';

export class AddNodeCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'add-node' as const;
  readonly timestamp = Date.now();

  private nodeId: string;

  constructor(
    private nodeData: Omit<PosterNode, 'id'>,
    private parentId: string,
    private index?: number,
    readonly description = 'Add node',
  ) {
    this.nodeId = nanoid(10);
  }

  getId(): string {
    return this.nodeId;
  }

  execute(): StatePatch {
    return (draft) => {
      const node = { ...this.nodeData, id: this.nodeId, parentId: this.parentId } as PosterNode;
      draft[this.nodeId] = node;

      const parent = draft[this.parentId];
      if (parent) {
        if (this.index !== undefined) {
          parent.childrenIds.splice(this.index, 0, this.nodeId);
        } else {
          parent.childrenIds.push(this.nodeId);
        }
      }
    };
  }

  undo(): StatePatch {
    return (draft) => {
      const node = draft[this.nodeId];
      if (!node) return;

      // Remove from parent
      if (node.parentId) {
        const parent = draft[node.parentId];
        if (parent) {
          parent.childrenIds = parent.childrenIds.filter((cid) => cid !== this.nodeId);
        }
      }

      delete draft[this.nodeId];
    };
  }

  serialize() {
    return { type: 'add-node', nodeId: this.nodeId, parentId: this.parentId, index: this.index };
  }
}
