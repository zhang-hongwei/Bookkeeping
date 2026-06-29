/**
 * SVG Serializer — SvgElementData tree → SVG string
 */

import type { SvgElementData } from '../types';
import { escapeXml } from '../utils';

/**
 * Serialize an element tree to an SVG string.
 */
export function serializeToSvgString(root: SvgElementData): string {
  return serializeElement(root);
}

function serializeElement(el: SvgElementData): string {
  const tag = el.tag;

  // Build attribute string
  const attrParts: string[] = [];
  for (const [key, value] of Object.entries(el.attrs)) {
    attrParts.push(`${key}="${escapeXml(value)}"`);
  }
  const attrStr = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';

  // Self-closing for elements without children or text
  if (el.children.length === 0 && !el.textContent) {
    return `<${tag}${attrStr}/>`;
  }

  // Build inner content
  let inner = '';
  if (el.textContent) {
    inner += escapeXml(el.textContent);
  }
  for (const child of el.children) {
    inner += serializeElement(child);
  }

  return `<${tag}${attrStr}>${inner}</${tag}>`;
}

/**
 * Serialize to a pretty-printed SVG string with indentation.
 */
export function serializeToSvgStringPretty(root: SvgElementData, indent = 2): string {
  const lines: string[] = [];
  serializeElementPretty(root, 0, indent, lines);
  return lines.join('\n');
}

function serializeElementPretty(
  el: SvgElementData,
  depth: number,
  indent: number,
  lines: string[],
): void {
  const tag = el.tag;
  const pad = ' '.repeat(depth * indent);

  // Build attribute string
  const attrParts: string[] = [];
  for (const [key, value] of Object.entries(el.attrs)) {
    attrParts.push(`${key}="${escapeXml(value)}"`);
  }
  const attrStr = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';

  // Self-closing
  if (el.children.length === 0 && !el.textContent) {
    lines.push(`${pad}<${tag}${attrStr}/>`);
    return;
  }

  // Only text content, no children
  if (el.textContent && el.children.length === 0) {
    lines.push(`${pad}<${tag}${attrStr}>${escapeXml(el.textContent)}</${tag}>`);
    return;
  }

  // Opening tag
  lines.push(`${pad}<${tag}${attrStr}>`);

  if (el.textContent) {
    lines.push(`${pad}${' '.repeat(indent)}${escapeXml(el.textContent)}`);
  }

  for (const child of el.children) {
    serializeElementPretty(child, depth + 1, indent, lines);
  }

  // Closing tag
  lines.push(`${pad}</${tag}>`);
}
