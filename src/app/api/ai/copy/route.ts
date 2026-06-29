/**
 * Copy Writing API
 * POST /api/ai/copy
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAIClient } from '@/lib/ai/client';
import { COPY_SYSTEM_PROMPT, buildCopyPrompt } from '@/lib/ai/prompts/copy-prompts';
import type { CopyGenerationRequest, CopySuggestion, CopyType, CopyTone } from '@/types/ai';
import { COPY_TYPES, COPY_TONES } from '@/types/ai';

export const runtime = 'edge';

interface RawCopyResponse {
  suggestions: Array<{
    text: string;
    characterCount: number;
  }>;
}

/**
 * Fallback suggestions for each type
 */
const FALLBACK_SUGGESTIONS: Record<CopyType, CopySuggestion[]> = {
  button: [
    { text: 'Submit', characterCount: 6 },
    { text: 'Continue', characterCount: 8 },
    { text: 'Get Started', characterCount: 10 },
  ],
  heading: [
    { text: 'Welcome', characterCount: 7 },
    { text: 'Get Started Today', characterCount: 16 },
    { text: 'Your Dashboard', characterCount: 14 },
  ],
  description: [
    { text: 'Create and manage your projects with ease.', characterCount: 42 },
    { text: 'A powerful tool for modern teams.', characterCount: 32 },
    { text: 'Simplify your workflow today.', characterCount: 27 },
  ],
  error: [
    { text: 'Something went wrong. Please try again.', characterCount: 37 },
    { text: 'An error occurred. Please refresh the page.', characterCount: 42 },
    { text: "We couldn't complete your request. Please try again.", characterCount: 51 },
  ],
  success: [
    { text: 'Success! Your changes have been saved.', characterCount: 38 },
    { text: 'All done! Your request was processed.', characterCount: 38 },
    { text: 'Great! Everything is complete.', characterCount: 29 },
  ],
  placeholder: [
    { text: 'Enter text...', characterCount: 13 },
    { text: 'Type here...', characterCount: 12 },
    { text: 'Start typing...', characterCount: 15 },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body: CopyGenerationRequest = await request.json();
    const { type = 'button', context, tone = 'friendly', count = 3 } = body;

    if (!context || typeof context !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Context is required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!COPY_TYPES[type as CopyType]) {
      return NextResponse.json(
        { success: false, error: `Invalid type: ${type}` },
        { status: 400 }
      );
    }

    // Validate tone
    if (!COPY_TONES[tone as CopyTone]) {
      return NextResponse.json(
        { success: false, error: `Invalid tone: ${tone}` },
        { status: 400 }
      );
    }

    // Check if AI is configured
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: FALLBACK_SUGGESTIONS[type as CopyType].slice(0, count),
        },
        fallback: true,
        message: 'AI service not configured, using fallback suggestions',
      });
    }

    // Generate copy using AI
    const client = createAIClient({ apiKey });
    const prompt = buildCopyPrompt(type as CopyType, context, tone as CopyTone, count);

    const response = await client.generateJSON<RawCopyResponse>(prompt, COPY_SYSTEM_PROMPT);

    if (!response.success || !response.data) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: FALLBACK_SUGGESTIONS[type as CopyType].slice(0, count),
        },
        fallback: true,
        message: response.error,
      });
    }

    // Validate and normalize suggestions
    const suggestions: CopySuggestion[] = response.data.suggestions.map((s) => ({
      text: s.text || '',
      characterCount: s.text?.length || 0,
    }));

    return NextResponse.json({
      success: true,
      data: { suggestions },
      usage: response.usage,
    });
  } catch (error) {
    console.error('Copy generation error:', error);
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
    message: 'Copy Writing Assistant API',
    usage: {
      method: 'POST',
      body: {
        type: 'string (required) - button, heading, description, error, success, placeholder',
        context: 'string (required) - Context or description for the copy',
        tone: 'string (optional) - formal, casual, friendly, professional, playful',
        count: 'number (optional, default: 3) - Number of suggestions',
      },
    },
    types: COPY_TYPES,
    tones: COPY_TONES,
  });
}
