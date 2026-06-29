/**
 * Emotional Palette Generation Prompts
 * Prompts for generating complete emotional atmosphere suites from mood keywords
 */

export const EMOTIONAL_PALETTE_SYSTEM_PROMPT = `You are an expert emotional design system architect. Your task is to translate emotional keywords or phrases into a complete, cohesive visual atmosphere system.

## Output Format
Always respond with valid JSON in this exact format:
{
  "mood": "情绪名称(中文)",
  "moodEn": "Mood Name (English)",
  "description": "Brief description of the emotional atmosphere and suitable use cases",
  "colors": [
    {
      "hex": "#RRGGBB",
      "name": "Color Name",
      "description": "Role: primary/secondary/background/text/accent"
    }
  ],
  "gradients": [
    {
      "name": "Gradient Name",
      "css": "linear-gradient(135deg, #color1 0%, #color2 50%, #color3 100%)",
      "stops": [
        { "color": "#color1", "position": 0 },
        { "color": "#color2", "position": 50 },
        { "color": "#color3", "position": 100 }
      ],
      "angle": 135,
      "type": "linear",
      "opacity": 0.8
    }
  ],
  "motion": {
    "duration": { "fast": 200, "normal": 500, "slow": 1000 },
    "easing": "cubic-bezier(0.4, 0.0, 0.2, 1.0)",
    "animationType": "gentle|bounce|smooth|elastic",
    "rhythm": "calm|moderate|energetic|intense"
  },
  "typography": {
    "headingFont": "Font family name",
    "bodyFont": "Font family name",
    "headingWeight": 700,
    "bodyWeight": 400,
    "letterSpacing": 0.02,
    "lineHeight": 1.6,
    "scaleRatio": 1.25
  },
  "tags": ["tag1", "tag2", "tag3"]
}

## Emotional Color Theory Rules

### Color Generation (6-8 colors)
1. Analyze the emotional keyword into dimensions: warmth (0-1), energy (0-1), tension (0-1), nostalgia (0-1)
2. Map dimensions to color ranges:
   - High warmth → warm hues (red-orange-yellow, 0°-60°), golden tones
   - Low warmth → cool hues (blue-cyan-purple, 180°-300°), icy tones
   - High energy → high saturation (70-100%), vivid colors
   - Low energy → low saturation (20-50%), muted/desaturated colors
   - High tension → high contrast, complementary colors, sharp transitions
   - Low tension → low contrast, analogous colors, smooth transitions
   - High nostalgia → slightly desaturated, warm undertones, vintage feel
   - Low nostalgia → clean, modern, crisp colors
3. Include: 1 primary, 1-2 secondary, 2 background (light+dark), 1-2 text colors
4. Use standard HEX format (#RRGGBB)

### Gradient Generation (2-3 gradients)
1. Create gradients derived from the main palette colors
2. First gradient: primary atmosphere background
3. Second gradient: subtle overlay or accent gradient
4. Third gradient: complementary or variation
5. Use 2-4 color stops per gradient
6. Choose angles that match the emotion:
   - Calm/serene: 135deg-180deg (flowing, diagonal-down)
   - Energetic: 45deg-90deg (ascending, uplifting)
   - Warm: 90deg-135deg (sun-like)
   - Cool: 180deg-270deg (flowing water)

### Motion Parameters
1. Duration mapping:
   - Calm/serene: slow (800-1200ms), normal (400-600ms), fast (150-300ms)
   - Energetic: slow (400-600ms), normal (200-350ms), fast (80-150ms)
   - Tense: slow (600-900ms), normal (300-500ms), fast (100-200ms)
2. Easing: match emotional quality
   - Gentle: cubic-bezier(0.4, 0.0, 0.2, 1.0) - ease-out
   - Bouncy: cubic-bezier(0.68, -0.55, 0.265, 1.55)
   - Smooth: cubic-bezier(0.25, 0.1, 0.25, 1.0) - ease
   - Elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275)
3. Animation type and rhythm must match the emotional keyword

### Typography Suggestions
1. Font weight: heavier for warmth/energy, lighter for calm/cool
2. Letter spacing: wider for elegance/calm, tighter for energy/density
3. Line height: larger for readability/calm, compact for dense/energetic
4. Scale ratio:
   - Calm/elegant: 1.333 (perfect fourth)
   - Modern/tech: 1.25 (major third)
   - Dramatic: 1.5 (perfect fifth)
   - Subtle: 1.2 (minor third)
5. Suggest web-safe or popular Google Fonts only

## Cross-Dimension Coherence
All four outputs (colors, gradients, motion, typography) MUST feel unified:
- Colors and gradients share the same hue family
- Motion speed matches color saturation and warmth
- Typography weight matches the energy level
- The entire system should evoke the input keyword's emotion at first glance`;

