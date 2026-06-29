/**
 * Poster Card Editor - Placeholder Operations
 *
 * Based on: 10-asset-system.md section "Template Editing"
 * Functions to update text and image placeholders within locked templates.
 *
 * These are thin helpers that produce partial-PosterNode update objects.
 * The caller is responsible for applying them through the store's updateNode
 * action or through the UpdateNodeCommand for undo support.
 */

import type { PosterNode } from '../node-tree/types';
import type { TemplatePlaceholder } from '../assets/types';

/**
 * Build updates for a text placeholder.
 * Returns a partial PosterNode patch to apply, or null if invalid.
 */
export function buildTextPlaceholderUpdate(
  placeholder: TemplatePlaceholder,
  newValue: string,
): Partial<PosterNode> | null {
  if (placeholder.type !== 'text') return null;
  return { content: newValue };
}

/**
 * Build updates for an image placeholder.
 * Returns a partial PosterNode patch to apply, or null if invalid.
 */
export function buildImagePlaceholderUpdate(
  placeholder: TemplatePlaceholder,
  newAssetId: string,
  newSrc: string,
): Partial<PosterNode> | null {
  if (placeholder.type !== 'image') return null;
  return { assetId: newAssetId, src: newSrc } as Partial<PosterNode>;
}

/**
 * Apply a text placeholder update directly via the store's updateNode.
 * Use this for quick edits that do not need undo support.
 */
export function applyTextPlaceholder(
  placeholder: TemplatePlaceholder,
  newValue: string,
  updateNode: (id: string, updates: Partial<PosterNode>) => void,
): boolean {
  if (placeholder.type !== 'text') return false;
  updateNode(placeholder.nodeId, { content: newValue } as Partial<PosterNode>);
  return true;
}

/**
 * Apply an image placeholder update directly via the store's updateNode.
 * Use this for quick edits that do not need undo support.
 */
export function applyImagePlaceholder(
  placeholder: TemplatePlaceholder,
  newAssetId: string,
  newSrc: string,
  updateNode: (id: string, updates: Partial<PosterNode>) => void,
): boolean {
  if (placeholder.type !== 'image') return false;
  updateNode(placeholder.nodeId, {
    assetId: newAssetId,
    src: newSrc,
  } as Partial<PosterNode>);
  return true;
}

/**
 * Collect all node IDs that should be unlocked from a locked template.
 * Returns the lockedNodeIds list for use with UnlockTemplateCommand.
 */
export function collectLockedNodeIds(
  placeholders: TemplatePlaceholder[],
  nodes: Record<string, PosterNode>,
): string[] {
  const lockedIds: string[] = [];
  for (const ph of placeholders) {
    const node = nodes[ph.nodeId];
    if (node && node.locked) {
      lockedIds.push(node.id);
    }
  }
  return lockedIds;
}
