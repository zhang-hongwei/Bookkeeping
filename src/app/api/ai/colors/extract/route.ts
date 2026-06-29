/**
 * Image Color Extraction API
 * POST /api/ai/colors/extract
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAIClient } from '@/lib/ai/client';
import { VISION_SYSTEM_PROMPT, buildImageExtractionPrompt } from '@/lib/ai/prompts/vision-prompts';
import { parseColorResponse } from '@/lib/ai/parsers/color-parser';
import { getRandomFallbackPalette } from '@/lib/ai/fallback';
import type { ColorExtractionRequest } from '@/types/ai';

export const runtime = 'edge';

// Maximum image size: 10MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const body: ColorExtractionRequest = await request.json();
    const { imageBase64, mimeType, colorCount = 6 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Validate image size (rough check based on base64 length)
    const sizeInBytes = (imageBase64.length * 3) / 4;
    if (sizeInBytes > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Check if AI is configured
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      const fallback = getRandomFallbackPalette();
      const palette = parseColorResponse({
        name: fallback.name,
        description: 'Fallback palette (AI not configured)',
        colors: fallback.colors,
        tags: ['fallback'],
      });

      return NextResponse.json({
        success: true,
        data: palette,
        fallback: true,
        message: 'AI service not configured, using fallback palette',
      });
    }

    // Prepare image data
    const imageData = imageBase64.includes('data:')
      ? imageBase64
      : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

    // Extract colors using AI Vision
    const client = createAIClient({ apiKey });
    const prompt = buildImageExtractionPrompt(colorCount);

    const response = await client.analyzeImageJSON<{
      name: string;
      description: string;
      colors: Array<{ hex: string; name: string; description: string }>;
      tags: string[];
    }>(imageData, prompt, VISION_SYSTEM_PROMPT);

    if (!response.success || !response.data) {
      const fallback = getRandomFallbackPalette();
      const palette = parseColorResponse({
        name: fallback.name,
        description: `Fallback palette (AI error: ${response.error})`,
        colors: fallback.colors,
        tags: ['fallback'],
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
    console.error('Image color extraction error:', error);
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
    message: 'Image Color Extraction API',
    usage: {
      method: 'POST',
      body: {
        imageBase64: 'string (required) - Base64 encoded image data',
        mimeType: 'string (optional) - Image MIME type (e.g., image/jpeg)',
        colorCount: 'number (optional, default: 6) - Number of colors to extract',
      },
    },
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxImageSize: '10MB',
  });
}
