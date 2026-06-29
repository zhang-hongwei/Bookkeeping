/**
 * SVG Parser — SVG string → SvgElementData tree
 * Uses the browser's native DOMParser for robust parsing.
 */

import type { SvgElementData, SvgTag } from '../types';
import { generateId } from '../utils';

/**
 * Parse an SVG string into a structured element tree.
 */
export function parseSvgString(svgString: string): SvgElementData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid SVG: ' + (parseError.textContent?.slice(0, 200) ?? 'Parse error'));
  }

  const svgEl = doc.documentElement;
  return domNodeToData(svgEl, null);
}

function domNodeToData(node: Element, parentId: string | null): SvgElementData {
  const id = generateId();
  const attrs: Record<string, string> = {};

  for (const attr of Array.from(node.attributes)) {
    // Skip xmlns declarations
    if (attr.name.startsWith('xmlns')) continue;
    attrs[attr.name] = attr.value;
  }

  const children: SvgElementData[] = [];
  let textContent: string | undefined;

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      children.push(domNodeToData(child as Element, id));
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      textContent = (textContent ?? '') + child.textContent;
    }
  }

  return {
    id,
    tag: node.tagName.toLowerCase() as SvgTag,
    attrs,
    children,
    textContent: textContent?.trim() || undefined,
    parentId,
  };
}

/**
 * Create an empty SVG document.
 */
export function createEmptyDocument(width: number, height: number): SvgElementData {
  return {
    id: generateId(),
    tag: 'svg',
    attrs: {
      viewBox: `0 0 ${width} ${height}`,
      width: String(width),
      height: String(height),
      xmlns: 'http://www.w3.org/2000/svg',
    },
    children: [],
    parentId: null,
  };
}

/**
 * Find an element by ID in the tree.
 */
export function findElementById(root: SvgElementData, id: string): SvgElementData | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findElementById(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * Find parent element of a given element ID.
 */
export function findParentElement(root: SvgElementData, childId: string): SvgElementData | null {
  for (const child of root.children) {
    if (child.id === childId) return root;
    const found = findParentElement(child, childId);
    if (found) return found;
  }
  return null;
}

/**
 * Get all elements flattened (depth-first).
 */
export function flattenElements(root: SvgElementData): SvgElementData[] {
  const result: SvgElementData[] = [];
  function traverse(el: SvgElementData) {
    result.push(el);
    for (const child of el.children) {
      traverse(child);
    }
  }
  traverse(root);
  return result;
}

/**
 * Get all non-container elements (leaf elements) in render order.
 */
export function getLeafElements(root: SvgElementData): SvgElementData[] {
  const containerTags = new Set(['svg', 'g', 'defs', 'clipPath', 'mask', 'symbol']);
  const result: SvgElementData[] = [];

  function traverse(el: SvgElementData) {
    if (containerTags.has(el.tag)) {
      for (const child of el.children) {
        traverse(child);
      }
    } else {
      result.push(el);
    }
  }

  traverse(root);
  return result;
}

/**
 * Remove an element from the tree by ID.
 */
export function removeElementById(root: SvgElementData, id: string): boolean {
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].id === id) {
      root.children.splice(i, 1);
      return true;
    }
    if (removeElementById(root.children[i], id)) {
      return true;
    }
  }
  return false;
}

/**
 * Update parentId references throughout the tree.
 */
export function updateParentRefs(root: SvgElementData): void {
  for (const child of root.children) {
    child.parentId = root.id;
    updateParentRefs(child);
  }
}
