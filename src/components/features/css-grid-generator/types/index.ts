/**
 * CSS Grid Generator Types
 * Based on cssgridgenerator by Sarah Drasner
 */

export interface GridUnit {
  unit: string;
}

export interface GridArea {
  id: string;
  gridArea: string; // CSS grid-area value e.g. "1 / 1 / 2 / 3"
}

export interface DragSelection {
  startRow: number | null;
  startCol: number | null;
  endRow: number | null;
  endCol: number | null;
}

export type CSSUnit = string;

export const VALID_CSS_UNITS = [
  'fr',
  'px',
  '%',
  'em',
  'rem',
  'vw',
  'vh',
  'vmin',
  'q',
  'mm',
  'cm',
  'in',
  'pt',
  'pc',
  'ex',
  'ch',
] as const;

export const CSS_KEYWORDS = ['auto', 'min-content', 'max-content'] as const;
