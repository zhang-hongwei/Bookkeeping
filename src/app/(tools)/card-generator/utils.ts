/**
 * Card Export Utilities
 * DOM-to-image export using html-to-image
 */

import { toBlob } from 'html-to-image';

export interface ExportOptions {
  scale?: number;
  backgroundColor?: string;
  pixelRatio?: number;
}

/**
 * Export a DOM element as PNG and trigger download
 */
export async function exportCardAsImage(
  element: HTMLElement,
  filename: string = 'card',
  options: ExportOptions = {}
): Promise<void> {
  const { scale = 2 } = options;

  const blob = await toBlob(element, {
    pixelRatio: scale,
    cacheBust: true,
    style: {
      transform: 'none',
    },
  });

  if (!blob) {
    throw new Error('Failed to generate image');
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export multiple card elements as separate PNGs
 */
export async function exportAllCards(
  elements: Array<{ element: HTMLElement; filename: string }>,
  options: ExportOptions = {}
): Promise<void> {
  for (const { element, filename } of elements) {
    await exportCardAsImage(element, filename, options);
  }
}
