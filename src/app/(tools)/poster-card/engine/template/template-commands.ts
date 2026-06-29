/**
 * Poster Card Editor - Template Commands
 *
 * Command for unlocking template constraints, enabling full editing.
 * Uses 'apply-template' as the command type since template-level mutations
 * are structurally similar (they replace large portions of the node tree).
 */

import { nanoid } from 'nanoid';
import type { PosterNode } from '../node-tree/types';
import type { Command, StatePatch } from '../commands/types';

export class UnlockTemplateCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'apply-template' as const;
  readonly description: string;
  readonly timestamp: number;

  private lockedNodeIds: string[];

  constructor(lockedNodeIds: string[]) {
    this.lockedNodeIds = [...lockedNodeIds];
    this.description = `Unlock template (${lockedNodeIds.length} nodes)`;
    this.timestamp = Date.now();
  }

  execute(): StatePatch {
    return (draft: Record<string, PosterNode>) => {
      for (const nodeId of this.lockedNodeIds) {
        const node = draft[nodeId];
        if (node) {
          node.locked = false;
        }
      }
    };
  }

  undo(): StatePatch {
    return (draft: Record<string, PosterNode>) => {
      for (const nodeId of this.lockedNodeIds) {
        const node = draft[nodeId];
        if (node) {
          node.locked = true;
        }
      }
    };
  }

  serialize() {
    return {
      type: 'unlock-template',
      lockedNodeIds: this.lockedNodeIds,
    };
  }
}
