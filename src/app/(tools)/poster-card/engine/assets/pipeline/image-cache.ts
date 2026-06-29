/**
 * Image cache for preloading and reusing HTMLImageElement instances.
 */

export class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private loading = new Map<string, Promise<HTMLImageElement | null>>();

  preload(url: string): void {
    if (this.cache.has(url) || this.loading.has(url)) return;
    this.load(url);
  }

  get(url: string): HTMLImageElement | null {
    return this.cache.get(url) ?? null;
  }

  async load(url: string): Promise<HTMLImageElement | null> {
    if (this.cache.has(url)) return this.cache.get(url)!;
    if (this.loading.has(url)) return this.loading.get(url)!;

    const promise = new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.cache.set(url, img);
        this.loading.delete(url);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(url);
        resolve(null);
      };
      img.src = url;
    });

    this.loading.set(url, promise);
    return promise;
  }

  preloadDocumentAssets(assets: Record<string, import('../types').Asset>): void {
    for (const asset of Object.values(assets)) {
      if (asset.type === 'image') {
        this.preload(asset.src);
        if (asset.thumbnail) this.preload(asset.thumbnail);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.loading.clear();
  }
}

export const imageCache = new ImageCache();
