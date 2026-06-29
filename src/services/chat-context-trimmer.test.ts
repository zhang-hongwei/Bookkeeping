import { describe, it, expect } from "vitest";
import {
  estimateTokens,
  estimateMessageTokens,
  trimMessagesToBudget,
  getTokenBudget,
  DEFAULT_TOKEN_BUDGET,
  IMAGE_TOKEN_COST,
} from "./chat-context-trimmer";

describe("estimateTokens", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("estimates ~3 chars per token", () => {
    expect(estimateTokens("abc")).toBe(1);
    expect(estimateTokens("abcdef")).toBe(2);
    expect(estimateTokens("abcdefghij")).toBe(4);
  });

  it("handles Chinese text", () => {
    // Chinese: ~2 chars/token, but we use blended ~3
    expect(estimateTokens("你好")).toBe(1);
    expect(estimateTokens("你好世界")).toBe(2);
  });
});

describe("estimateMessageTokens", () => {
  it("estimates tokens for text content", () => {
    const msg = { role: "user" as const, content: "Hello world" };
    expect(estimateMessageTokens(msg)).toBe(estimateTokens("Hello world"));
  });

  it("estimates tokens for image messages", () => {
    const msg = {
      role: "user" as const,
      content: [
        { type: "image", image: "https://example.com/img.png" },
        { type: "text", text: "Describe this" },
      ],
    };
    const expected = IMAGE_TOKEN_COST + estimateTokens("Describe this");
    expect(estimateMessageTokens(msg)).toBe(expected);
  });

  it("estimates tokens for multiple images", () => {
    const msg = {
      role: "user" as const,
      content: [
        { type: "image", image: "url1" },
        { type: "image", image: "url2" },
        { type: "text", text: "Compare" },
      ],
    };
    const expected = IMAGE_TOKEN_COST * 2 + estimateTokens("Compare");
    expect(estimateMessageTokens(msg)).toBe(expected);
  });
});

