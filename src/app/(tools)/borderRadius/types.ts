/**
 * Border Radius Editor Types
 */

export interface BorderRadiusValues {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export interface BorderRadiusPreset {
  name: string;
  description: string;
  values: BorderRadiusValues;
}

export type BorderUnit = 'px' | '%';
