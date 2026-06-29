/**
 * Emotional Palette Types
 * Type definitions for AI-powered emotional atmosphere generation
 */

import type { ColorInfo, GradientStop } from './ai';

// ==================== Motion Types ====================

export type AnimationType = 'gentle' | 'bounce' | 'smooth' | 'elastic';

export type Rhythm = 'calm' | 'moderate' | 'energetic' | 'intense';

export interface MotionProfile {
  duration: {
    fast: number; // ms
    normal: number;
    slow: number;
  };
  easing: string; // cubic-bezier(...)
  animationType: AnimationType;
  rhythm: Rhythm;
}

// ==================== Typography Types ====================

export interface TypographyProfile {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  letterSpacing: number; // em
  lineHeight: number;
  scaleRatio: number; // modular scale (1.2, 1.25, 1.333, 1.5)
}

// ==================== Gradient Background Types ====================

export interface GradientBackground {
  name: string;
  css: string;
  stops: GradientStop[];
  angle: number;
  type: 'linear' | 'radial';
  opacity: number;
}

// ==================== Emotional Palette ====================

export interface EmotionalPalette {
  mood: string;
  moodEn: string;
  description: string;
  colors: ColorInfo[];
  gradients: GradientBackground[];
  motion: MotionProfile;
  typography: TypographyProfile;
  tags: string[];
}

// ==================== Request/Response Types ====================

export interface EmotionalPaletteRequest {
  prompt: string;
  language?: 'zh' | 'en';
}

// ==================== Preset Mood Types ====================

export type MoodCategory = 'warm' | 'cool' | 'energetic' | 'calm';

export const MOOD_KEYWORDS: Record<MoodCategory, string[]> = {
  warm: ['深夜食堂', '暖阳午后', '壁炉旁', '母亲的手', 'comfort zone'],
  cool: ['赛博禅意', '冰岛极光', '孤独星球', '深夜编程', 'digital detox'],
  energetic: ['热带风暴', '街头涂鸦', '电子音乐节', '极限运动', 'creative rush'],
  calm: ['焦虑缓解', '森林浴', '冥想空间', '雨天窗边', 'inner peace'],
};
