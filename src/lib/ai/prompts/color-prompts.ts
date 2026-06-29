/**
 * Color Palette Generation Prompts
 * Prompts for generating color palettes from text descriptions
 */

import type { ColorStyle } from '@/types/ai';

export const COLOR_SYSTEM_PROMPT = `You are an expert color designer and UI/UX specialist. Your task is to generate beautiful, accessible color palettes based on user descriptions.

## Output Format
Always respond with valid JSON in this exact format:
{
  "name": "Palette Name",
  "description": "Brief description of the palette's vibe and use cases",
  "colors": [
    {
      "hex": "#RRGGBB",
      "name": "Color Name",
      "description": "Brief description of when to use this color"
    }
  ],
  "tags": ["tag1", "tag2"]
}

## Rules
1. Generate exactly 5-6 colors per palette
2. Include a good mix of:
   - Primary/brand color
   - Secondary/accent colors
   - Background colors (light and/or dark)
   - Text/foreground colors
3. Ensure colors work well together harmoniously
4. Consider accessibility - colors should have good contrast
5. Use standard HEX format (#RRGGBB)
6. Provide meaningful English color names
7. Keep descriptions concise but helpful
8. Include 3-5 relevant tags

## Color Theory Guidelines
- Use complementary, analogous, or triadic color schemes
- Consider 60-30-10 rule for balanced palettes
- Include neutral colors for backgrounds and text
- Avoid too many saturated colors in one palette`;

/**
 * Build prompt for color palette generation
 */
export function buildColorPrompt(description: string, style?: ColorStyle, colorCount = 5): string {
  let prompt = `Generate a color palette based on this description: "${description}"`;

  if (style) {
    const styleDescriptions: Record<ColorStyle, string> = {
      modern: 'Modern style with clean, vibrant colors suitable for tech products',
      minimalist: 'Minimalist style with mostly neutral colors (black, white, gray) and subtle accents',
      vibrant: 'Vibrant style with bold, saturated colors that feel energetic',
      pastel: 'Pastel style with soft, muted colors that feel gentle and approachable',
      dark: 'Dark style with deep colors suitable for dark mode interfaces',
      earthy: 'Earthy style with natural, warm colors inspired by nature',
      ocean: 'Ocean style with blue and teal tones that feel calm and fresh',
      sunset: 'Sunset style with warm oranges, pinks, and purples',
      forest: 'Forest style with greens and browns inspired by woodland',
      tech: 'Tech style with blues, purples, and cyans for a futuristic feel',
      retro: 'Retro style with nostalgic colors from past decades',
      luxury: 'Luxury style with gold, black, and deep rich colors',
    };
    prompt += `\n\nStyle preference: ${styleDescriptions[style]}`;
  }

  prompt += `\n\nGenerate ${colorCount} colors for this palette.`;
  prompt += '\n\nRespond with valid JSON only, no markdown code blocks.';

  return prompt;
}

/**
 * Style-specific prompt enhancements
 */
export const STYLE_ENHANCEMENTS: Record<ColorStyle, string> = {
  modern: 'Focus on clean, crisp colors with good contrast. Think of modern SaaS products.',
  minimalist: 'Use a limited color palette, mostly neutrals with one accent color.',
  vibrant: 'Use high saturation colors that pop and grab attention.',
  pastel: 'Use colors with low saturation and high lightness for a soft look.',
  dark: 'Use dark backgrounds (#1a1a1a, #2d2d2d) with bright accent colors.',
  earthy: 'Include browns, tans, greens, and warm neutrals inspired by soil and plants.',
  ocean: 'Use various shades of blue and teal, from deep navy to aqua.',
  sunset: 'Use warm gradient-like colors: oranges, pinks, purples, and reds.',
  forest: 'Use various greens from moss to lime, plus wood browns.',
  tech: 'Use electric blues, purples, cyans, and subtle gradients.',
  retro: 'Use muted, nostalgic colors from the 60s, 70s, or 80s.',
  luxury: 'Use gold (#D4AF37), black, and deep jewel tones.',
};
