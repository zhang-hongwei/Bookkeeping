/**
 * Google Fonts source - real API integration for font listing and search.
 * Requires NEXT_PUBLIC_GOOGLE_FONTS_API_KEY environment variable.
 */

import type { FontAsset } from '../types';

export interface GoogleFontsConfig {
  apiKey: string;
}

export interface GoogleFontItem {
  family: string;
  category: string;
  variants: string[];
  files: Record<string, string>;
}

export class GoogleFontSource {
  private apiKey: string;
  private cache: FontAsset[] | null = null;

  constructor(config: GoogleFontsConfig) {
    this.apiKey = config.apiKey;
  }

  async listFonts(): Promise<FontAsset[]> {
    if (this.cache) return this.cache;

    const res = await fetch('/api/google-fonts?sort=popularity');

    if (!res.ok) throw new Error(`Google Fonts API failed: ${res.status}`);

    const data = await res.json();
    const now = Date.now();

    this.cache = data.items.slice(0, 200).map((font: GoogleFontItem) => {
      const weights = font.variants
        .filter((v) => !v.includes('italic'))
        .map((v) => (v === 'regular' ? 400 : Number(v)));

      const fontUrl = font.files['regular'] || font.files['400'] || Object.values(font.files)[0];

      return {
        id: `gfont-${font.family.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'font' as const,
        name: font.family,
        tags: ['google-fonts', font.category],
        createdAt: now,
        updatedAt: now,
        source: {
          type: 'google' as const,
          googleName: font.family,
        },
        fontFamily: font.family,
        fontUrl: fontUrl?.replace('http://', 'https://'),
        category: font.category as FontAsset['category'],
        fontWeightRange: weights.length > 0 ? weights : [400],
        isItalic: font.variants.some((v) => v.includes('italic')),
      } satisfies FontAsset;
    });

    return this.cache;
  }

  async searchFonts(query: string): Promise<FontAsset[]> {
    const fonts = await this.listFonts();
    const q = query.toLowerCase();
    return fonts.filter(
      (f) => f.name.toLowerCase().includes(q) || f.category.includes(q),
    );
  }
}
