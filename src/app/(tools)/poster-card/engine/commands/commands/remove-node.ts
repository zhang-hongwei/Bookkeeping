/**
 * Poster Card Editor - RemoveNodeCommand
 *
 * Saves subtree snapshot for undo restoration.
 */

import { nanoid } from 'nanoid';

import type { PosterNode } from '../../node-tree/types';
import type { Command, StatePatch } from '../types';

export class RemoveNodeCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'remove-node' as const;
  readonly timestamp = Date.now();

  /** Snapshot of the removed subtree (node + all descendants). */
  private savedSubtree: Record<string, PosterNode> = {};
  /** Original parent ID for restoration. */
  private savedParentId: string | null = null;
  /** Original index in parent's childrenIds. */
  private savedIndex: number = -1;

  constructor(
    private nodeId: string,
    private currentNodes: Record<string, PosterNode>,
    readonly description = `Remove ${nodeId}`,
  ) {
    // Capture snapshot at construction time
    this.captureSnapshot();
  }

  private captureSnapshot(): void {
    const node = this.currentNodes[this.nodeId];
    if (!node) return;

    this.savedParentId = node.parentId;
    this.savedSubtree = {};

    // Collect node and all descendants
    const collect = (id: string) => {
      const n = this.currentNodes[id];
      if (!n) return;
      this.savedSubtree[id] = { ...n } as PosterNode;
      for (const childId of n.childrenIds) {
        collect(childId);
      }
    };
    collect(this.nodeId);

    // Record original index in parent
    if (this.savedParentId) {
      const parent = this.currentNodes[this.savedParentId];
      if (parent) {
        this.savedIndex = parent.childrenIds.indexOf(this.nodeId);
      }
    }
  }

  execute(): StatePatch {
    return (draft) => {
      const node = draft[this.nodeId];
      if (!node) return;

      // Collect all IDs to remove
      const toRemove = new Set<string>();
      const collect = (id: string) => {
        toRemove.add(id);
        const n = draft[id];
        if (n) {
          for (const childId of n.childrenIds) {
            collect(childId);
          }
        }
      };
      collect(this.nodeId);

      // Remove from parent
      if (node.parentId) {
        const parent = draft[node.parentId];
        if (parent) {
          parent.childrenIds = parent.childrenIds.filter((cid) => cid !== this.nodeId);
        }
      }

      // Delete all
      for (const id of toRemove) {
        delete draft[id];
      }
    };
  }

  undo(): StatePatch {
    return (draft) => {
      // Restore all saved nodes
      for (const [id, node] of Object.entries(this.savedSubtree)) {
        draft[id] = { ...node } as PosterNode;
      }

      // Restore in parent's childrenIds at original position
      if (this.savedParentId) {
        const parent = draft[this.savedParentId];
        if (parent) {
          const idx = this.savedIndex >= 0 ? this.savedIndex : parent.childrenIds.length;
          parent.childrenIds.splice(idx, 0, this.nodeId);
        }
      }
    };
  }

  serialize() {
    return {
      type: 'remove-node',
      nodeId: this.nodeId,
      subtreeSize: Object.keys(this.savedSubtree).length,
    };
  }
}
