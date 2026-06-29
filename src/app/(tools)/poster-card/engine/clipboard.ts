/**
 * Poster Card Editor - Clipboard operations (copy/paste/duplicate)
 */

import { nanoid } from 'nanoid';
import type { PosterNode, Matrix2D } from './node-tree/types';
import type { Command } from './commands/types';
import { Transaction } from './commands/transaction';
import { AddNodeCommand } from './commands/commands/add-node';

export interface ClipboardEntry {
  nodes: PosterNode[];
  timestamp: number;
}

const CLIPBOARD_OFFSET = 20;

let clipboard: ClipboardEntry | null = null;

export function getClipboard(): ClipboardEntry | null {
  return clipboard;
}

/**
 * Copy selected nodes to clipboard. Includes subtree children.
 */
export function copyNodes(
  selectedIds: Set<string>,
  nodes: Record<string, PosterNode>,
): void {
  const copied: PosterNode[] = [];
  const visited = new Set<string>();

  for (const id of selectedIds) {
    collectSubtree(nodes, id, visited, copied);
  }

  clipboard = { nodes: copied, timestamp: Date.now() };
}

/**
 * Paste clipboard contents as new nodes. Returns a Command for undo.
 */
export function pasteNodes(
  rootNodeId: string,
  currentNodes: Record<string, PosterNode>,
  offset: number = CLIPBOARD_OFFSET,
): Command | null {
  if (!clipboard || clipboard.nodes.length === 0) return null;

  // Build ID mapping: old ID → new ID
  const idMap = new Map<string, string>();
  for (const node of clipboard.nodes) {
    idMap.set(node.id, nanoid(10));
  }

  const tx = new Transaction();
  const newSelectedIds: string[] = [];

  for (const node of clipboard.nodes) {
    const newId = idMap.get(node.id)!;

    // Determine parent: if original parent is in clipboard, map it; otherwise attach to root
    let parentId = rootNodeId;
    if (node.parentId && idMap.has(node.parentId)) {
      parentId = idMap.get(node.parentId)!;
    }

    // Offset position for top-level pasted nodes (those whose parent wasn't in clipboard)
    let localMatrix: Matrix2D = [...node.localMatrix];
    if (!idMap.has(node.parentId ?? '')) {
      localMatrix = [
        localMatrix[0], localMatrix[1], localMatrix[2], localMatrix[3],
        localMatrix[4] + offset,
        localMatrix[5] + offset,
      ];
    }

    const newNodeData: Omit<PosterNode, 'id'> = {
      ...node,
      parentId,
      localMatrix,
      childrenIds: node.childrenIds
        .map((cid) => idMap.get(cid))
        .filter(Boolean) as string[],
    };

    tx.add(new AddNodeCommand(newNodeData, parentId, undefined, `Paste ${node.type}`));

    // Track top-level nodes for selection
    if (!idMap.has(node.parentId ?? '')) {
      newSelectedIds.push(newId);
    }
  }

  return tx.commit(`Paste ${clipboard.nodes.length} node(s)`);
}

/**
 * Duplicate selected nodes in place. Returns a Command for undo.
 */
export function duplicateNodes(
  selectedIds: Set<string>,
  rootNodeId: string,
  currentNodes: Record<string, PosterNode>,
): Command | null {
  copyNodes(selectedIds, currentNodes);
  return pasteNodes(rootNodeId, currentNodes);
}

function collectSubtree(
  nodes: Record<string, PosterNode>,
  id: string,
  visited: Set<string>,
  result: PosterNode[],
): void {
  if (visited.has(id)) return;
  visited.add(id);

  const node = nodes[id];
  if (!node) return;

  result.push({ ...node });
  for (const childId of node.childrenIds) {
    collectSubtree(nodes, childId, visited, result);
  }
}
