/**
 * Asset Pipeline - aggregates all asset sources.
 */

import type { AssetStoreApi } from '../asset-store';
import { UploadSource } from './upload-source';
import { ImageCache, imageCache } from './image-cache';
import { PreloadStrategy } from './preload-strategy';
import { UnsplashSource } from './unsplash-source';
import { GoogleFontSource } from './google-fonts-source';
import { AIAssetGenerator } from './ai-generator';
import type { ImageAsset, AIGenerateOptions } from '../types';

export interface AssetPipelineConfig {
  unsplashKey?: string;
  googleFontsKey?: string;
  aiEndpoint?: string;
}

export class AssetPipeline {
  readonly unsplash: UnsplashSource | null;
  readonly upload: UploadSource;
  readonly googleFonts: GoogleFontSource | null;
  readonly aiGenerator: AIAssetGenerator | null;
  readonly cache: {
    image: ImageCache;
    preload: PreloadStrategy;
  };

  constructor(config: AssetPipelineConfig, assetStore: AssetStoreApi) {
    this.unsplash = config.unsplashKey ? new UnsplashSource({ accessKey: config.unsplashKey }) : null;
    this.upload = new UploadSource();
    this.googleFonts = config.googleFontsKey ? new GoogleFontSource({ apiKey: config.googleFontsKey }) : null;
    this.aiGenerator = config.aiEndpoint ? new AIAssetGenerator(config.aiEndpoint) : null;
    this.cache = {
      image: imageCache,
      preload: new PreloadStrategy(imageCache, assetStore),
    };
  }

  async searchUnsplash(query: string, page?: number): Promise<ImageAsset[]> {
    if (!this.unsplash) throw new Error('Unsplash not configured');
    const { results } = await this.unsplash.search(query, page);
    return results;
  }

  async uploadImage(file: File): Promise<ImageAsset> {
    return this.upload.uploadImage(file);
  }

  async generateImage(options: AIGenerateOptions): Promise<ImageAsset> {
    if (!this.aiGenerator) throw new Error('AI generator not configured');
    return this.aiGenerator.generateImage(options);
  }

  async generateTemplate(options: {
    prompt: string;
    canvasWidth: number;
    canvasHeight: number;
  }) {
    if (!this.aiGenerator) throw new Error('AI generator not configured');
    return this.aiGenerator.generateTemplate(options);
  }
}

let pipeline: AssetPipeline | null = null;

export function getAssetPipeline(assetStore: AssetStoreApi): AssetPipeline {
  if (!pipeline) {
    pipeline = new AssetPipeline(
      {
        unsplashKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
        googleFontsKey: process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY,
        aiEndpoint: process.env.NEXT_PUBLIC_AI_ASSET_ENDPOINT,
      },
      assetStore,
    );
  }
  return pipeline;
}
