/**
 * Poster Card Editor - Asset Initialization
 *
 * Based on: 10-asset-system.md section "Preset Initialization"
 * Populates the asset store with built-in fonts, shapes, and style tokens.
 */

import type { Asset } from './types';
import {
  PRESET_FONTS,
  PRESET_SHAPES,
  PRESET_TYPOGRAPHY_TOKENS,
  PRESET_COLOR_TOKENS,
} from './presets';
import { useAssetStore } from './asset-store';

export function initializePresetAssets(): void {
  const store = useAssetStore.getState();

  // Skip if fonts are already registered (initialization ran before)
  if (store.assetIdsByType.font.length > 0) return;

  const allAssets: Asset[] = [
    ...PRESET_FONTS,
    ...PRESET_SHAPES,
    ...PRESET_TYPOGRAPHY_TOKENS,
    ...PRESET_COLOR_TOKENS,
  ];

  store.addAssets(allAssets);

  // Mark system fonts as loaded (no network fetch needed)
  for (const font of PRESET_FONTS) {
    if (font.source.type === 'local') {
      store.markFontLoaded(font.fontFamily);
    }
  }
}
