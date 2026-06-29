/**
 * Poster Card Editor - Selection Operations
 *
 * Based on: 03-selection-engine.md section 4
 * Returns StatePatch functions for batch operations on selected nodes.
 */

import { nanoid } from 'nanoid';
import { produce } from 'immer';

import type { PosterNode, GroupNode, Matrix2D } from '../node-tree/types';
import type { StatePatch, Command } from '../commands/types';
import type { Alignment, SelectionBox } from './types';
import { Transaction } from '../commands/transaction';
import { UpdateNodeCommand } from '../commands/commands/update-node';
import { RemoveNodeCommand } from '../commands/commands/remove-node';
import { createMatrix, decomposeMatrix } from '../matrix-utils';

/**
 * Move all selected nodes by a delta.
 */
export function moveSelected(
  selectedIds: Set<string>,
  dx: number,
  dy: number,
): StatePatch {
  return (draft) => {
    for (const id of selectedIds) {
      const node = draft[id];
      if (!node || node.locked) continue;

      // Decompose current matrix, adjust x/y, recompose
      const { scaleX, scaleY, rotation } = decomposeMatrix(node.localMatrix);
      const { x: curX, y: curY } = decomposeMatrix(node.localMatrix);
      const newX = curX + dx;
      const newY = curY + dy;

      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      node.localMatrix = [
        cos * scaleX, sin * scaleX,
        -sin * scaleY, cos * scaleY,
        newX, newY,
      ] as Matrix2D;
    }
  };
}

/**
 * Delete all selected nodes.
 */
export function deleteSelected(
  selectedIds: Set<string>,
): StatePatch {
  return (draft) => {
    for (const id of selectedIds) {
      const node = draft[id];
      if (!node) continue;

      // Collect subtree
      const toRemove = new Set<string>();
      const collect = (nodeId: string) => {
        toRemove.add(nodeId);
        const n = draft[nodeId];
        if (n) {
          for (const childId of n.childrenIds) {
            collect(childId);
          }
        }
      };
      collect(id);

      // Remove from parent
      if (node.parentId) {
        const parent = draft[node.parentId];
        if (parent) {
          parent.childrenIds = parent.childrenIds.filter((cid) => cid !== id);
        }
      }

      for (const nodeId of toRemove) {
        delete draft[nodeId];
      }
    }
  };
}

/**
 * Align selected nodes based on alignment type.
 */
