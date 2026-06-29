/**
 * Unsplash source - real API integration for image search and download.
 * Requires NEXT_PUBLIC_UNSPLASH_ACCESS_KEY environment variable.
 */

import { nanoid } from 'nanoid';
import type { ImageAsset } from '../types';

export interface UnsplashConfig {
  accessKey: string;
  perPage?: number;
}

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  width: number;
  height: number;
  alt_description: string | null;
  color: string;
  user: {
    name: string;
    links: { html: string };
  };
  links: {
    download: string;
  };
}

export class UnsplashSource {
  private accessKey: string;
  private perPage: number;

  constructor(config: UnsplashConfig) {
    this.accessKey = config.accessKey;
    this.perPage = config.perPage ?? 20;
  }

  async search(query: string, page = 1): Promise<{ results: ImageAsset[]; totalPages: number }> {
    const params = new URLSearchParams({
      query,
      page: String(page),
      per_page: String(this.perPage),
    });

    const res = await fetch(`/api/unsplash?${params}`);

    if (!res.ok) throw new Error(`Unsplash search failed: ${res.status}`);

    const data = await res.json();
    const now = Date.now();

    const results: ImageAsset[] = data.results.map((photo: UnsplashPhoto) => ({
      id: `unsplash-${photo.id}`,
      type: 'image' as const,
      name: photo.alt_description || `Unsplash ${photo.id}`,
      tags: ['unsplash'],
      createdAt: now,
      updatedAt: now,
      source: {
        type: 'unsplash' as const,
        author: photo.user.name,
        downloadUrl: photo.links.download,
      },
      src: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      width: photo.width,
      height: photo.height,
      format: 'jpeg' as const,
      alt: photo.alt_description || undefined,
      dominantColor: photo.color,
    }));

    return { results, totalPages: data.total_pages };
  }

  async download(asset: ImageAsset): Promise<string> {
    if (!asset.source || asset.source.type !== 'unsplash' || !('downloadUrl' in asset.source)) {
      return asset.src;
    }

    const downloadUrl = asset.source.downloadUrl;
    if (!downloadUrl) return asset.src;

    // Trigger Unsplash download tracking (proxied to keep key server-side)
    const photoId = asset.id.replace('unsplash-', '');
    fetch(`/api/unsplash/download?photo_id=${encodeURIComponent(photoId)}`).catch(() => { /* non-critical */ });

    return downloadUrl;
  }
}
