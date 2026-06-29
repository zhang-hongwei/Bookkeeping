/**
 * Roast Generator Presets
 * Card style configurations for 4 roast personas
 */

import type { RoastCardStyle, RoastStyleConfig } from './types';

export const ROAST_STYLES: Record<RoastCardStyle, RoastStyleConfig> = {
  'apple-minimal': {
    id: 'apple-minimal',
    label: '极简风',
    colors: {
      background: '#f5f5f7',
      text: '#1d1d1f',
      accent: '#86868b',
    },
    fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  'dark-gold': {
    id: 'dark-gold',
    label: '黑金毒舌',
    colors: {
      background: '#0a0a0a',
      text: '#ffffff',
      accent: '#d4af37',
      secondary: '#1a1a1a',
    },
    fontFamily: "'Noto Sans SC', 'Helvetica Neue', sans-serif",
  },
  meme: {
    id: 'meme',
    label: '搞笑风',
    colors: {
      background: '#fff9c4',
      text: '#333333',
      accent: '#ff6f00',
      secondary: '#000000',
    },
    fontFamily: "'Arial Black', 'Noto Sans SC', sans-serif",
  },
  handwritten: {
    id: 'handwritten',
    label: '手写风',
    colors: {
      background: '#fdf6e3',
      text: '#5c4b37',
      accent: '#8b7355',
      secondary: '#e8dcc8',
    },
    fontFamily: "'Ma Shan Zheng', 'ZCOOL KuaiLe', cursive",
  },
};
