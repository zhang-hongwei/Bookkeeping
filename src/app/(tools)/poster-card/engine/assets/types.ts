/**
 * Poster Card Editor - Asset System Types
 *
 * Based on: 10-asset-system.md
 * Asset types for images, fonts, shapes, templates, and style tokens.
 */

// ═══════════════════════════════════════
// Asset Type Discriminator
// ═══════════════════════════════════════

export type AssetType = 'image' | 'font' | 'shape' | 'template' | 'style-token';

// ═══════════════════════════════════════
// Asset Source Types
// ═══════════════════════════════════════

export type AssetSource =
  | { type: 'unsplash'; author?: string; downloadUrl?: string }
  | { type: 'upload'; fileName: string; fileSize?: number }
  | { type: 'preset' }
  | { type: 'ai-generated'; prompt?: string; model?: string }
  | { type: 'custom'; label: string };

// ═══════════════════════════════════════
// Asset Semantic (AI bridge)
// ═══════════════════════════════════════

export type AssetRole =
  | 'background'
  | 'hero'
  | 'avatar'
  | 'icon'
  | 'decoration'
  | 'pattern'
  | 'divider';

export type AssetContext =
  | 'social-media'
  | 'print'
  | 'presentation'
  | 'web'
  | 'poster'
  | 'card';

export interface AssetSemantic {
  role?: AssetRole;
  mood?: string[];
  context?: AssetContext[];
}

// ═══════════════════════════════════════
// Base Asset
// ═══════════════════════════════════════

export interface BaseAsset {
  id: string;
  type: AssetType;
  name: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  source: AssetSource;
  semantic?: AssetSemantic;
}

// ═══════════════════════════════════════
// Specific Asset Types
// ═══════════════════════════════════════

export interface ImageAsset extends BaseAsset {
  type: 'image';
  src: string;
  thumbnail: string;
  width: number;
  height: number;
  format: 'jpeg' | 'png' | 'webp' | 'svg';
  alt?: string;
  dominantColor?: string;
}

export type FontSource =
  | { type: 'google'; googleName: string }
  | { type: 'local'; localName: string }
  | { type: 'custom'; url: string; format: 'woff2' | 'woff' | 'ttf' };

export interface FontAsset extends BaseAsset {
  type: 'font';
  fontFamily: string;
  fontUrl?: string;
  previewUrl?: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  fontWeightRange: number[];
  isItalic: boolean;
  source: FontSource;
}

export interface ShapeAsset extends BaseAsset {
  type: 'shape';
  svgContent: string;
  viewBox: string;
  category: 'basic' | 'arrow' | 'icon' | 'decoration' | 'illustration';
  defaultFill?: string;
  defaultStroke?: string;
  resizable: boolean;
  iconparkCategory?: string;
}

export type TemplateCategory =
  | 'social-media'
  | 'poster'
  | 'card'
  | 'presentation'
  | 'print';

export interface TemplatePlaceholder {
  id: string;
  nodeId: string;
  type: 'text' | 'image';
  label: string;
  defaultValue: string;
}

export interface TemplateAsset extends BaseAsset {
  type: 'template';
  nodes: Record<string, any>; // Forward reference to PosterNode
  rootNodeId: string;
  canvasWidth: number;
  canvasHeight: number;
  preview: string;
  category: TemplateCategory;
  placeholders: TemplatePlaceholder[];
  lockedNodeIds: string[];
}

export type StyleTokenType = 'typography' | 'color' | 'spacing' | 'shadow' | 'border';

export interface StyleTokenAsset extends BaseAsset {
  type: 'style-token';
  tokenType: StyleTokenType;
  value: Record<string, any>;
}

// ═══════════════════════════════════════
// Union Type & Guards
// ═══════════════════════════════════════

export type Asset =
  | ImageAsset
  | FontAsset
  | ShapeAsset
  | TemplateAsset
  | StyleTokenAsset;

export function isImageAsset(asset: Asset): asset is ImageAsset {
  return asset.type === 'image';
}

export function isFontAsset(asset: Asset): asset is FontAsset {
  return asset.type === 'font';
}

export function isShapeAsset(asset: Asset): asset is ShapeAsset {
  return asset.type === 'shape';
}

export function isTemplateAsset(asset: Asset): asset is TemplateAsset {
  return asset.type === 'template';
}

export function isStyleTokenAsset(asset: Asset): asset is StyleTokenAsset {
  return asset.type === 'style-token';
}

// ═══════════════════════════════════════
// Runtime State
// ═══════════════════════════════════════

export type AssetRuntimeStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface AssetRuntimeState {
  status: AssetRuntimeStatus;
  error?: string;
  retryCount: number;
  lastAttemptAt?: number;
}

// ═══════════════════════════════════════
// Resolved Asset Types
// ═══════════════════════════════════════

export interface ResolvedImageAsset {
  src: string;
  width: number;
  height: number;
  dominantColor?: string;
  alt?: string;
}

export interface ResolvedFontAsset {
  fontFamily: string;
  fontUrl?: string;
  fontWeightRange: number[];
  loaded: boolean;
}

export interface ResolvedShapeAsset {
  svgContent: string;
  viewBox: string;
  defaultFill?: string;
  defaultStroke?: string;
}

export interface ResolvedTypography {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface ResolvedColor {
  color: string;
  opacity: number;
}
