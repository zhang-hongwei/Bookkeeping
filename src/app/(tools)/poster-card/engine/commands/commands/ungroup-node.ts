/**
 * Poster Card Editor - UngroupNodeCommand
 */

import { nanoid } from 'nanoid';

import type { PosterNode, GroupNode, Matrix2D } from '../../node-tree/types';
import type { Command, StatePatch } from '../types';

export class UngroupNodeCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'ungroup-node' as const;
  readonly timestamp = Date.now();

  private savedGroup: GroupNode | null = null;
  private savedChildren: string[] = [];
  private savedParentId: string | null = null;
  private savedIndex: number = -1;

  constructor(
    private groupId: string,
    private currentNodes: Record<string, PosterNode>,
    readonly description = 'Ungroup',
  ) {
    this.captureSnapshot();
  }

  private captureSnapshot(): void {
    const group = this.currentNodes[this.groupId];
    if (!group || group.type !== 'group') return;

    this.savedGroup = { ...group } as GroupNode;
    this.savedChildren = [...group.childrenIds];
    this.savedParentId = group.parentId;

    if (group.parentId) {
      const parent = this.currentNodes[group.parentId];
      if (parent) {
        this.savedIndex = parent.childrenIds.indexOf(this.groupId);
      }
    }
  }

  execute(): StatePatch {
    return (draft) => {
      const group = draft[this.groupId];
      if (!group || group.type !== 'group') return;

      const parentId = group.parentId;

      // Reparent children to group's parent
      for (const childId of group.childrenIds) {
        const child = draft[childId];
        if (!child) continue;
        child.parentId = parentId;
        if (parentId) {
          const parent = draft[parentId];
          if (parent) {
            parent.childrenIds.push(childId);
          }
        }
      }

      // Remove group from parent
      if (parentId) {
        const parent = draft[parentId];
        if (parent) {
          parent.childrenIds = parent.childrenIds.filter((cid) => cid !== this.groupId);
        }
      }

      delete draft[this.groupId];
    };
  }

  undo(): StatePatch {
    return (draft) => {
      if (!this.savedGroup) return;

      // Recreate group node
      const group: GroupNode = {
        ...this.savedGroup,
        childrenIds: [...this.savedChildren],
        localMatrix: [...this.savedGroup.localMatrix] as Matrix2D,
      };

      draft[this.groupId] = group;

      // Restore group to parent at original position
      if (this.savedParentId) {
        const parent = draft[this.savedParentId];
        if (parent) {
          const idx = this.savedIndex >= 0 ? this.savedIndex : parent.childrenIds.length;
          parent.childrenIds.splice(idx, 0, this.groupId);
        }
      }

      // Reparent children back to group
      for (const childId of this.savedChildren) {
        const child = draft[childId];
        if (!child) continue;

        // Remove from parent
        if (child.parentId) {
          const parent = draft[child.parentId];
          if (parent) {
            parent.childrenIds = parent.childrenIds.filter((cid) => cid !== childId);
          }
        }

        child.parentId = this.groupId;
      }
    };
  }

  serialize() {
    return { type: 'ungroup-node', groupId: this.groupId };
  }
}
