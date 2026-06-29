// Shared types for the Embeddable AI Chat Widget system.
// Used by: Chat Widget (iframe), AI Gateway (API routes), SDK (via separate types.ts)

// ==================== Protocol ====================

export const WIDGET_PROTOCOL_VERSION = "1.0" as const;

export type MessageSource = "smart-ai-sdk" | "smart-ai-widget";
export type MessageTarget = "smart-ai-sdk" | "smart-ai-widget";

export interface WidgetMessage<T = unknown> {
  version: typeof WIDGET_PROTOCOL_VERSION;
  source: MessageSource;
  target: MessageTarget;
  type: WidgetMessageType;
  requestId: string;
  timestamp: number;
  payload: T;
}

export type WidgetMessageType =
  // Handshake
  | "HELLO"
  | "HELLO_ACK"
  | "INIT"
  | "READY"
  // Control
  | "OPEN"
  | "CLOSE"
  | "THEME_CHANGE"
  | "CONTEXT_UPDATE"
  // Notifications (iframe → SDK)
  | "RESIZE"
  | "FULLSCREEN"
  | "AUTH_EXPIRED"
  | "NEW_MESSAGE"
  | "TASK_COMPLETE"
  | "NAVIGATE"
  // Reliability
  | "ACK"
  | "ERROR";

// ==================== Handshake Payloads ====================

export interface HelloPayload {
  sdkVersion: string;
}

export interface HelloAckPayload {
  widgetVersion: string;
}

export interface InitPayload {
  appId: string;
  token: string;
  user: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  theme?: ThemeConfig;
  context?: PageContext;
  debug?: boolean;
}

export interface ReadyPayload {
  conversationId: string | null;
  hasHistory: boolean;
}

// ==================== Theme ====================

export interface ThemeConfig {
  primaryColor?: string;
  mode?: "light" | "dark";
  position?: Position;
  iconUrl?: string;
  buttonStyle?: {
    backgroundColor?: string;
    borderColor?: string;
    size?: number;
  };
}

export type Position = "right-bottom" | "left-bottom" | "right-top" | "left-top";

// ==================== Context ====================

export interface PageContext {
  currentPage?: string;
  activeModule?: string;
  selectedItems?: string[];
  metadata?: Record<string, unknown>;
}

// ==================== Chat ====================

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string; // ISO 8601
  tokenCount?: number;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  appId: string;
  title: string | null;
  lastMessageAt: string | null;
  messageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== SSE Stream Events ====================

export type StreamEventType =
  | "stream_start"
  | "stream_token"
  | "stream_done"
  | "stream_error";

export interface StreamStartEvent {
  messageId: string;
  conversationId: string;
}

export interface StreamTokenEvent {
  content: string;
  index: number;
}

export interface StreamDoneEvent {
  messageId: string;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}

export interface StreamErrorEvent {
  code: string;
  message: string;
}

// ==================== API Request/Response ====================

export interface ChatRequest {
  conversationId?: string;
  content: string;
  context?: PageContext;
}

export interface ConversationListResponse {
  conversations: Conversation[];
}

export interface CreateConversationRequest {
  appId: string;
  title?: string;
  systemContext?: Record<string, unknown>;
}

export interface CreateConversationResponse {
  id: string;
  appId: string;
  title: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface AuthVerifyRequest {
  token: string;
}

export interface AuthVerifyResponse {
  valid: boolean;
  user?: {
    id: string;
    name: string;
    tenantId: string;
  };
  app?: {
    id: string;
    name: string;
    features: Record<string, unknown>;
  };
  error?: string;
}

// ==================== SDK State ====================

export type SDKState =
  | "IDLE"
  | "LOADING"
  | "HANDSHAKE"
  | "AUTHENTICATING"
  | "READY"
  | "OPEN"
  | "CLOSED"
  | "ERROR"
  | "DESTROYED";

// ==================== Notification Payloads ====================

export interface ResizePayload {
  width: number;
  height: number;
}

export interface FullscreenPayload {
  isFullscreen: boolean;
}

export interface AuthExpiredPayload {
  reason: "token_expired" | "token_invalid";
}

export interface NewMessagePayload {
  conversationId: string;
  messageCount: number;
}

export interface TaskCompletePayload {
  taskId: string;
  taskType: string;
  result: unknown;
}

export interface NavigatePayload {
  url: string;
  target?: "_self" | "_blank";
}

export interface ErrorPayload {
  code: string;
  message: string;
  requestId?: string;
}

export interface AckPayload {
  originalType: string;
  requestId: string;
  success: boolean;
  error?: string;
}
