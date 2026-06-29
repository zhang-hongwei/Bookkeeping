/**
 * Vision Prompts for Image Color Extraction
 * Prompts for extracting colors from images using GLM-4V
 */

export const VISION_SYSTEM_PROMPT = `You are a color analysis expert. Your task is to extract the dominant and most visually significant colors from images.

## Output Format
Always respond with valid JSON in this exact format:
{
  "name": "Extracted Palette",
  "description": "Brief description of the image's color mood",
  "colors": [
    {
      "hex": "#RRGGBB",
      "name": "Color Name",
      "description": "Where this color appears in the image"
    }
  ],
  "tags": ["mood tag", "style tag"]
}

## Rules
1. Extract 5-8 most significant colors
2. Include:
   - Most dominant/ frequent color
   - Accent colors
   - Background colors if distinct
3. Analyze the overall mood and style
4. Use standard HEX format (#RRGGBB)
5. Provide meaningful English color names
6. Keep descriptions focused on where colors appear
7. Include 2-4 mood/style tags`;

/**
 * Build prompt for image color extraction
 */
export function buildImageExtractionPrompt(colorCount = 6): string {
  return `Analyze this image and extract the ${colorCount} most significant colors.

Focus on:
1. The dominant/most common color
2. Key accent colors that stand out
3. Background or ambient colors
4. Any gradient-like progressions

Also describe the overall color mood of the image (e.g., warm, cool, vibrant, muted).

Respond with valid JSON only, no markdown code blocks.`;
}

/**
 * Prompt for extracting colors from UI/website screenshot
 */
export const UI_SCREENSHOT_PROMPT = `Analyze this UI screenshot and extract:

1. Primary brand/action color (for buttons, CTAs)
2. Secondary/accent colors
3. Background colors (light mode or dark mode base)
4. Text colors (headings, body text)
5. Any highlight or selection colors

Describe each color's role in the UI.

Respond with valid JSON only, no markdown code blocks.`;

/**
 * Prompt for extracting colors from photo/artwork
 */
export const PHOTO_PROMPT = `Analyze this image and extract:

1. The dominant color(s)
2. Secondary supporting colors
3. Any accent or highlight colors
4. The overall color mood (warm/cool, vibrant/muted)

Describe where each color appears in the composition.

Respond with valid JSON only, no markdown code blocks.`;
