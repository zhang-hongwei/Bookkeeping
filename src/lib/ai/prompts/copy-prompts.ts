/**
 * Copy Writing Prompts
 * Prompts for generating UI copy and text content
 */

import type { CopyType, CopyTone } from '@/types/ai';

export const COPY_SYSTEM_PROMPT = `You are an expert UX writer and copywriter specializing in creating clear, engaging, and user-friendly text for digital products.

## Output Format
Always respond with valid JSON in this exact format:
{
  "suggestions": [
    {
      "text": "The generated text",
      "characterCount": 25
    }
  ]
}

## Rules
1. Generate 3-5 different variations
2. Keep text concise and appropriate for the context
3. Include character count for each suggestion
4. Consider the specified tone and type
5. Make text actionable when appropriate (especially for buttons)
6. Use inclusive and accessible language
7. Avoid jargon and technical terms when possible
8. Be consistent with common UI patterns

## Copy Types Guidelines
- button: Short (2-4 words), action-oriented, starts with a verb
- heading: Clear, descriptive, 3-8 words typically
- description: Informative, 1-3 sentences, explains the value or purpose
- error: Helpful, explains what went wrong and how to fix it
- success: Positive, confirms the action, tells what's next
- placeholder: Short hint text, shows expected input format

## Tone Guidelines
- formal: Professional, objective, suitable for enterprise/B2B
- casual: Friendly, conversational, uses contractions
- friendly: Warm, approachable, empathetic
- professional: Clear, direct, competent but not cold
- playful: Fun, creative, may use wordplay or humor`;

/**
 * Build prompt for copy generation
 */
export function buildCopyPrompt(
  type: CopyType,
  context: string,
  tone: CopyTone = 'friendly',
  count: number = 3
): string {
  const typeDescriptions: Record<CopyType, string> = {
    button: 'a button label (short, action-oriented, 2-4 words)',
    heading: 'a heading or title (clear, descriptive, 3-8 words)',
    description: 'a description text (informative, 1-3 sentences)',
    error: 'an error message (helpful, explains the issue and solution)',
    success: 'a success message (positive, confirms action, tells what\'s next)',
    placeholder: 'a placeholder text (short hint, shows expected input)',
  };

  const toneDescriptions: Record<CopyTone, string> = {
    formal: 'formal and professional',
    casual: 'casual and conversational',
    friendly: 'friendly and approachable',
    professional: 'professional and direct',
    playful: 'playful and creative',
  };

  let prompt = `Generate ${typeDescriptions[type]} for the following context:`;

  prompt += `\n\nContext: "${context}"`;
  prompt += `\n\nTone: ${toneDescriptions[tone]}`;
  prompt += `\n\nGenerate ${count} different variations.`;
  prompt += '\n\nRespond with valid JSON only, no markdown code blocks.';

  return prompt;
}

/**
 * Example contexts for each type
 */
export const EXAMPLE_CONTEXTS: Record<CopyType, string[]> = {
  button: [
    'Submit a contact form',
    'Create a new project',
    'Delete an item permanently',
    'Subscribe to newsletter',
    'Start free trial',
  ],
  heading: [
    'Pricing section on landing page',
    'Features overview section',
    'Error page when not found',
    'Success page after purchase',
    'Settings page title',
  ],
  description: [
    'A project management tool for teams',
    'Premium subscription benefits',
    'Data export feature',
    'Security settings explanation',
    'Customer support service',
  ],
  error: [
    'User enters wrong password',
    'Payment failed due to insufficient funds',
    'Page not found (404)',
    'Network connection lost',
    'File upload failed due to size limit',
  ],
  success: [
    'User successfully registered',
    'Order placed successfully',
    'File uploaded successfully',
    'Password changed successfully',
    'Email verified successfully',
  ],
  placeholder: [
    'Email input field',
    'Search bar in documentation',
    'Name input field',
    'Message textarea',
    'Date picker field',
  ],
};
