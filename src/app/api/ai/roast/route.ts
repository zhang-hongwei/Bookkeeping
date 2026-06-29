/**
 * Roast Generation API
 * POST /api/ai/roast
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAIClient } from '@/lib/ai/client';
import { ROAST_SYSTEM_PROMPT, buildRoastPrompt, getFallbackRoastResult } from '@/lib/ai/prompts/roast-prompts';

export const runtime = 'edge';

interface RawRoastResponse {
  variants: Array<{
    persona: string;
    text: string;
    tags: string[];
  }>;
}

const VALID_PERSONAS = ['toxic', 'highEQ', 'worker', 'goofy'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: '请输入一句话' },
        { status: 400 }
      );
    }

    if (text.length > 100) {
      return NextResponse.json(
        { success: false, error: '文字不能超过100个字符' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: getFallbackRoastResult(text),
        fallback: true,
        message: 'AI service not configured, using fallback',
      });
    }

    const client = createAIClient({ apiKey });
    const prompt = buildRoastPrompt(text);

    const response = await client.generateJSON<RawRoastResponse>(prompt, ROAST_SYSTEM_PROMPT);

    if (!response.success || !response.data) {
      return NextResponse.json({
        success: true,
        data: getFallbackRoastResult(text),
        fallback: true,
        message: response.error,
      });
    }

    // Validate and sanitize AI output
    const variants = response.data.variants.map((item) => ({
      persona: VALID_PERSONAS.includes(item.persona) ? item.persona : 'toxic',
      text: item.text || text,
      tags: Array.isArray(item.tags) ? item.tags.slice(0, 3) : [],
    }));

    // Ensure all 4 personas are present
    const presentPersonas = new Set(variants.map((v) => v.persona));
    for (const p of VALID_PERSONAS) {
      if (!presentPersonas.has(p)) {
        variants.push({
          persona: p,
          text: text,
          tags: ['#吐槽', '#日常'],
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { original: text, variants },
      usage: response.usage,
    });
  } catch (error) {
    console.error('Roast generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Roast Generator API',
    usage: {
      method: 'POST',
      body: { text: 'string (required, max 100 chars) - The sentence to roast' },
    },
  });
}
