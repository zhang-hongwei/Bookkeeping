/**
 * Color Palette Generation API
 * POST /api/ai/colors
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAIClient } from '@/lib/ai/client';
import { COLOR_SYSTEM_PROMPT, buildColorPrompt } from '@/lib/ai/prompts/color-prompts';
import { parseColorResponse } from '@/lib/ai/parsers/color-parser';
import { getFallbackPalette } from '@/lib/ai/fallback';
import type { ColorStyle, ColorGenerationRequest } from '@/types/ai';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body: ColorGenerationRequest = await request.json();
    const { prompt, style = 'modern', colorCount = 5 } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if AI is configured
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      // Return fallback palette
      const fallback = getFallbackPalette(style as ColorStyle);
      const palette = parseColorResponse({
        name: fallback.name,
        description: `Fallback palette based on "${style}" style`,
        colors: fallback.colors,
        tags: [style],
      });

      return NextResponse.json({
        success: true,
        data: palette,
        fallback: true,
        message: 'AI service not configured, using fallback palette',
      });
    }

    // Generate colors using AI
    const client = createAIClient({ apiKey });
    const userPrompt = buildColorPrompt(prompt, style as ColorStyle, colorCount);

    const response = await client.generateJSON<{
      name: string;
      description: string;
      colors: Array<{ hex: string; name: string; description: string }>;
      tags: string[];
    }>(userPrompt, COLOR_SYSTEM_PROMPT);

    if (!response.success || !response.data) {
      // Fallback on AI error
      const fallback = getFallbackPalette(style as ColorStyle);
      const palette = parseColorResponse({
        name: fallback.name,
        description: `Fallback palette (AI error: ${response.error})`,
        colors: fallback.colors,
        tags: [style],
      });

      return NextResponse.json({
        success: true,
        data: palette,
        fallback: true,
        message: response.error,
      });
    }

    // Parse and validate the response
    const palette = parseColorResponse(response.data);

    if (!palette) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: palette,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Color generation error:', error);
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
    message: 'Color Palette Generation API',
    usage: {
      method: 'POST',
      body: {
        prompt: 'string (required) - Description of desired color palette',
        style: 'string (optional) - modern, minimalist, vibrant, pastel, dark, earthy, ocean, sunset, forest, tech, retro, luxury',
        colorCount: 'number (optional, default: 5) - Number of colors to generate',
      },
    },
  });
}
