/**
 * Roast Card Export Utilities
 * DOM-to-image export using html-to-image
 */

import { toBlob } from 'html-to-image';

import { PERSONA_LABELS } from './types';
import type { RoastPersona } from './types';

export interface ExportOptions {
  scale?: number;
}

/**
 * Export a DOM element as PNG and trigger download
 */
export async function exportCardAsImage(
  element: HTMLElement,
  filename: string = 'roast-card',
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
 * Generate export filename for a roast persona
 */
export function getRoastExportFilename(persona: RoastPersona): string {
  const label = PERSONA_LABELS[persona] || persona;
  return `roast-${label}`;
}
