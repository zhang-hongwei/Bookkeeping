/**
 * Upload source - converts local file uploads to ImageAsset.
 */

import { nanoid } from 'nanoid';
import type { ImageAsset } from '../types';
import { imageCache } from './image-cache';

export interface UploadResult {
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  format: string;
  fileSize: number;
}

export class UploadSource {
  async uploadImage(file: File): Promise<ImageAsset> {
    const result = await this.processFile(file);
    const now = Date.now();

    return {
      id: `img-${nanoid(10)}`,
      type: 'image',
      name: file.name.replace(/\.[^/.]+$/, ''),
      tags: ['upload'],
      createdAt: now,
      updatedAt: now,
      source: { type: 'upload', fileName: file.name, fileSize: file.size },
      src: result.url,
      thumbnail: result.thumbnail,
      width: result.width,
      height: result.height,
      format: result.format as ImageAsset['format'],
      dominantColor: undefined,
    };
  }

  private processFile(file: File): Promise<UploadResult> {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`File "${file.name}" exceeds the 5MB upload limit (${(file.size / 1024 / 1024).toFixed(1)}MB).`);
      return Promise.reject(new Error(`File "${file.name}" exceeds the 5MB upload limit.`));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const img = new Image();
        img.onload = () => {
          imageCache.preload(url);

          const thumbnail = this.generateThumbnail(img, 200);
          const format = file.type.split('/')[1] || 'png';

          resolve({
            url,
            thumbnail,
            width: img.naturalWidth,
            height: img.naturalHeight,
            format,
            fileSize: file.size,
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private generateThumbnail(img: HTMLImageElement, maxSize: number): string {
    const canvas = document.createElement('canvas');
    const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  }
}