export function alignSelected(
  nodes: Record<string, PosterNode>,
  selectedIds: Set<string>,
  alignment: Alignment,
  getWorldBoundsFn: (id: string) => { minX: number; minY: number; maxX: number; maxY: number },
): StatePatch {
  return (draft) => {
    const ids = [...selectedIds];
    if (ids.length < 2) return;

    const bounds = ids.map((id) => ({
      id,
      bounds: getWorldBoundsFn(id),
      node: draft[id],
    })).filter((b) => b.node);

    if (bounds.length < 2) return;

    switch (alignment) {
      case 'left': {
        const minX = Math.min(...bounds.map((b) => b.bounds.minX));
        for (const b of bounds) {
          const dx = minX - b.bounds.minX;
          const { x, y, rotation, scaleX, scaleY } = decomposeMatrix(b.node.localMatrix);
          const rad = (rotation * Math.PI) / 180;
          b.node.localMatrix = [
            Math.cos(rad) * scaleX, Math.sin(rad) * scaleX,
            -Math.sin(rad) * scaleY, Math.cos(rad) * scaleY,
            x + dx, y,
          ] as Matrix2D;
        }
        break;
      }
      case 'right': {
        const maxRight = Math.max(...bounds.map((b) => b.bounds.maxX));
        for (const b of bounds) {
          const dx = maxRight - b.bounds.maxX;
          const { x, y, rotation, scaleX, scaleY } = decomposeMatrix(b.node.localMatrix);
          const rad = (rotation * Math.PI) / 180;
          b.node.localMatrix = [
            Math.cos(rad) * scaleX, Math.sin(rad) * scaleX,
            -Math.sin(rad) * scaleY, Math.cos(rad) * scaleY,
            x + dx, y,
          ] as Matrix2D;
        }
        break;
      }
      case 'center-h': {
        const minLeft = Math.min(...bounds.map((b) => b.bounds.minX));
        const maxRight = Math.max(...bounds.map((b) => b.bounds.maxX));
        const center = (minLeft + maxRight) / 2;
        for (const b of bounds) {
          const currentCenter = (b.bounds.minX + b.bounds.maxX) / 2;
          const dx = center - currentCenter;
          const { x, y, rotation, scaleX, scaleY } = decomposeMatrix(b.node.localMatrix);
          const rad = (rotation * Math.PI) / 180;
          b.node.localMatrix = [
            Math.cos(rad) * scaleX, Math.sin(rad) * scaleX,
            -Math.sin(rad) * scaleY, Math.cos(rad) * scaleY,
            x + dx, y,
          ] as Matrix2D;
        }
        break;
      }
      case 'top': {
        const minY = Math.min(...bounds.map((b) => b.bounds.minY));
        for (const b of bounds) {
          const dy = minY - b.bounds.minY;
          const { x, y, rotation, scaleX, scaleY } = decomposeMatrix(b.node.localMatrix);
          const rad = (rotation * Math.PI) / 180;
          b.node.localMatrix = [
            Math.cos(rad) * scaleX, Math.sin(rad) * scaleX,
            -Math.sin(rad) * scaleY, Math.cos(rad) * scaleY,
            x, y + dy,
          ] as Matrix2D;
        }
        break;
      }
      case 'bottom': {
        const maxBottom = Math.max(...bounds.map((b) => b.bounds.maxY));
        for (const b of bounds) {
          const dy = maxBottom - b.bounds.maxY;
          const { x, y, rotation, scaleX, scaleY } = decomposeMatrix(b.node.localMatrix);
          const rad = (rotation * Math.PI) / 180;
          b.node.localMatrix = [
            Math.cos(rad) * scaleX, Math.sin(rad) * scaleX,
            -Math.sin(rad) * scaleY, Math.cos(rad) * scaleY,
            x, y + dy,
          ] as Matrix2D;
        }
        break;
      }
      case 'center-v': {
        const minTop = Math.min(...bounds.map((b) => b.bounds.minY));
        const maxBottom = Math.max(...bounds.map((b) => b.bounds.maxY));
        const center = (minTop + maxBottom) / 2;
        for (const b of bounds) {
          const currentCenter = (b.bounds.minY + b.bounds.maxY) / 2;
          const dy = center - currentCenter;
          const { x, y, rotation, scaleX, scaleY } = decomposeMatrix(b.node.localMatrix);
          const rad = (rotation * Math.PI) / 180;
          b.node.localMatrix = [
            Math.cos(rad) * scaleX, Math.sin(rad) * scaleX,
            -Math.sin(rad) * scaleY, Math.cos(rad) * scaleY,
            x, y + dy,
          ] as Matrix2D;
        }
        break;
      }
      case 'distribute-h':
      case 'distribute-v': {
        distributeNodes(bounds, alignment === 'distribute-h' ? 'h' : 'v');
        break;
      }
    }
  };
}

