/**
 * Glass Effect Generator Types
 * Type definitions for glassmorphism, liquid glass, and neumorphism effects
 */

export type GlassEffectType = 'glassmorphism' | 'liquidGlass' | 'neumorphism';

export type PreviewTemplate = 'card' | 'profile' | 'navBar' | 'stats';

export type GlassExportFormat = 'css' | 'scss' | 'tailwind' | 'mui' | 'json';

export interface GlassConfig {
  /** Effect type */
  effectType: GlassEffectType;

  /** Preview template */
  previewTemplate: PreviewTemplate;

  // ─── Common ─────────────────────────────
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  padding: number;

  // ─── Glassmorphism & Liquid Glass ────────
  blur: number;
  opacity: number;
  saturation: number;
  backgroundColor: string;

  // ─── Shadow (glassmorphism / liquid glass) ──
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  shadowOpacity: number;

  // ─── Liquid Glass ───────────────────────
  innerShadowOpacity: number;

  // ─── Neumorphism ────────────────────────
  neumorphDistance: number;
  neumorphBlur: number;
  surfaceColor: string;
  lightShadowColor: string;
  darkShadowColor: string;
  neumorphInset: boolean;

  // ─── Background ─────────────────────────
  backgroundPreset: string;
  /** Image URL for background (takes priority over gradient when set) */
  backgroundImage: string;
}

export interface GlassPreset {
  name: string;
  description: string;
  effectType: GlassEffectType;
  config: Partial<GlassConfig>;
}

export interface BackgroundOption {
  name: string;
  value: string;
}
