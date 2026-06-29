/**
 * AI Client for GLM (Zhipu AI) Integration
 * Supports text generation and vision (image understanding)
 */

import type { AIResponse } from '@/types/ai';

// Client configuration
interface ClientConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  visionModel: string;
  maxTokens: number;
  temperature: number;
}

// Default configuration
const DEFAULT_CONFIG = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4-flash',
  visionModel: 'glm-4v-flash',
  maxTokens: 2048,
  temperature: 0.7,
};

/**
 * Create AI client instance
 * @param config - Configuration options, apiKey is required
 */
export function createAIClient(config: { apiKey: string } & Partial<ClientConfig>) {
  const finalConfig: ClientConfig = {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl || DEFAULT_CONFIG.baseUrl,
    model: config.model || DEFAULT_CONFIG.model,
    visionModel: config.visionModel || DEFAULT_CONFIG.visionModel,
    maxTokens: config.maxTokens || DEFAULT_CONFIG.maxTokens,
    temperature: config.temperature || DEFAULT_CONFIG.temperature,
  };

  return {
    config: finalConfig,

    /**
     * Generate text completion
     */
    async generateText(
      prompt: string,
      systemPrompt?: string
    ): Promise<AIResponse<string>> {
      try {
        const response = await fetch(`${finalConfig.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${finalConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: finalConfig.model,
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt },
            ],
            max_tokens: finalConfig.maxTokens,
            temperature: finalConfig.temperature,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            error: errorData.error?.message || `API error: ${response.status}`,
          };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        return {
          success: true,
          data: content,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    /**
     * Generate JSON response
     */
    async generateJSON<T>(
      prompt: string,
      systemPrompt?: string
    ): Promise<AIResponse<T>> {
      const textResponse = await this.generateText(prompt, systemPrompt);

      if (!textResponse.success || !textResponse.data) {
        return {
          success: false,
          error: textResponse.error,
        };
      }

      try {
        // Try to extract JSON from the response
        const jsonMatch = textResponse.data.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (!jsonMatch) {
          return {
            success: false,
            error: 'No JSON found in response',
          };
        }

        const parsed = JSON.parse(jsonMatch[0]) as T;
        return {
          success: true,
          data: parsed,
          usage: textResponse.usage,
        };
      } catch {
        return {
          success: false,
          error: 'Failed to parse JSON response',
        };
      }
    },

    /**
     * Analyze image and generate response (Vision)
     */
    async analyzeImage(
      imageBase64: string,
      prompt: string,
      systemPrompt?: string
    ): Promise<AIResponse<string>> {
      try {
        const response = await fetch(`${finalConfig.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${finalConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: finalConfig.visionModel,
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageBase64.startsWith('data:')
                        ? imageBase64
                        : `data:image/jpeg;base64,${imageBase64}`,
                    },
                  },
                  {
                    type: 'text',
                    text: prompt,
                  },
                ],
              },
            ],
            max_tokens: finalConfig.maxTokens,
            temperature: finalConfig.temperature,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            error: errorData.error?.message || `API error: ${response.status}`,
          };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        return {
          success: true,
          data: content,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    /**
     * Analyze image and return JSON (Vision)
     */
    async analyzeImageJSON<T>(
      imageBase64: string,
      prompt: string,
      systemPrompt?: string
    ): Promise<AIResponse<T>> {
      const textResponse = await this.analyzeImage(imageBase64, prompt, systemPrompt);

      if (!textResponse.success || !textResponse.data) {
        return {
          success: false,
          error: textResponse.error,
        };
      }

      try {
        const jsonMatch = textResponse.data.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (!jsonMatch) {
          return {
            success: false,
            error: 'No JSON found in response',
          };
        }

        const parsed = JSON.parse(jsonMatch[0]) as T;
        return {
          success: true,
          data: parsed,
          usage: textResponse.usage,
        };
      } catch {
        return {
          success: false,
          error: 'Failed to parse JSON response',
        };
      }
    },
  };
}
