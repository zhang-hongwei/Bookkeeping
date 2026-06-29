/**
 * Roast Generator Types
 * Type definitions for AI-powered roast/complaint generation
 */

/** The 4 roast personas */
export type RoastPersona = 'toxic' | 'highEQ' | 'worker' | 'goofy';

/** The 4 card visual styles - mapped 1:1 to personas */
export type RoastCardStyle = 'apple-minimal' | 'dark-gold' | 'meme' | 'handwritten';

/** A single roast variant produced by AI */
export interface RoastVariant {
  persona: RoastPersona;
  text: string;
  tags: string[];
}

/** The full AI response shape */
export interface RoastGenerationResult {
  original: string;
  variants: RoastVariant[];
}

/** Card data passed to visual card components */
export interface RoastCardData {
  persona: RoastPersona;
  cardStyle: RoastCardStyle;
  text: string;
  tags: string[];
  date: string;
  referralText: string;
}

/** Style config for card presets */
export interface RoastStyleConfig {
  id: RoastCardStyle;
  label: string;
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary?: string;
  };
  fontFamily: string;
}

/** Persona to card style mapping */
export const PERSONA_STYLE_MAP: Record<RoastPersona, RoastCardStyle> = {
  toxic: 'dark-gold',
  highEQ: 'apple-minimal',
  worker: 'meme',
  goofy: 'handwritten',
};

/** Persona display labels */
export const PERSONA_LABELS: Record<RoastPersona, string> = {
  toxic: '毒舌版',
  highEQ: '高情商版',
  worker: '打工人版',
  goofy: '沙雕版',
};

/** Fixed card dimensions */
export const CARD_SIZE = { width: 1080, height: 1080 } as const;