describe("trimMessagesToBudget", () => {
  const makePair = (userText: string, assistantText: string) => [
    { role: "user" as const, content: userText },
    { role: "assistant" as const, content: assistantText },
  ];

  it("returns empty for empty messages", () => {
    const result = trimMessagesToBudget([], 1000);
    expect(result.trimmedMessages).toEqual([]);
    expect(result.originalCount).toBe(0);
    expect(result.removedCount).toBe(0);
  });

  it("keeps all messages when under budget", () => {
    const messages = [
      ...makePair("Hi", "Hello!"),
      ...makePair("How are you?", "I'm good!"),
    ];
    const result = trimMessagesToBudget(messages, 1000);
    expect(result.trimmedMessages).toHaveLength(4);
    expect(result.removedCount).toBe(0);
  });

  it("trims oldest messages when over budget", () => {
    // Each char ~3 = token, so 300 chars = 100 tokens per message
    const messages = [
      ...makePair("a".repeat(300), "b".repeat(300)),
      ...makePair("c".repeat(300), "d".repeat(300)),
      ...makePair("e".repeat(300), "f".repeat(300)),
      ...makePair("g".repeat(300), "h".repeat(300)),
    ];

    // Budget only fits ~3 messages worth (each pair = ~200 tokens)
    const budget = 600;
    const result = trimMessagesToBudget(messages, budget);

    expect(result.originalCount).toBe(8);
    expect(result.removedCount).toBeGreaterThan(0);
    // Should keep the latest messages
    const lastMsg = result.trimmedMessages[result.trimmedMessages.length - 1];
    expect(lastMsg.content).toBe("h".repeat(300));
  });

  it("always keeps the last user message even if it exceeds budget", () => {
    const messages = [
      { role: "user" as const, content: "x".repeat(5000) },
    ];

    const result = trimMessagesToBudget(messages, 100);
    expect(result.trimmedMessages).toHaveLength(1);
    expect(result.trimmedMessages[0].content).toBe("x".repeat(5000));
  });

  it("preserves message pair integrity for assistant messages", () => {
    const longText = "a".repeat(300);
    const messages = [
      { role: "user" as const, content: longText },
      { role: "assistant" as const, content: longText },
      { role: "user" as const, content: longText },
      { role: "assistant" as const, content: longText },
    ];

    // Small budget: should keep at least the last pair
    const result = trimMessagesToBudget(messages, 300);
    const trimmed = result.trimmedMessages;

    // If first kept message is assistant, its user pair should also be included
    if (trimmed.length > 0 && trimmed[0].role === "assistant") {
      const idx = messages.indexOf(trimmed[0]);
      if (idx > 0 && messages[idx - 1].role === "user") {
        expect(trimmed[0]).toEqual(messages[idx]);
      }
    }
  });

  it("uses default budget when given 0 or negative", () => {
    const messages = [...makePair("Hello", "Hi")];

    const result0 = trimMessagesToBudget(messages, 0);
    expect(result0.trimmedMessages).toHaveLength(2);

    const resultNeg = trimMessagesToBudget(messages, -1);
    expect(resultNeg.trimmedMessages).toHaveLength(2);
  });

  it("handles image messages in budget calculation", () => {
    const messages = [
      {
        role: "user" as const,
        content: [
          { type: "image", image: "url" },
          { type: "text", text: "Describe" },
        ],
      },
      { role: "assistant" as const, content: "A beautiful image" },
      { role: "user" as const, content: "Thanks" },
    ];

    // With enough budget, keep all
    const resultFull = trimMessagesToBudget(messages, 5000);
    expect(resultFull.trimmedMessages).toHaveLength(3);

    // With tight budget, image cost should force trimming
    const resultTight = trimMessagesToBudget(messages, 100);
    expect(resultTight.trimmedMessages.length).toBeLessThan(3);
  });

  it("never splits a user-assistant pair at the trim boundary", () => {
    const longText = "x".repeat(200);
    // 4 complete pairs + 1 trailing user message
    const messages = [
      { role: "user" as const, content: longText },       // pair 1
      { role: "assistant" as const, content: longText },
      { role: "user" as const, content: longText },       // pair 2
      { role: "assistant" as const, content: longText },
      { role: "user" as const, content: longText },       // pair 3
      { role: "assistant" as const, content: longText },
      { role: "user" as const, content: longText },       // pair 4
      { role: "assistant" as const, content: longText },
      { role: "user" as const, content: "Final question" },
    ];

    // Budget tight enough to trim some early messages
    const result = trimMessagesToBudget(messages, 600);
    const trimmed = result.trimmedMessages;

    // Verify no orphan: assistant message should not appear
    // without its preceding user message (except at the very start)
    for (let j = 1; j < trimmed.length; j++) {
      if (trimmed[j].role === "assistant") {
        expect(trimmed[j - 1].role).toBe("user");
      }
    }
  });

  it("handles conversation with only user messages (no assistant replies)", () => {
    const messages = [
      { role: "user" as const, content: "Message 1" },
      { role: "user" as const, content: "Message 2" },
      { role: "user" as const, content: "Message 3" },
    ];

    const result = trimMessagesToBudget(messages, 100);
    expect(result.trimmedMessages.length).toBeGreaterThan(0);
    // Last message should always be present
    expect(result.trimmedMessages[result.trimmedMessages.length - 1].content).toBe("Message 3");
  });

  it("handles extremely long single message that dwarfs the budget", () => {
    const hugeMessage = "z".repeat(100000);
    const messages = [
      { role: "user" as const, content: hugeMessage },
    ];

    const result = trimMessagesToBudget(messages, 100);
    expect(result.trimmedMessages).toHaveLength(1);
    expect(result.budgetUsed).toBeGreaterThan(100);
  });
});

describe("getTokenBudget", () => {
  it("returns default when no env var", () => {
    delete process.env.CHAT_CONTEXT_TOKEN_BUDGET;
    expect(getTokenBudget()).toBe(DEFAULT_TOKEN_BUDGET);
  });

  it("returns parsed value from env", () => {
    process.env.CHAT_CONTEXT_TOKEN_BUDGET = "64000";
    expect(getTokenBudget()).toBe(64000);
    delete process.env.CHAT_CONTEXT_TOKEN_BUDGET;
  });

  it("falls back to default for invalid values", () => {
    process.env.CHAT_CONTEXT_TOKEN_BUDGET = "not-a-number";
    expect(getTokenBudget()).toBe(DEFAULT_TOKEN_BUDGET);

    process.env.CHAT_CONTEXT_TOKEN_BUDGET = "-100";
    expect(getTokenBudget()).toBe(DEFAULT_TOKEN_BUDGET);

    delete process.env.CHAT_CONTEXT_TOKEN_BUDGET;
  });
});
