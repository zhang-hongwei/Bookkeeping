/**
 * AI Service Module
 * Export all AI-related functionality
 */

// Client
export { createAIClient } from './client';

// Prompts
export { COLOR_SYSTEM_PROMPT, buildColorPrompt, STYLE_ENHANCEMENTS } from './prompts/color-prompts';
export {
  VISION_SYSTEM_PROMPT,
  buildImageExtractionPrompt,
  UI_SCREENSHOT_PROMPT,
  PHOTO_PROMPT,
} from './prompts/vision-prompts';
export {
  GRADIENT_SYSTEM_PROMPT,
  buildGradientPrompt,
  GRADIENT_PRESETS,
} from './prompts/gradient-prompts';
export {
  COPY_SYSTEM_PROMPT,
  buildCopyPrompt,
  EXAMPLE_CONTEXTS,
} from './prompts/copy-prompts';
export {
  EMOTIONAL_PALETTE_SYSTEM_PROMPT,
  buildEmotionalPalettePrompt,
  EMOTIONAL_PALETTE_PRESETS,
} from './prompts/emotional-palette-prompts';

// Parsers
export {
  normalizeHexColor,
  generateColorName,
  parseColorResponse,
  exportAsCSS,
  exportAsJSON,
  exportAsTailwind,
} from './parsers/color-parser';
export type { RawColorResponse } from './parsers/color-parser';

// Fallback
export { FALLBACK_PALETTES, getFallbackPalette, getRandomFallbackPalette } from './fallback';
