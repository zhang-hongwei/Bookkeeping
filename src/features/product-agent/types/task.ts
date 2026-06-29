/**
 * Product-Agent 任务类型定义
 * 定义从 product-agent 接收的任务格式和执行反馈格式
 */

// ============= 任务分类 =============

/**
 * 一级任务分类
 */
export const TASK_CATEGORIES = {
  DESIGN: 'design',
  DOCUMENT: 'document',
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  AI: 'ai',
  SYSTEM: 'system',
  COLLABORATION: 'collaboration',
} as const;

export type TaskCategory = typeof TASK_CATEGORIES[keyof typeof TASK_CATEGORIES];

/**
 * 二级任务类型（按分类组织）
 */
export const TASK_TYPES = {
  // 设计类
  DESIGN_UI: 'design/ui_design',
  DESIGN_COMPONENT_LAYOUT: 'design/component_layout',
  DESIGN_THEME_TOKEN: 'design/theme_token',

  // 产品文档类
  DOCUMENT_PRD: 'document/prd_document',
  DOCUMENT_FEATURE_SPEC: 'document/feature_spec',
  DOCUMENT_API_SPEC: 'document/api_spec',

  // 前端开发类
  FRONTEND_PAGE: 'frontend/page',
  FRONTEND_COMPONENT: 'frontend/component',
  FRONTEND_HOOK: 'frontend/hook',
  FRONTEND_STORE: 'frontend/store',
  FRONTEND_API: 'frontend/api',

  // 后端开发类
  BACKEND_ENDPOINT: 'backend/endpoint',
  BACKEND_MODEL: 'backend/model',
  BACKEND_SERVICE: 'backend/service',

  // AI 智能类
  AI_RAG_PROCESSING: 'ai/rag_processing',
  AI_TASK_PLANNING: 'ai/task_planning',
  AI_EVALUATION: 'ai/evaluation',

  // 系统与配置类
  SYSTEM_ENV_SETUP: 'system/env_setup',
  SYSTEM_DEPLOYMENT: 'system/deployment',
  SYSTEM_INTEGRATION: 'system/integration',

  // 协作与反馈类
  COLLABORATION_FEEDBACK: 'collaboration/feedback',
  COLLABORATION_REVIEW: 'collaboration/review',
  COLLABORATION_ITERATION: 'collaboration/iteration',
} as const;

export type TaskType = typeof TASK_TYPES[keyof typeof TASK_TYPES];

// ============= 任务状态 =============

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// ============= 任务优先级 =============

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];

// ============= 任务数据结构 =============

/**
 * 任务输入配置
 */
export interface TaskInputs {
  [key: string]: any;
}

/**
 * 任务输出配置
 */
export interface TaskOutputs {
  path?: string;
  status?: TaskStatus;
  [key: string]: any;
}

/**
 * 任务元数据
 */
export interface TaskMetadata {
  creator: 'AI' | 'USER' | 'SYSTEM';
  priority: TaskPriority;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  dependencies?: string[]; // 依赖的其他任务 ID
  estimated_duration?: number; // 预估执行时长（秒）
}

/**
 * 任务主体结构
 */
export interface Task {
  id: string;
  type: TaskType;
  target: string; // 目标模板（例如：'nextjs-template'）
  title: string;
  description: string;
  inputs: TaskInputs;
  outputs: TaskOutputs;
  metadata: TaskMetadata;
  status: TaskStatus;
}

// ============= 任务反馈结构 =============

/**
 * 任务执行产物
 */
export interface TaskArtifact {
  preview_url?: string;
  commit_hash?: string;
  test_result?: 'passed' | 'failed' | 'skipped';
  build_result?: 'success' | 'failed';
  file_paths?: string[];
  [key: string]: any;
}

/**
 * 任务执行反馈
 */
export interface TaskFeedback {
  task_id: string;
  status: TaskStatus;
  message: string;
  artifact?: TaskArtifact;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  execution_time?: number; // 执行时长（毫秒）
  timestamp: string;
}

// ============= WebSocket 事件类型 =============

/**
 * Product-Agent WebSocket 事件类型
 */
export const PRODUCT_AGENT_EVENTS = {
  // 接收事件（从 product-agent 接收）
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_CANCELLED: 'task_cancelled',
  HEARTBEAT: 'heartbeat',

  // 发送事件（发送给 product-agent）
  TASK_FEEDBACK: 'task_feedback',
  TASK_PROGRESS: 'task_progress',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PONG: 'pong',
} as const;

export type ProductAgentEvent = typeof PRODUCT_AGENT_EVENTS[keyof typeof PRODUCT_AGENT_EVENTS];

/**
 * WebSocket 消息结构
 */
export interface WebSocketMessage<T = any> {
  event: ProductAgentEvent;
  data: T;
  timestamp?: string;
}

/**
 * WebSocket Event (通用格式)
 */
