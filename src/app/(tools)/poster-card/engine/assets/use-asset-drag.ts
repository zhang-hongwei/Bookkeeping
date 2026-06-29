'use client';

import { useCallback } from 'react';

export interface AssetDragData {
  assetType: string;
  [key: string]: unknown;
}

const MIME_TYPE = 'application/poster-asset';

/**
 * Reusable hook for asset drag-and-drop from panels to canvas.
 * Standardizes MIME type and data transfer across all asset panels.
 */
export function useAssetDrag() {
  const onDragStart = useCallback(
    (e: React.DragEvent, data: AssetDragData) => {
      e.dataTransfer.setData(MIME_TYPE, JSON.stringify(data));
      e.dataTransfer.effectAllowed = 'copy';
    },
    [],
  );

  return { onDragStart };
}
