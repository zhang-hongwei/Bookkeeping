/**
 * Emotional Palette Generation API
 * POST /api/ai/emotional-palette
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAIClient } from '@/lib/ai/client';
import { EMOTIONAL_PALETTE_SYSTEM_PROMPT, buildEmotionalPalettePrompt, EMOTIONAL_PALETTE_PRESETS } from '@/lib/ai/prompts/emotional-palette-prompts';
import type { EmotionalPaletteRequest } from '@/types/emotional-palette';

export const runtime = 'edge';

type MoodCategory = 'warm' | 'cool' | 'energetic' | 'calm';

const MOOD_CATEGORIES: MoodCategory[] = ['warm', 'cool', 'energetic', 'calm'];

function getFallbackPalette(keyword: string): typeof EMOTIONAL_PALETTE_PRESETS[MoodCategory] {
  const lower = keyword.toLowerCase();

  if (/暖|温|comfort|cozy|warm|heal|治愈|食堂|家/.test(lower)) {
    return EMOTIONAL_PALETTE_PRESETS.warm;
  }
  if (/冷|冰|cool|ice|tech|cyber|赛博|科技|编/.test(lower)) {
    return EMOTIONAL_PALETTE_PRESETS.cool;
  }
  if (/热|激|运动|fire|hot|energ|vibrant|活力|热带|极限/.test(lower)) {
    return EMOTIONAL_PALETTE_PRESETS.energetic;
  }
  if (/静|冥|calm|peace|meditat|forest|焦虑|缓解|宁静|森林/.test(lower)) {
    return EMOTIONAL_PALETTE_PRESETS.calm;
  }

  // Random fallback
  const randomCategory = MOOD_CATEGORIES[Math.floor(Math.random() * MOOD_CATEGORIES.length)];
  return EMOTIONAL_PALETTE_PRESETS[randomCategory];
}

export async function POST(request: NextRequest) {
  try {
    const body: EmotionalPaletteRequest = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if AI is configured
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      const fallback = getFallbackPalette(prompt);
      return NextResponse.json({
        success: true,
        data: {
          ...fallback,
          description: `Fallback palette for "${prompt}" — ${fallback.description}`,
        },
        fallback: true,
        message: 'AI service not configured, using fallback palette',
      });
    }

    // Generate emotional palette using AI
    const client = createAIClient({ apiKey });
    const userPrompt = buildEmotionalPalettePrompt(prompt);

    const response = await client.generateJSON<{
      mood: string;
      moodEn: string;
      description: string;
      colors: Array<{ hex: string; name: string; description: string }>;
      gradients: Array<{
        name: string;
        css: string;
        stops: Array<{ color: string; position: number }>;
        angle: number;
        type: 'linear' | 'radial';
        opacity: number;
      }>;
      motion: {
        duration: { fast: number; normal: number; slow: number };
        easing: string;
        animationType: string;
        rhythm: string;
      };
      typography: {
        headingFont: string;
        bodyFont: string;
        headingWeight: number;
        bodyWeight: number;
        letterSpacing: number;
        lineHeight: number;
        scaleRatio: number;
      };
      tags: string[];
    }>(userPrompt, EMOTIONAL_PALETTE_SYSTEM_PROMPT);

    if (!response.success || !response.data) {
      const fallback = getFallbackPalette(prompt);
      return NextResponse.json({
        success: true,
        data: {
          ...fallback,
          description: `Fallback palette (AI error) — ${fallback.description}`,
        },
        fallback: true,
        message: response.error,
      });
    }

    const data = response.data;

    // Normalize and validate
    const palette = {
      mood: data.mood || prompt,
      moodEn: data.moodEn || prompt,
      description: data.description || '',
      colors: (data.colors || []).map((c) => ({
        hex: c.hex?.startsWith('#') ? c.hex : `#${c.hex}`,
        name: c.name || 'Unnamed',
        description: c.description || '',
      })),
      gradients: (data.gradients || []).map((g) => ({
        name: g.name || 'Gradient',
        css: g.css || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        stops: (g.stops || []).map((s) => ({
          color: s.color?.startsWith('#') ? s.color : `#${s.color}`,
          position: Math.max(0, Math.min(100, s.position || 0)),
        })),
        angle: g.angle ?? 135,
        type: g.type === 'radial' ? 'radial' as const : 'linear' as const,
        opacity: Math.max(0, Math.min(1, g.opacity ?? 0.85)),
      })),
      motion: {
        duration: {
          fast: Math.max(50, data.motion?.duration?.fast ?? 200),
          normal: Math.max(100, data.motion?.duration?.normal ?? 500),
          slow: Math.max(200, data.motion?.duration?.slow ?? 1000),
        },
        easing: data.motion?.easing || 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
        animationType: ['gentle', 'bounce', 'smooth', 'elastic'].includes(data.motion?.animationType)
          ? (data.motion.animationType as 'gentle' | 'bounce' | 'smooth' | 'elastic')
          : 'gentle' as const,
        rhythm: ['calm', 'moderate', 'energetic', 'intense'].includes(data.motion?.rhythm)
          ? (data.motion.rhythm as 'calm' | 'moderate' | 'energetic' | 'intense')
          : 'moderate' as const,
      },
      typography: {
        headingFont: data.typography?.headingFont || 'Inter',
        bodyFont: data.typography?.bodyFont || 'Inter',
        headingWeight: Math.max(100, Math.min(900, data.typography?.headingWeight ?? 700)),
        bodyWeight: Math.max(100, Math.min(900, data.typography?.bodyWeight ?? 400)),
        letterSpacing: data.typography?.letterSpacing ?? 0.02,
        lineHeight: Math.max(1, Math.min(2.5, data.typography?.lineHeight ?? 1.6)),
        scaleRatio: Math.max(1.1, Math.min(1.618, data.typography?.scaleRatio ?? 1.25)),
      },
      tags: data.tags || [],
    };

    return NextResponse.json({
      success: true,
      data: palette,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Emotional palette generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Emotional Palette Generation API',
    usage: {
      method: 'POST',
      body: {
        prompt: 'string (required) - Emotional keyword or phrase (e.g. "深夜食堂", "anxiety relief")',
        language: 'string (optional) - "zh" | "en"',
      },
    },
    examplePrompts: ['深夜食堂', '赛博禅意', '焦虑缓解', '热带风暴', '森林浴', 'digital detox'],
  });
}
