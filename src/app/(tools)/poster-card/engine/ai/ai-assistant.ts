/**
 * AI Assistant Orchestrator
 * Takes user text input, sends to AI with context, parses response to engine Commands.
 */

import { compressContext, contextToPromptText } from './context-compressor';
import { convertAICommand } from './command-dsl';
import type { AICommand } from './command-dsl';
import type { Command } from '../commands/types';
import type { PosterNode } from '../node-tree/types';

export interface AIAssistantConfig {
  endpoint: string;
  apiKey?: string;
}

export class AIAssistant {
  constructor(private config: AIAssistantConfig) {}

  async processInstruction(
    instruction: string,
    nodes: Record<string, PosterNode>,
    rootNodeId: string,
    selectedIds: Set<string>,
  ): Promise<Command | null> {
    const ctx = compressContext(nodes, rootNodeId, selectedIds);
    const contextText = contextToPromptText(ctx);

    const response = await this.callAI(instruction, contextText);
    const aiCommand = this.parseResponse(response);
    return convertAICommand(aiCommand, nodes, rootNodeId);
  }

  private async callAI(instruction: string, context: string): Promise<string> {
    const res = await fetch(`${this.config.endpoint}/design-assist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        instruction,
        context,
        system_prompt:
          'You are a design assistant. Given the canvas context and user instruction, respond with a JSON object matching the AICommand interface. Only modify what the user asks for.',
      }),
    });

    if (!res.ok) throw new Error(`AI assistant request failed: ${res.status}`);
    return res.text();
  }

  private parseResponse(response: string): AICommand {
    // Try to extract JSON from the response (may be wrapped in markdown code blocks)
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;
    return JSON.parse(jsonStr.trim());
  }
}
