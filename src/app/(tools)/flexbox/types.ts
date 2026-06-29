/**
 * Flexbox Types
 * Type definitions for flexbox generator
 */

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type AlignItems =
  | 'stretch'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'baseline';
export type AlignContent =
  | 'stretch'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around';

export interface FlexItem {
  id: string;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf?: AlignItems;
  order: number;
}

export interface FlexContainerConfig {
  flexDirection: FlexDirection;
  flexWrap: FlexWrap;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  alignContent: AlignContent;
  gap: number;
  padding: number;
}

export interface FlexPreset {
  name: string;
  description: string;
  container: Partial<FlexContainerConfig>;
}

export type FlexExportFormat = 'css' | 'scss' | 'tailwind' | 'mui' | 'json';
