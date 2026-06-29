/**
 * CSS Unit Validation Utilities
 * Validates CSS grid template units (columns and rows)
 */

import { CSS_KEYWORDS } from '../types';

/**
 * Validates if a string is a valid CSS unit for grid-template-columns or grid-template-rows
 */
export function validateCSSUnit(unit: string): boolean {
  const trimmed = unit.trim();

  // Allow empty (will use default)
  if (!trimmed) {
    return true;
  }

  // Allow 0 without unit
  if (trimmed === '0') {
    return true;
  }

  // Allow CSS keywords
  if (CSS_KEYWORDS.includes(trimmed as typeof CSS_KEYWORDS[number])) {
    return true;
  }

  // Check minmax function
  if (/^minmax\s*\(.+\)$/i.test(trimmed)) {
    return true;
  }

  // Allow number + unit pattern (e.g., 10px, 1fr, 50%, 1.5rem)
  const unitPattern = /^-?\d*\.?\d+(fr|px|%|em|rem|vw|vh|vmin|vmax|q|mm|cm|in|pt|pc|ex|ch)$/i;

  return unitPattern.test(trimmed);
}