function distributeNodes(
  bounds: Array<{ id: string; bounds: { minX: number; minY: number; maxX: number; maxY: number }; node: PosterNode }>,
  direction: 'h' | 'v',
): void {
  if (bounds.length < 3) return;

  const sorted = direction === 'h'
    ? [...bounds].sort((a, b) => a.bounds.minX - b.bounds.minX)
    : [...bounds].sort((a, b) => a.bounds.minY - b.bounds.minY);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (direction === 'h') {
    const totalSpan = last.bounds.maxX - first.bounds.minX;
    const totalWidths = sorted.reduce((sum, b) => sum + (b.bounds.maxX - b.bounds.minX), 0);
    const gap = (totalSpan - totalWidths) / (sorted.length - 1);

    let currentX = first.bounds.minX;
    for (const b of sorted) {
      const w = b.bounds.maxX - b.bounds.minX;
      const dx = currentX - b.bounds.minX;
      const { x, y, rotation, scaleX, scaleY } = decomposeMatrix(b.node.localMatrix);
      const rad = (rotation * Math.PI) / 180;
      b.node.localMatrix = [
        Math.cos(rad) * scaleX, Math.sin(rad) * scaleX,
        -Math.sin(rad) * scaleY, Math.cos(rad) * scaleY,
        x + dx, y,
      ] as Matrix2D;
      currentX += w + gap;
    }
  } else {
    const totalSpan = last.bounds.maxY - first.bounds.minY;
    const totalHeights = sorted.reduce((sum, b) => sum + (b.bounds.maxY - b.bounds.minY), 0);
    const gap = (totalSpan - totalHeights) / (sorted.length - 1);

    let currentY = first.bounds.minY;
    for (const b of sorted) {
      const h = b.bounds.maxY - b.bounds.minY;
      const dy = currentY - b.bounds.minY;
      const { x, y, rotation, scaleX, scaleY } = decomposeMatrix(b.node.localMatrix);
      const rad = (rotation * Math.PI) / 180;
      b.node.localMatrix = [
        Math.cos(rad) * scaleX, Math.sin(rad) * scaleX,
        -Math.sin(rad) * scaleY, Math.cos(rad) * scaleY,
        x, y + dy,
      ] as Matrix2D;
      currentY += h + gap;
    }
  }
}

// ── Transaction-based wrappers (undoable batch operations) ──

/**
 * Move all selected nodes by a delta, wrapped in a Transaction for single undo step.
 */
export function moveSelectedWithTransaction(
  selectedIds: Set<string>,
  dx: number,
  dy: number,
  currentNodes: Record<string, PosterNode>,
): Command {
  const tx = new Transaction();
  for (const id of selectedIds) {
    const node = currentNodes[id];
    if (!node || node.locked) continue;
    const { x, y, rotation, scaleX, scaleY } = decomposeMatrix(node.localMatrix);
    const oldMatrix = node.localMatrix;
    const newMatrix = createMatrix({ x: x + dx, y: y + dy, rotation, scaleX, scaleY });
    tx.add(new UpdateNodeCommand(id, { localMatrix: oldMatrix }, { localMatrix: newMatrix }, `Move ${id}`));
  }
  return tx.commit(`Move ${selectedIds.size} node(s)`);
}

/**
 * Delete all selected nodes, wrapped in a Transaction for single undo step.
 */
export function deleteSelectedWithTransaction(
  selectedIds: Set<string>,
  currentNodes: Record<string, PosterNode>,
): Command {
  const tx = new Transaction();
  for (const id of selectedIds) {
    tx.add(new RemoveNodeCommand(id, currentNodes, `Delete ${id}`));
  }
  return tx.commit(`Delete ${selectedIds.size} node(s)`);
}

/**
 * Align or distribute selected nodes, wrapped in a Transaction for single undo step.
 */
export function alignSelectedWithTransaction(
  nodes: Record<string, PosterNode>,
  selectedIds: Set<string>,
  alignment: Alignment,
  getWorldBoundsFn: (id: string) => { minX: number; minY: number; maxX: number; maxY: number },
): Command {
  const ids = [...selectedIds];
  if (ids.length < 2) {
    const emptyTx = new Transaction();
    return emptyTx.commit('No-op alignment');
  }

  const oldMatrices: Record<string, Matrix2D> = {};
  for (const id of ids) {
    if (nodes[id]) oldMatrices[id] = nodes[id].localMatrix;
  }

  const patch = alignSelected(nodes, selectedIds, alignment, getWorldBoundsFn);
  const newNodes = produce(nodes, patch);

  const tx = new Transaction();
  for (const id of ids) {
    const oldMatrix = oldMatrices[id];
    const newMatrix = newNodes[id]?.localMatrix;
    if (oldMatrix && newMatrix) {
      tx.add(new UpdateNodeCommand(id, { localMatrix: oldMatrix }, { localMatrix: newMatrix }, `Align ${id}`));
    }
  }
  return tx.commit(`Align ${selectedIds.size} node(s) (${alignment})`);
}
