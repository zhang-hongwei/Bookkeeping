import debug from "debug";

const log = debug("design-tool-chat:context");

/** Default max tokens for context window (conservative for most models) */
export const DEFAULT_TOKEN_BUDGET = 32000;

/** Estimated token cost per image */
export const IMAGE_TOKEN_COST = 765;

/** Minimum message pairs to keep when trimming */
export const MIN_MESSAGES_TO_KEEP = 4;

/** Characters per token (blended estimate for mixed Chinese/English) */
const CHARS_PER_TOKEN = 3;

interface ModelMessage {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: string; text?: string; image?: string }>;
}

export interface TrimResult {
  /** Messages that fit within the budget */
  trimmedMessages: ModelMessage[];
  /** Original message count */
  originalCount: number;
  /** How many messages were removed */
  removedCount: number;
  /** Total estimated tokens of trimmed messages (excluding system prompt) */
  budgetUsed: number;
}

/**
 * Estimate token count for a text string.
 * Uses character-based heuristic: ~3 chars/token for mixed Chinese/English.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate token cost for a single message.
 */
export function estimateMessageTokens(message: ModelMessage): number {
  if (typeof message.content === "string") {
    return estimateTokens(message.content);
  }

  let tokens = 0;
  for (const part of message.content) {
    if (part.type === "image") {
      tokens += IMAGE_TOKEN_COST;
    } else if (part.type === "text" && part.text) {
      tokens += estimateTokens(part.text);
    }
  }
  return tokens;
}

/**
 * Trim conversation messages to fit within a token budget.
 *
 * Strategy:
 * - Keeps the most recent messages (sliding window)
 * - Trims from oldest first
 * - Preserves complete user/assistant pairs
 * - Always keeps the last user message (current question)
 * - Falls back to system prompt + current user message if budget exceeded
 */
export function trimMessagesToBudget(
  messages: ModelMessage[],
  budget: number
): TrimResult {
  const safeBudget =
    budget > 0 ? budget : DEFAULT_TOKEN_BUDGET;

  if (messages.length === 0) {
    return {
      trimmedMessages: [],
      originalCount: 0,
      removedCount: 0,
      budgetUsed: 0,
    };
  }

  // Walk backwards from latest message, accumulating token cost
  const result: ModelMessage[] = [];
  let usedTokens = 0;
  let i = messages.length - 1;

  while (i >= 0) {
    const msg = messages[i];
    const msgTokens = estimateMessageTokens(msg);

    // If the very last message alone exceeds budget, still keep it
    if (result.length === 0 && usedTokens === 0) {
      result.unshift(msg);
      usedTokens += msgTokens;
      i--;
      continue;
    }

    // Check if adding this message would exceed budget
    if (usedTokens + msgTokens > safeBudget) {
      break;
    }

    result.unshift(msg);
    usedTokens += msgTokens;
    i--;
  }

  // Ensure message pair integrity: if we stopped at an assistant message,
  // check if the next older message is its user pair — include it if possible
  if (result.length > 0 && i >= 0) {
    const firstMsg = result[0];
    if (firstMsg.role === "assistant" && messages[i]?.role === "user") {
      const pairTokens = estimateMessageTokens(messages[i]);
      if (usedTokens + pairTokens <= safeBudget) {
        result.unshift(messages[i]);
        usedTokens += pairTokens;
        i--;
      }
    }
  }

  const removedCount = i + 1;

  log(
    "trimmed: %d/%d messages, budget: %d/%d tokens",
    result.length,
    messages.length,
    usedTokens,
    safeBudget
  );

  return {
    trimmedMessages: result,
    originalCount: messages.length,
    removedCount,
    budgetUsed: usedTokens,
  };
}

/**
 * Get token budget from environment or use default.
 */
export function getTokenBudget(): number {
  const envBudget = process.env.CHAT_CONTEXT_TOKEN_BUDGET;
  if (envBudget) {
    const parsed = parseInt(envBudget, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_TOKEN_BUDGET;
}
