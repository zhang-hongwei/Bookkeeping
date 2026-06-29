/**
 * Gradient Generation API
 * POST /api/ai/gradients
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAIClient } from '@/lib/ai/client';
import { GRADIENT_SYSTEM_PROMPT, buildGradientPrompt, GRADIENT_PRESETS } from '@/lib/ai/prompts/gradient-prompts';
import type { GradientGenerationRequest, GradientInfo } from '@/types/ai';

export const runtime = 'edge';

interface RawGradientResponse {
  name: string;
  description: string;
  css: string;
  stops: Array<{ color: string; position: number }>;
  angle?: number;
  type: 'linear' | 'radial';
  tags?: string[];
}

/**
 * Validate and normalize gradient response
 */
function validateGradientResponse(raw: RawGradientResponse): GradientInfo | null {
  if (!raw.css || !raw.stops || raw.stops.length < 2) {
    return null;
  }

  // Validate color stops
  const stops = raw.stops.map((stop) => ({
    color: normalizeColor(stop.color),
    position: Math.max(0, Math.min(100, stop.position)),
  }));

  return {
    type: raw.type || 'linear',
    angle: raw.angle || 135,
    stops,
    css: raw.css,
  };
}

/**
 * Normalize color to valid format
 */
function normalizeColor(color: string): string {
  // Already valid hex
  if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
    return color;
  }

  // Already valid rgba
  if (/^rgba?\([^)]+\)$/.test(color)) {
    return color;
  }

  // Return as-is and hope it's valid
  return color;
}

export async function POST(request: NextRequest) {
  try {
    const body: GradientGenerationRequest = await request.json();
    const { prompt, type = 'linear' } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if AI is configured
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      // Return a random preset as fallback
      const presetKeys = Object.keys(GRADIENT_PRESETS) as Array<keyof typeof GRADIENT_PRESETS>;
      const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)];
      const preset = GRADIENT_PRESETS[randomKey];

      return NextResponse.json({
        success: true,
        data: {
          name: preset.name,
          type: 'linear' as const,
          css: preset.css,
          stops: parseStopsFromCss(preset.css),
          angle: 135,
        },
        fallback: true,
        message: 'AI service not configured, using preset gradient',
      });
    }

    // Generate gradient using AI
    const client = createAIClient({ apiKey });
    const userPrompt = buildGradientPrompt(prompt, type);

    const response = await client.generateJSON<RawGradientResponse>(userPrompt, GRADIENT_SYSTEM_PROMPT);

    if (!response.success || !response.data) {
      // Fallback to preset
      const presetKeys = Object.keys(GRADIENT_PRESETS) as Array<keyof typeof GRADIENT_PRESETS>;
      const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)];
      const preset = GRADIENT_PRESETS[randomKey];

      return NextResponse.json({
        success: true,
        data: {
          name: preset.name,
          type: 'linear' as const,
          css: preset.css,
          stops: parseStopsFromCss(preset.css),
          angle: 135,
        },
        fallback: true,
        message: response.error,
      });
    }

    // Validate and normalize response
    const gradient = validateGradientResponse(response.data);

    if (!gradient) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse gradient response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...gradient,
        name: response.data.name,
        description: response.data.description,
        tags: response.data.tags,
      },
      usage: response.usage,
    });
  } catch (error) {
    console.error('Gradient generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Parse color stops from CSS gradient string
 */
function parseStopsFromCss(css: string): Array<{ color: string; position: number }> {
  const stops: Array<{ color: string; position: number }> = [];

  // Match color and position pairs
  const regex = /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s+(\d+(?:\.\d+)?%?)/g;
  let match;

  while ((match = regex.exec(css)) !== null) {
    let position = parseFloat(match[2]);
    if (!match[2].includes('%')) {
      position = position * 100; // Convert 0-1 to 0-100
    }
    stops.push({
      color: match[1],
      position,
    });
  }

  return stops;
}

export async function GET() {
  return NextResponse.json({
    message: 'Gradient Generation API',
    usage: {
      method: 'POST',
      body: {
        prompt: 'string (required) - Description of desired gradient',
        type: 'string (optional) - linear or radial, default: linear',
      },
    },
    presets: GRADIENT_PRESETS,
  });
}
