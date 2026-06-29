'use client';

import { useState, useCallback } from 'react';
import { useGradientStore } from '../store/gradient-store';
import { getRenderToBlob } from './useGradientRenderer';
import { triggerDownload } from '../lib/export';

export function useExport() {
  const [exporting, setExporting] = useState(false);

  const exportGradient = useCallback(async () => {
    const renderToBlob = getRenderToBlob();
    if (!renderToBlob) {
      console.error('[useExport] renderToBlob not available - WebGL may not be initialized');
      return;
    }

    const state = useGradientStore.getState();
    const { width, height, pixelDensity } = state;
    const exportWidth = width * pixelDensity;
    const exportHeight = height * pixelDensity;

    console.log('[useExport] Export details:', {
      storeWidth: width,
      storeHeight: height,
      pixelDensity,
      exportWidth,
      exportHeight,
      filename: `gradiweave-${width}x${height}@${pixelDensity}x.png`,
    });

    setExporting(true);
    try {
      const blob = await renderToBlob(pixelDensity);
      const filename = `gradiweave-${width}x${height}@${pixelDensity}x.png`;
      console.log('[useExport] Blob created:', {
        size: blob.size,
        type: blob.type,
        expectedSize: exportWidth * exportHeight * 4, // RGBA = 4 bytes per pixel
      });
      triggerDownload(blob, filename);
    } catch (err) {
      console.error('[useExport] Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportGradient, exporting };
}
