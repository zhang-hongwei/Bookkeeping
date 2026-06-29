/**
 * AI Service Types
 * Type definitions for AI-powered design tools
 */

// ==================== Common Types ====================

export type AIProvider = 'zhipu' | 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  visionModel?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIRequest {
  prompt: string;
  context?: string;
  options?: Record<string, unknown>;
}

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ==================== Color Palette Types ====================

export interface ColorInfo {
  hex: string;
  name: string;
  description?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: ColorInfo[];
  tags?: string[];
  createdAt: string;
}

export interface ColorGenerationRequest {
  prompt: string;
  style?: ColorStyle;
  colorCount?: number;
}

export interface ColorExtractionRequest {
  imageBase64: string;
  mimeType: string;
  colorCount?: number;
}

export type ColorStyle =
  | 'modern'
  | 'minimalist'
  | 'vibrant'
  | 'pastel'
  | 'dark'
  | 'earthy'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'tech'
  | 'retro'
  | 'luxury';

export const COLOR_STYLES: Record<ColorStyle, { label: string; description: string }> = {
  modern: { label: '现代', description: '简洁明快，适合科技产品' },
  minimalist: { label: '极简', description: '黑白灰为主，简约高级' },
  vibrant: { label: '活力', description: '鲜艳活泼，充满能量' },
  pastel: { label: '柔和', description: '粉嫩温柔，适合女性产品' },
  dark: { label: '暗黑', description: '深色系，神秘高级' },
  earthy: { label: '大地', description: '自然土色，温暖舒适' },
  ocean: { label: '海洋', description: '蓝绿色系，清新宁静' },
  sunset: { label: '日落', description: '橙红色系，温暖浪漫' },
  forest: { label: '森林', description: '绿色系，自然生机' },
  tech: { label: '科技', description: '蓝色紫色，未来感' },
  retro: { label: '复古', description: '怀旧色调，经典永恒' },
  luxury: { label: '奢华', description: '金色黑色，高端大气' },
};

// ==================== Design Token Types ====================

export type ColorScaleStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type ColorScale = Record<ColorScaleStep, string>;

export interface SemanticTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface VibrantPalette {
  vibrant: string;
  muted: string;
  darkVibrant: string;
  lightVibrant: string;
  lightMuted: string;
  darkMuted: string;
}

export interface DesignTokenTheme {
  source: string;
  palette: VibrantPalette;
  semantic: SemanticTheme;
  scales: Record<keyof SemanticTheme, ColorScale>;
}

// ==================== Gradient Types ====================

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface GradientInfo {
  type: 'linear' | 'radial';
  angle?: number; // 0-360 for linear
  stops: GradientStop[];
  css: string;
}

export interface GradientGenerationRequest {
  prompt: string;
  type?: 'linear' | 'radial';
  stopCount?: number;
}

// ==================== Copy Types ====================

export type CopyType = 'button' | 'heading' | 'description' | 'error' | 'success' | 'placeholder';

export type CopyTone = 'formal' | 'casual' | 'friendly' | 'professional' | 'playful';

export interface CopyGenerationRequest {
  type: CopyType;
  context: string;
  tone?: CopyTone;
  count?: number;
}

export interface CopySuggestion {
  text: string;
  characterCount: number;
}

export const COPY_TYPES: Record<CopyType, { label: string; description: string }> = {
  button: { label: '按钮文案', description: '行动号召按钮文字' },
  heading: { label: '标题', description: '页面或区块标题' },
  description: { label: '描述', description: '功能或产品描述' },
  error: { label: '错误提示', description: '错误状态提示信息' },
  success: { label: '成功提示', description: '成功状态提示信息' },
  placeholder: { label: '占位符', description: '输入框占位文字' },
};

export const COPY_TONES: Record<CopyTone, { label: string }> = {
  formal: { label: '正式' },
  casual: { label: '随意' },
  friendly: { label: '友好' },
  professional: { label: '专业' },
  playful: { label: '俏皮' },
};

// ==================== Fallback Data ====================

export interface FallbackPalette {
  name: string;
  colors: ColorInfo[];
}
