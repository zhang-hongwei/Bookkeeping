/**
 * AI Asset Generator - real API integration for image and template generation.
 * Requires NEXT_PUBLIC_AI_ASSET_ENDPOINT environment variable.
 */

import { nanoid } from 'nanoid';
import type { ImageAsset, TemplateAsset } from '../types';

export interface AIGenerateOptions {
  prompt: string;
  width?: number;
  height?: number;
  style?: 'photorealistic' | 'illustration' | 'abstract' | 'icon';
  negativePrompt?: string;
}

export interface AITemplateGenerateOptions {
  prompt: string;
  canvasWidth: number;
  canvasHeight: number;
}

export class AIAssetGenerator {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async generateImage(options: AIGenerateOptions): Promise<ImageAsset> {
    const res = await fetch(`${this.endpoint}/generate/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: options.prompt,
        width: options.width ?? 1024,
        height: options.height ?? 1024,
        style: options.style ?? 'photorealistic',
        negative_prompt: options.negativePrompt,
      }),
    });

    if (!res.ok) throw new Error(`AI image generation failed: ${res.status}`);

    const data = await res.json();
    const now = Date.now();

    return {
      id: `ai-img-${nanoid(10)}`,
      type: 'image',
      name: options.prompt.slice(0, 50),
      tags: ['ai-generated', options.style ?? 'photorealistic'],
      createdAt: now,
      updatedAt: now,
      source: {
        type: 'ai-generated',
        prompt: options.prompt,
        model: data.model,
      },
      src: data.url,
      thumbnail: data.thumbnail ?? data.url,
      width: data.width ?? options.width ?? 1024,
      height: data.height ?? options.height ?? 1024,
      format: 'png',
      alt: options.prompt,
    };
  }

  async generateTemplate(options: AITemplateGenerateOptions): Promise<TemplateAsset> {
    const res = await fetch(`${this.endpoint}/generate/template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: options.prompt,
        canvas_width: options.canvasWidth,
        canvas_height: options.canvasHeight,
      }),
    });

    if (!res.ok) throw new Error(`AI template generation failed: ${res.status}`);

    const data = await res.json();
    const now = Date.now();

    return {
      id: `ai-tpl-${nanoid(10)}`,
      type: 'template',
      name: options.prompt.slice(0, 50),
      tags: ['ai-generated'],
      createdAt: now,
      updatedAt: now,
      source: {
        type: 'ai-generated',
        prompt: options.prompt,
        model: data.model,
      },
      nodes: data.nodes,
      rootNodeId: data.rootNodeId,
      canvasWidth: options.canvasWidth,
      canvasHeight: options.canvasHeight,
      preview: data.preview ?? '',
      category: 'poster',
      placeholders: data.placeholders ?? [],
      lockedNodeIds: data.lockedNodeIds ?? [],
    };
  }
}
