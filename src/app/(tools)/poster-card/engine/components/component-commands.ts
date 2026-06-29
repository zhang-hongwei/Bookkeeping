/**
 * Component Commands - Save as Component, Instantiate Component.
 */

import { nanoid } from 'nanoid';
import type { PosterNode } from '../node-tree/types';
import type { Command, StatePatch } from '../commands/types';
import type { ComponentAsset } from './component-types';

/**
 * Deep copy a set of nodes with fresh IDs.
 * Reuses the same pattern as template instantiation.
 */
function deepCopyNodes(
  sourceNodes: Record<string, PosterNode>,
  rootId: string,
): { nodes: Record<string, PosterNode>; idMap: Map<string, string> } {
  const idMap = new Map<string, string>();

  // Phase 1: Generate new IDs
  for (const oldId of Object.keys(sourceNodes)) {
    idMap.set(oldId, nanoid(10));
  }

  // Phase 2: Deep copy with remapped references
  const newNodes: Record<string, PosterNode> = {};
  for (const [oldId, node] of Object.entries(sourceNodes)) {
    const newId = idMap.get(oldId)!;
    newNodes[newId] = {
      ...node,
      id: newId,
      parentId: node.parentId ? (idMap.get(node.parentId) ?? null) : null,
      childrenIds: node.childrenIds
        .map((cid) => idMap.get(cid))
        .filter((id): id is string => id !== undefined),
    } as PosterNode;
  }

  return { nodes: newNodes, idMap };
}

/**
 * Instantiate a component: deep copies nodes and inserts them into the current tree.
 */
export class InstantiateComponentCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'apply-template' as const;
  readonly description: string;
  readonly timestamp: number;

  private instantiatedNodes: Record<string, PosterNode>;
  private componentRootId: string;

  constructor(
    private component: ComponentAsset,
    private targetParentId: string,
    desc = `Instantiate component: ${component.name}`,
  ) {
    this.description = desc;
    this.timestamp = Date.now();

    // Deep copy component nodes
    const { nodes, idMap } = deepCopyNodes(component.nodes, component.rootNodeId);
    this.instantiatedNodes = nodes;
    this.componentRootId = idMap.get(component.rootNodeId) ?? '';
  }

  execute(): StatePatch {
    return (draft) => {
      // Add all instantiated nodes
      for (const [id, node] of Object.entries(this.instantiatedNodes)) {
        draft[id] = { ...node } as PosterNode;
      }

      // Add component root to target parent's children
      const parent = draft[this.targetParentId];
      if (parent && this.componentRootId) {
        parent.childrenIds.push(this.componentRootId);
      }
    };
  }

  undo(): StatePatch {
    return (draft) => {
      // Remove all instantiated nodes
      for (const id of Object.keys(this.instantiatedNodes)) {
        delete draft[id];
      }

      // Remove from parent
      const parent = draft[this.targetParentId];
      if (parent && this.componentRootId) {
        parent.childrenIds = parent.childrenIds.filter((cid) => cid !== this.componentRootId);
      }
    };
  }

  serialize() {
    return { type: 'instantiate-component', componentId: this.component.id };
  }
}

/**
 * Create a ComponentAsset from selected nodes.
 * This is NOT a Command - it's a utility function that creates the asset.
 * The caller decides how to store it (component store, etc.).
 */
export function createComponentFromNodes(
  name: string,
  nodeIds: string[],
  currentNodes: Record<string, PosterNode>,
  tags: string[] = [],
): ComponentAsset | null {
  if (nodeIds.length === 0) return null;

  // Collect all nodes and their subtrees
  const collected: Record<string, PosterNode> = {};
  const collectSubtree = (id: string) => {
    const node = currentNodes[id];
    if (!node) return;
    collected[id] = node;
    for (const childId of node.childrenIds) {
      collectSubtree(childId);
    }
  };

  for (const id of nodeIds) {
    collectSubtree(id);
  }

  // If single node, it becomes the root
  // If multiple nodes, create a virtual group root
  const now = Date.now();

  if (nodeIds.length === 1) {
    return {
      id: `comp-${nanoid(10)}`,
      name,
      nodes: collected,
      rootNodeId: nodeIds[0],
      tags,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Multiple nodes: create a group wrapper
  const groupRootId = nanoid(10);
  const groupNode = {
    id: groupRootId,
    type: 'group' as const,
    parentId: null,
    childrenIds: [...nodeIds],
    localMatrix: [1, 0, 0, 1, 0, 0] as [number, number, number, number, number, number],
    width: 0,
    height: 0,
    opacity: 100,
    visible: true,
    locked: false,
    name,
  };

  // Reparent collected top-level nodes to the group
  const newCollected: Record<string, PosterNode> = { [groupRootId]: groupNode as PosterNode };
  for (const [id, node] of Object.entries(collected)) {
    if (nodeIds.includes(id)) {
      newCollected[id] = { ...node, parentId: groupRootId } as PosterNode;
    } else {
      newCollected[id] = node;
    }
  }

  return {
    id: `comp-${nanoid(10)}`,
    name,
    nodes: newCollected,
    rootNodeId: groupRootId,
    tags,
    createdAt: now,
    updatedAt: now,
  };
}
