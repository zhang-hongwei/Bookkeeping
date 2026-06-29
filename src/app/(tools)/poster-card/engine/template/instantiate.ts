/**
 * Poster Card Editor - Template Instantiation
 *
 * Based on: 10-asset-system.md section "Template Placeholder System"
 * Deep copies template nodes with new IDs, extracts placeholders, marks locked nodes.
 */

import { nanoid } from 'nanoid';
import type { PosterNode } from '../node-tree/types';
import type { TemplateAsset, TemplatePlaceholder } from '../assets/types';

export interface InstantiatedTemplate {
  nodes: Record<string, PosterNode>;
  rootNodeId: string;
  placeholders: TemplatePlaceholder[];
  lockedNodeIds: string[];
  isTemplateMode: boolean;
}

/**
 * Deep copy a template's node tree with fresh IDs.
 * All parent-child references are remapped to the new IDs.
 */
export function instantiateTemplate(
  template: TemplateAsset,
): InstantiatedTemplate {
  const idMap = new Map<string, string>();
  const templateNodes = template.nodes as Record<string, PosterNode>;

  // Phase 1: Generate new IDs for all nodes
  for (const oldId of Object.keys(templateNodes)) {
    idMap.set(oldId, nanoid(10));
  }

  // Phase 2: Deep copy each node with remapped references
  const newNodes: Record<string, PosterNode> = {};
  for (const [oldId, node] of Object.entries(templateNodes)) {
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

  // Phase 3: Remap placeholders to new node IDs
  const placeholders = template.placeholders.map((ph) => ({
    ...ph,
    id: nanoid(8),
    nodeId: idMap.get(ph.nodeId) ?? ph.nodeId,
  }));

  // Phase 4: Remap locked node IDs
  const lockedNodeIds = template.lockedNodeIds
    .map((id) => idMap.get(id))
    .filter((id): id is string => id !== undefined);

  const rootNodeId = idMap.get(template.rootNodeId) ?? '';

  return {
    nodes: newNodes,
    rootNodeId,
    placeholders,
    lockedNodeIds,
    isTemplateMode: lockedNodeIds.length > 0,
  };
}
