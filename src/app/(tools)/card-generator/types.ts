/**
 * Card Generator Types
 * Type definitions for AI-powered card generation
 */

export type CardStyle = 'minimal' | 'emotional' | 'tech' | 'business' | 'diary' | 'poster';

export type CardEmotion = 'positive' | 'reflective' | 'low' | 'showoff' | 'neutral';

export type PlatformSize = 'xiaohongshu' | 'twitter' | 'square' | 'instagram-story';

export interface CardStyleConfig {
  id: CardStyle;
  label: string;
  labelEn: string;
  description: string;
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary?: string;
  };
  fontFamily: string;
  fontSize: {
    title: number;
    keyword: number;
    tag: number;
  };
}

export interface EnhancedText {
  text: string;
  keywords: string[];
  emotion: CardEmotion;
  tags: string[];
  styleId: CardStyle;
}

export interface CardGenerationResult {
  original: string;
  enhancedTexts: EnhancedText[];
  suggestedStyle: CardStyle;
}

export interface PlatformSizeConfig {
  id: PlatformSize;
  label: string;
  width: number;
  height: number;
  ratio: string;
}

export interface CardGenerationRequest {
  text: string;
  count?: number;
}

export interface CardData {
  styleId: CardStyle;
  text: string;
  keywords: string[];
  tags: string[];
  emotion: CardEmotion;
}
