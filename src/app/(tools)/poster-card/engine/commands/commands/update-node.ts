/**
 * Poster Card Editor - UpdateNodeCommand
 *
 * The most frequently used command. Supports merge for drag debounce.
 */

import { nanoid } from 'nanoid';

import type { PosterNode } from '../../node-tree/types';
import type { Command, StatePatch } from '../types';

export class UpdateNodeCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'update-node' as const;
  readonly timestamp = Date.now();

  constructor(
    private nodeId: string,
    private oldFields: Partial<PosterNode>,
    private newFields: Partial<PosterNode>,
    readonly description = `Update ${nodeId}`,
  ) {}

  execute(): StatePatch {
    return (draft) => {
      const node = draft[this.nodeId];
      if (!node) return;
      // Remove forbidden fields
      const safe = { ...this.newFields };
      delete (safe as Record<string, unknown>).id;
      delete (safe as Record<string, unknown>).parentId;
      delete (safe as Record<string, unknown>).childrenIds;
      Object.assign(node, safe);
    };
  }

  undo(): StatePatch {
    return (draft) => {
      const node = draft[this.nodeId];
      if (!node) return;
      const safe = { ...this.oldFields };
      delete (safe as Record<string, unknown>).id;
      delete (safe as Record<string, unknown>).parentId;
      delete (safe as Record<string, unknown>).childrenIds;
      Object.assign(node, safe);
    };
  }

  serialize() {
    return {
      type: 'update-node',
      nodeId: this.nodeId,
      oldFields: this.oldFields,
      newFields: this.newFields,
    };
  }

  merge(other: Command): Command | null {
    if (!(other instanceof UpdateNodeCommand)) return null;
    if (other.nodeId !== this.nodeId) return null;
    // Merge: keep earliest oldFields, use latest newFields
    return new UpdateNodeCommand(
      this.nodeId,
      this.oldFields,
      other.newFields,
      this.description,
    );
  }
}