export interface WSEvent<T = unknown> {
  event: string;
  data: T;
  timestamp?: string;
  meta?: Record<string, unknown>;
}

/**
 * WebSocket Event Type enum
 */
export enum WSEventType {
  // Server -> Client events
  CONNECTED = 'connected',
  SYNC_RESPONSE = 'sync_response',
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_CANCELLED = 'task_cancelled',
  HEARTBEAT = 'heartbeat',
  ERROR = 'error',

  // Client -> Server events
  TASK_STARTED = 'task_started',
  TASK_PROGRESS = 'task_progress',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  HEARTBEAT_ACK = 'heartbeat_ack',
}

/**
 * Connection State
 */
export interface ConnectionState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastHeartbeat?: Date;
  lastError?: Error;
}

/**
 * Connected Event (服务器连接确认)
 */
export interface ConnectedEvent {
  client_id: string;
  timestamp: string;
  message?: string;
}

/**
 * Sync Response Event (同步响应)
 */
export interface SyncResponseEvent {
  tasks: Task[];
  timestamp: string;
}

/**
 * Error Event (错误事件)
 */
export interface ErrorEvent {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Heartbeat Event (心跳事件)
 */
export interface HeartbeatEvent {
  timestamp: string;
  client_id?: string;
}

/**
 * 任务创建消息
 */
export interface TaskCreatedMessage extends WebSocketMessage<Task> {
  event: typeof PRODUCT_AGENT_EVENTS.TASK_CREATED;
}

/**
 * 任务更新消息
 */
export interface TaskUpdatedMessage extends WebSocketMessage<Partial<Task> & { id: string }> {
  event: typeof PRODUCT_AGENT_EVENTS.TASK_UPDATED;
}

/**
 * 任务反馈消息
 */
export interface TaskFeedbackMessage extends WebSocketMessage<TaskFeedback> {
  event: typeof PRODUCT_AGENT_EVENTS.TASK_FEEDBACK;
}

/**
 * 订阅消息
 */
export interface SubscribeMessage extends WebSocketMessage<{ topic: string; client_id?: string }> {
  event: typeof PRODUCT_AGENT_EVENTS.SUBSCRIBE;
}

// ============= 任务执行器接口 =============

/**
 * 任务执行结果
 */
export interface TaskExecutionResult {
  success: boolean;
  feedback: TaskFeedback;
  error?: Error;
}

/**
 * 任务执行器接口
 */
export interface ITaskExecutor {
  /**
   * 执行任务
   */
  execute(task: Task): Promise<TaskExecutionResult>;

  /**
   * 检查是否支持该任务类型
   */
  supports(taskType: TaskType): boolean;

  /**
   * 获取执行器名称
   */
  getName(): string;
}

// ============= 辅助函数 =============

/**
 * 解析任务类型
 */
export function parseTaskType(taskType: TaskType): {
  category: TaskCategory;
  type: string;
} {
  const [category, type] = taskType.split('/') as [TaskCategory, string];
  return { category, type };
}

/**
 * 验证任务数据
 */
export function validateTask(task: any): task is Task {
  return (
    typeof task === 'object' &&
    task !== null &&
    typeof task.id === 'string' &&
    typeof task.type === 'string' &&
    typeof task.target === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.inputs === 'object' &&
    typeof task.outputs === 'object' &&
    typeof task.metadata === 'object'
  );
}

/**
 * 创建任务反馈
 */
export function createTaskFeedback(
  taskId: string,
  status: TaskStatus,
  message: string,
  options: {
    artifact?: TaskArtifact;
    error?: Error;
    executionTime?: number;
  } = {}
): TaskFeedback {
  const feedback: TaskFeedback = {
    task_id: taskId,
    status,
    message,
    timestamp: new Date().toISOString(),
  };

  if (options.artifact) {
    feedback.artifact = options.artifact;
  }

  if (options.error) {
    feedback.error = {
      code: options.error.name || 'UNKNOWN_ERROR',
      message: options.error.message,
      stack: options.error.stack,
    };
  }

  if (options.executionTime !== undefined) {
    feedback.execution_time = options.executionTime;
  }

  return feedback;
}

/**
 * 判断任务是否为前端任务
 */
export function isFrontendTask(task: Task): boolean {
  const { category } = parseTaskType(task.type);
  return category === TASK_CATEGORIES.FRONTEND;
}

/**
 * 判断任务是否为后端任务
 */
export function isBackendTask(task: Task): boolean {
  const { category } = parseTaskType(task.type);
  return category === TASK_CATEGORIES.BACKEND;
}

// ============= Client Configuration =============

/**
 * WebSocket Client Configuration
 */
export interface WebSocketClientConfig {
  projectId: string;
  apiKey: string;
  serverUrl?: string; // defaults to ws://localhost:8000
  reconnect?: boolean;
  reconnectInterval?: number; // ms
  reconnectMaxAttempts?: number;
  heartbeatInterval?: number; // ms
  debug?: boolean;
}
