/**
 * Text Shadow Types
 * Type definitions for text shadow editor
 */

export interface TextShadowLayer {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity: number;
  enabled: boolean;
}

export interface TextShadowPreset {
  name: string;
  description: string;
  layers: Omit<TextShadowLayer, 'id' | 'enabled'>[];
}

export type TextShadowExportFormat = 'css' | 'mui' | 'tailwind' | 'json';
