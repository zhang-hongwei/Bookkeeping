/**
 * Shared Chat Types
 * Type definitions shared between the main chat page and embed widget
 */

/** Text message part */
export interface TextMessagePart {
  type: "text";
  text: string;
}

/** Image message part */
export interface ImageMessagePart {
  type: "image";
  image: string | URL;
}

/** Reasoning message part */
export interface ReasoningMessagePart {
  type: "reasoning";
  reasoning: string;
}

/** Tool call message part */
export interface ToolMessagePart {
  type: "tool";
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
}

/** Union type for all chat message parts */
export type ChatMessagePart =
  | TextMessagePart
  | ImageMessagePart
  | ReasoningMessagePart
  | ToolMessagePart;

/** Standalone chat message used across chat surfaces */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: ChatMessagePart[];
  createdAt: Date;
}

/** Options for sending a message */
export interface SendMessageOptions {
  parts: ChatMessagePart[];
}

/** File selection event type */
export interface FileSelectEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & { files: FileList };
}
