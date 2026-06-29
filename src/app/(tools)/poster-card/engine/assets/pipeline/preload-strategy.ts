/**
 * Preload strategy for assets at key lifecycle moments.
 */

import type { Asset } from '../types';
import type { AssetStoreApi } from '../asset-store';
import { imageCache } from './image-cache';

export class PreloadStrategy {
  constructor(
    private cache: typeof imageCache,
    private assetStore: AssetStoreApi,
  ) {}

  async onDocumentOpen(assets: Record<string, Asset>): Promise<void> {
    const imageAssets = Object.values(assets).filter((a) => a.type === 'image');
    await Promise.all(
      imageAssets.map((a) => this.cache.load((a as any).src)),
    );
  }

  async onNodeSelected(node: any): Promise<void> {
    if (node?.type === 'image' && node.assetId) {
      const asset = this.assetStore.getAsset(node.assetId);
      if (asset?.type === 'image') {
        this.cache.preload(asset.src);
      }
    }
  }

  async onBeforeExport(assets: Record<string, Asset>): Promise<void> {
    const imageAssets = Object.values(assets).filter((a) => a.type === 'image');
    await Promise.all(
      imageAssets.map((a) => this.cache.load((a as any).src)),
    );
  }
}
