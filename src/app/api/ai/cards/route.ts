/**
 * Card Generation API
 * POST /api/ai/cards
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAIClient } from '@/lib/ai/client';
import { CARD_SYSTEM_PROMPT, buildCardPrompt, getFallbackResult } from '@/lib/ai/prompts/card-prompts';

export const runtime = 'edge';

interface RawCardResponse {
  enhancedTexts: Array<{
    text: string;
    keywords: string[];
    emotion: string;
    tags: string[];
    styleId: string;
  }>;
  suggestedStyle: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, count = 3 } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: '请输入一句话' },
        { status: 400 }
      );
    }

    if (text.length > 200) {
      return NextResponse.json(
        { success: false, error: '文字不能超过200个字符' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: getFallbackResult(text),
        fallback: true,
        message: 'AI service not configured, using fallback',
      });
    }

    const client = createAIClient({ apiKey });
    const prompt = buildCardPrompt(text, count);

    const response = await client.generateJSON<RawCardResponse>(prompt, CARD_SYSTEM_PROMPT);

    if (!response.success || !response.data) {
      return NextResponse.json({
        success: true,
        data: getFallbackResult(text),
        fallback: true,
        message: response.error,
      });
    }

    const validStyles = ['minimal', 'emotional', 'tech', 'business', 'diary', 'poster'];
    const validEmotions = ['positive', 'reflective', 'low', 'showoff', 'neutral'];

    const enhancedTexts = response.data.enhancedTexts.map((item) => ({
      text: item.text || text,
      keywords: Array.isArray(item.keywords) ? item.keywords.slice(0, 3) : [],
      emotion: validEmotions.includes(item.emotion) ? item.emotion : 'neutral',
      tags: Array.isArray(item.tags) ? item.tags.slice(0, 3) : [],
      styleId: validStyles.includes(item.styleId) ? item.styleId : 'minimal',
    }));

    return NextResponse.json({
      success: true,
      data: {
        original: text,
        enhancedTexts,
        suggestedStyle: validStyles.includes(response.data.suggestedStyle)
          ? response.data.suggestedStyle
          : 'minimal',
      },
      usage: response.usage,
    });
  } catch (error) {
    console.error('Card generation error:', error);
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
    message: 'AI Card Generator API',
    usage: {
      method: 'POST',
      body: {
        text: 'string (required, max 200 chars) - The sentence to enhance',
        count: 'number (optional, default: 3) - Number of card variations',
      },
    },
  });
}