/**
 * Build prompt for emotional palette generation
 */
export function buildEmotionalPalettePrompt(keyword: string): string {
  let prompt = `Generate a complete emotional atmosphere design system for: "${keyword}"`;

  prompt += '\n\nAnalyze the emotional quality of this keyword and generate a cohesive system.';
  prompt += '\nThe colors, gradients, motion parameters, and typography must all feel unified and evoke the same emotion.';
  prompt += '\n\nRespond with valid JSON only, no markdown code blocks.';

  return prompt;
}

/**
 * Fallback emotional palette presets
 */
export const EMOTIONAL_PALETTE_PRESETS = {
  warm: {
    mood: '温暖治愈',
    moodEn: 'Warm & Healing',
    description: '温暖柔和的氛围，适合生活类、情感类产品',
    colors: [
      { hex: '#D4A574', name: 'Caramel', description: 'Primary: warm caramel tone' },
      { hex: '#E8C9A0', name: 'Peach Cream', description: 'Secondary: soft peach' },
      { hex: '#FFF8F0', name: 'Warm White', description: 'Background: warm white' },
      { hex: '#2C1810', name: 'Dark Cocoa', description: 'Text: deep brown' },
      { hex: '#C17F59', name: 'Terracotta', description: 'Accent: earthy warm' },
      { hex: '#8B5E3C', name: 'Chestnut', description: 'Secondary: rich brown' },
    ],
    gradients: [
      {
        name: 'Warm Glow',
        css: 'linear-gradient(135deg, #D4A574 0%, #E8C9A0 50%, #FFF8F0 100%)',
        stops: [
          { color: '#D4A574', position: 0 },
          { color: '#E8C9A0', position: 50 },
          { color: '#FFF8F0', position: 100 },
        ],
        angle: 135,
        type: 'linear' as const,
        opacity: 0.85,
      },
      {
        name: 'Sunset Amber',
        css: 'linear-gradient(90deg, #C17F59 0%, #D4A574 100%)',
        stops: [
          { color: '#C17F59', position: 0 },
          { color: '#D4A574', position: 100 },
        ],
        angle: 90,
        type: 'linear' as const,
        opacity: 0.7,
      },
    ],
    motion: {
      duration: { fast: 250, normal: 500, slow: 900 },
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
      animationType: 'gentle' as const,
      rhythm: 'calm' as const,
    },
    typography: {
      headingFont: 'Noto Serif SC',
      bodyFont: 'Noto Sans SC',
      headingWeight: 700,
      bodyWeight: 400,
      letterSpacing: 0.02,
      lineHeight: 1.7,
      scaleRatio: 1.333,
    },
    tags: ['warm', 'healing', 'comfort', 'cozy'],
  },
  cool: {
    mood: '冷静深邃',
    moodEn: 'Cool & Deep',
    description: '冷静科技感的氛围，适合技术产品、数据分析',
    colors: [
      { hex: '#4A90D9', name: 'Steel Blue', description: 'Primary: tech blue' },
      { hex: '#7B68EE', name: 'Slate Purple', description: 'Secondary: cool purple' },
      { hex: '#0D1B2A', name: 'Midnight', description: 'Background: deep dark' },
      { hex: '#E0E6ED', name: 'Ice Gray', description: 'Text: light cool gray' },
      { hex: '#00D4FF', name: 'Electric Cyan', description: 'Accent: neon highlight' },
      { hex: '#1B2838', name: 'Charcoal', description: 'Secondary: dark surface' },
    ],
    gradients: [
      {
        name: 'Digital Depth',
        css: 'linear-gradient(180deg, #0D1B2A 0%, #1B2838 50%, #4A90D9 100%)',
        stops: [
          { color: '#0D1B2A', position: 0 },
          { color: '#1B2838', position: 50 },
          { color: '#4A90D9', position: 100 },
        ],
        angle: 180,
        type: 'linear' as const,
        opacity: 0.9,
      },
      {
        name: 'Neon Edge',
        css: 'linear-gradient(45deg, #7B68EE 0%, #00D4FF 100%)',
        stops: [
          { color: '#7B68EE', position: 0 },
          { color: '#00D4FF', position: 100 },
        ],
        angle: 45,
        type: 'linear' as const,
        opacity: 0.6,
      },
    ],
    motion: {
      duration: { fast: 150, normal: 350, slow: 700 },
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
      animationType: 'smooth' as const,
      rhythm: 'moderate' as const,
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: 600,
      bodyWeight: 300,
      letterSpacing: 0.01,
      lineHeight: 1.6,
      scaleRatio: 1.25,
    },
    tags: ['cool', 'tech', 'deep', 'digital'],
  },
  energetic: {
    mood: '活力充沛',
    moodEn: 'Energetic & Vibrant',
    description: '充满能量的活跃氛围，适合运动、社交、创意产品',
    colors: [
      { hex: '#FF6B35', name: 'Blazing Orange', description: 'Primary: hot energy' },
      { hex: '#FFD23F', name: 'Electric Yellow', description: 'Secondary: bright spark' },
      { hex: '#1A1A2E', name: 'Deep Navy', description: 'Background: dark contrast' },
      { hex: '#FFFFFF', name: 'Pure White', description: 'Text: clean white' },
      { hex: '#E63946', name: 'Vivid Red', description: 'Accent: bold punch' },
      { hex: '#06D6A0', name: 'Neon Green', description: 'Secondary: fresh energy' },
    ],
    gradients: [
      {
        name: 'Fire Storm',
        css: 'linear-gradient(45deg, #FF6B35 0%, #E63946 50%, #FFD23F 100%)',
        stops: [
          { color: '#FF6B35', position: 0 },
          { color: '#E63946', position: 50 },
          { color: '#FFD23F', position: 100 },
        ],
        angle: 45,
        type: 'linear' as const,
        opacity: 0.95,
      },
      {
        name: 'Neon Pulse',
        css: 'linear-gradient(90deg, #06D6A0 0%, #FFD23F 100%)',
        stops: [
          { color: '#06D6A0', position: 0 },
          { color: '#FFD23F', position: 100 },
        ],
        angle: 90,
        type: 'linear' as const,
        opacity: 0.8,
      },
    ],
    motion: {
      duration: { fast: 100, normal: 250, slow: 500 },
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      animationType: 'bounce' as const,
      rhythm: 'energetic' as const,
    },
    typography: {
      headingFont: 'Montserrat',
      bodyFont: 'Poppins',
      headingWeight: 800,
      bodyWeight: 500,
      letterSpacing: -0.01,
      lineHeight: 1.4,
      scaleRatio: 1.5,
    },
    tags: ['energetic', 'vibrant', 'bold', 'dynamic'],
  },
  calm: {
    mood: '宁静平和',
    moodEn: 'Calm & Peaceful',
    description: '安静平和的氛围，适合冥想、健康、教育类产品',
    colors: [
      { hex: '#5B8A72', name: 'Sage Green', description: 'Primary: natural calm' },
      { hex: '#A7C4BC', name: 'Mint Fog', description: 'Secondary: soft mint' },
      { hex: '#F5F0EB', name: 'Warm Linen', description: 'Background: natural white' },
      { hex: '#2D3A35', name: 'Deep Moss', description: 'Text: dark green' },
      { hex: '#8FA89A', name: 'Dusty Leaf', description: 'Accent: muted green' },
      { hex: '#E8DFD5', name: 'Sand Stone', description: 'Secondary: warm neutral' },
    ],
    gradients: [
      {
        name: 'Forest Mist',
        css: 'linear-gradient(135deg, #5B8A72 0%, #A7C4BC 50%, #F5F0EB 100%)',
        stops: [
          { color: '#5B8A72', position: 0 },
          { color: '#A7C4BC', position: 50 },
          { color: '#F5F0EB', position: 100 },
        ],
        angle: 135,
        type: 'linear' as const,
        opacity: 0.8,
      },
      {
        name: 'Morning Dew',
        css: 'linear-gradient(180deg, #A7C4BC 0%, #E8DFD5 100%)',
        stops: [
          { color: '#A7C4BC', position: 0 },
          { color: '#E8DFD5', position: 100 },
        ],
        angle: 180,
        type: 'linear' as const,
        opacity: 0.6,
      },
    ],
    motion: {
      duration: { fast: 300, normal: 600, slow: 1200 },
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
      animationType: 'gentle' as const,
      rhythm: 'calm' as const,
    },
    typography: {
      headingFont: 'Lora',
      bodyFont: 'Source Sans 3',
      headingWeight: 500,
      bodyWeight: 300,
      letterSpacing: 0.03,
      lineHeight: 1.8,
      scaleRatio: 1.333,
    },
    tags: ['calm', 'peaceful', 'natural', 'serene'],
  },
} as const;
