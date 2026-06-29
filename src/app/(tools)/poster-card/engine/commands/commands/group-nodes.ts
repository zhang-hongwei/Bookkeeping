/**
 * Poster Card Editor - GroupNodesCommand
 */

import { nanoid } from 'nanoid';

import type { PosterNode, GroupNode, Matrix2D } from '../../node-tree/types';
import type { Command, StatePatch } from '../types';

export class GroupNodesCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'group-nodes' as const;
  readonly timestamp = Date.now();

  private groupId: string;
  private savedPositions: Map<string, { parentId: string; index: number }>;

  constructor(
    private childIds: string[],
    private currentNodes: Record<string, PosterNode>,
    readonly description = 'Group nodes',
  ) {
    this.groupId = nanoid(10);
    this.savedPositions = new Map();

    // Save original positions at construction time
    for (const id of childIds) {
      const node = currentNodes[id];
      if (!node || !node.parentId) continue;
      const parent = currentNodes[node.parentId];
      if (parent) {
        this.savedPositions.set(id, {
          parentId: node.parentId,
          index: parent.childrenIds.indexOf(id),
        });
      }
    }
  }

  getGroupId(): string {
    return this.groupId;
  }

  execute(): StatePatch {
    return (draft) => {
      // Create group node
      const group: GroupNode = {
        id: this.groupId,
        type: 'group',
        parentId: null,
        childrenIds: [...this.childIds],
        localMatrix: [1, 0, 0, 1, 0, 0] as Matrix2D,
        width: 0,
        height: 0,
        opacity: 100,
        visible: true,
        locked: false,
      };

      // Determine the common parent and insertion index
      const firstPos = this.savedPositions.values().next().value;
      if (firstPos) {
        group.parentId = firstPos.parentId;
        const parent = draft[firstPos.parentId];
        if (parent) {
          // Insert group at the position of the first child
          parent.childrenIds.splice(firstPos.index, 0, this.groupId);
        }
      }

      draft[this.groupId] = group;

      // Reparent children to group
      for (const childId of this.childIds) {
        const child = draft[childId];
        if (!child) continue;

        // Remove from old parent
        if (child.parentId) {
          const oldParent = draft[child.parentId];
          if (oldParent) {
            oldParent.childrenIds = oldParent.childrenIds.filter((cid) => cid !== childId);
          }
        }

        child.parentId = this.groupId;
      }
    };
  }

  undo(): StatePatch {
    return (draft) => {
      const group = draft[this.groupId];
      if (!group) return;

      // Reparent children back to original parents
      for (const childId of this.childIds) {
        const child = draft[childId];
        const savedPos = this.savedPositions.get(childId);
        if (!child || !savedPos) continue;

        child.parentId = savedPos.parentId;
        const parent = draft[savedPos.parentId];
        if (parent) {
          parent.childrenIds.splice(savedPos.index, 0, childId);
        }
      }

      // Remove group from parent and delete
      if (group.parentId) {
        const parent = draft[group.parentId];
        if (parent) {
          parent.childrenIds = parent.childrenIds.filter((cid) => cid !== this.groupId);
        }
      }

      delete draft[this.groupId];
    };
  }

  serialize() {
    return { type: 'group-nodes', groupId: this.groupId, childIds: this.childIds };
  }
}
