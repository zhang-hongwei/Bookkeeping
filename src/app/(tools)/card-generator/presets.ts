/**
 * Card Generator Presets
 * Style configurations and platform size definitions
 */

import type { CardStyleConfig, PlatformSizeConfig } from './types';

export const CARD_STYLES: Record<string, CardStyleConfig> = {
  minimal: {
    id: 'minimal',
    label: '极简高级',
    labelEn: 'Minimal',
    description: '白底黑字，大留白，极简美学',
    colors: {
      background: '#fafafa',
      text: '#1a1a1a',
      accent: '#643DFF',
    },
    fontFamily: "'Noto Serif SC', 'Georgia', serif",
    fontSize: { title: 28, keyword: 30, tag: 12 },
  },
  emotional: {
    id: 'emotional',
    label: '情绪氛围',
    labelEn: 'Emotional',
    description: '渐变模糊，温暖光影，梦幻感',
    colors: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      accent: '#ffd700',
      secondary: 'rgba(255,255,255,0.15)',
    },
    fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
    fontSize: { title: 26, keyword: 28, tag: 12 },
  },
  tech: {
    id: 'tech',
    label: '科技未来',
    labelEn: 'Tech Future',
    description: '深色背景，发光线条，赛博朋克',
    colors: {
      background: '#0a0a14',
      text: '#e0e0e0',
      accent: '#00ff88',
      secondary: '#1a1a2e',
    },
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: { title: 24, keyword: 26, tag: 11 },
  },
  business: {
    id: 'business',
    label: '商业金句',
    labelEn: 'Business Quote',
    description: 'CEO发言风格，专业大气',
    colors: {
      background: '#ffffff',
      text: '#1a1a1a',
      accent: '#c9a84c',
      secondary: '#f5f0e8',
    },
    fontFamily: "'Noto Serif SC', 'Georgia', serif",
    fontSize: { title: 26, keyword: 28, tag: 12 },
  },
  diary: {
    id: 'diary',
    label: '日记手写',
    labelEn: 'Diary',
    description: '真实记录感，温暖代入',
    colors: {
      background: '#fdf6e3',
      text: '#5c4b37',
      accent: '#d4813b',
      secondary: '#f5e6c8',
    },
    fontFamily: "'Ma Shan Zheng', 'ZCOOL KuaiLe', cursive",
    fontSize: { title: 24, keyword: 26, tag: 11 },
  },
  poster: {
    id: 'poster',
    label: '海报风',
    labelEn: 'Poster',
    description: '大字强对比，视觉冲击力',
    colors: {
      background: '#ff4757',
      text: '#ffffff',
      accent: '#ffd32a',
      secondary: '#2f3542',
    },
    fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
    fontSize: { title: 36, keyword: 40, tag: 13 },
  },
};

export const CARD_STYLES_LIST = Object.values(CARD_STYLES);

export const PLATFORM_SIZES: Record<string, PlatformSizeConfig> = {
  xiaohongshu: {
    id: 'xiaohongshu',
    label: '小红书',
    width: 1080,
    height: 1440,
    ratio: '3:4',
  },
  twitter: {
    id: 'twitter',
    label: 'Twitter/X',
    width: 1600,
    height: 900,
    ratio: '16:9',
  },
  square: {
    id: 'square',
    label: '正方形',
    width: 1080,
    height: 1080,
    ratio: '1:1',
  },
  'instagram-story': {
    id: 'instagram-story',
    label: 'IG Story',
    width: 1080,
    height: 1920,
    ratio: '9:16',
  },
};

export const PLATFORM_SIZES_LIST = Object.values(PLATFORM_SIZES);

export const DEFAULT_PLATFORM_SIZE: PlatformSizeConfig = PLATFORM_SIZES.xiaohongshu;
