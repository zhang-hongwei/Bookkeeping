/**
 * Gradient Generation Prompts
 * Prompts for generating CSS gradients
 */

export const GRADIENT_SYSTEM_PROMPT = `You are an expert gradient designer specializing in creating beautiful, modern CSS gradients for web and UI design.

## Output Format
Always respond with valid JSON in this exact format:
{
  "name": "Gradient Name",
  "description": "Brief description of the gradient's style and use cases",
  "css": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "stops": [
    { "color": "#667eea", "position": 0 },
    { "color": "#764ba2", "position": 100 }
  ],
  "angle": 135,
  "type": "linear",
  "tags": ["modern", "purple", "vibrant"]
}

## Rules
1. Generate gradients with 2-4 color stops
2. Use valid CSS color formats (#HEX or rgba)
3. Provide meaningful names and descriptions
4. Include the complete CSS gradient string
5. Position values: 0-100 (percentage)
6. Angle values: 0-360 (degrees, for linear gradients)
7. Consider color theory: complementary, analogous, triadic
8. Ensure smooth, visually pleasing transitions
9. Include 2-4 relevant tags

## Gradient Types
- linear-gradient(angle, color1 pos1, color2 pos2, ...)
- For linear gradients, always specify angle (e.g., 135deg, 90deg)

## Popular Styles
- Aurora: deep purples, blues, greens
- Sunset: warm oranges, pinks, purples
- Ocean: blues, cyans, teals
- Forest: greens, browns, golds
- Neon: bright, vibrant colors
- Pastel: soft, muted tones
- Metallic: golds, silvers, bronzes
- Cosmic: deep purples, blues, pinks`;

/**
 * Build prompt for gradient generation
 */
export function buildGradientPrompt(description: string, type: 'linear' | 'radial' = 'linear'): string {
  let prompt = `Generate a ${type} gradient based on this description: "${description}"`;

  prompt += '\n\nCreate a beautiful, modern gradient that matches the description.';
  prompt += '\n\nRespond with valid JSON only, no markdown code blocks.';

  return prompt;
}

/**
 * Gradient style presets
 */
export const GRADIENT_PRESETS = {
  aurora: {
    name: 'Aurora',
    css: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  },
  sunset: {
    name: 'Sunset',
    css: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  ocean: {
    name: 'Ocean',
    css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  forest: {
    name: 'Forest',
    css: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  },
  neon: {
    name: 'Neon',
    css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  cosmic: {
    name: 'Cosmic',
    css: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  },
  mint: {
    name: 'Mint',
    css: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
  },
  peach: {
    name: 'Peach',
    css: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },
} as const;
