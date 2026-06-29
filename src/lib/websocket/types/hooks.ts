/**
 * Hook 相关类型定义
 */

import { 
    WebSocketConfig, 
    WebSocketState, 
    SendResult, 
    MessageListener,
    StateListener,
    IWebSocketClient,
    ConnectionOptions
} from './core';

// ============= Hook 配置类型 =============

/**
 * useWebSocket Hook 配置
 */
export interface UseWebSocketOptions {
    config: WebSocketConfig;
    enabled?: boolean;
    autoConnect?: boolean;
}

/**
 * useWebSocketMessage Hook 配置
 */
export interface UseWebSocketMessageOptions<T = any> {
    client: IWebSocketClient | null;
    filter?: (data: any) => data is T;
    maxMessages?: number;
    enableHistory?: boolean;
}

/**
 * useWebSocketState Hook 配置
 */
export interface UseWebSocketStateOptions<T = WebSocketState> {
    client: IWebSocketClient | null;
    selector?: (state: WebSocketState) => T;
    equalityFn?: (a: T, b: T) => boolean;
}

/**
 * useWebSocketFull Hook 配置
 */
export interface UseWebSocketFullOptions<T = any> {
    config: WebSocketConfig;
    enabled?: boolean;
    autoConnect?: boolean;
    messageFilter?: (data: any) => data is T;
    maxMessages?: number;
    enableHistory?: boolean;
}

// ============= Hook 返回值类型 =============

/**
 * useWebSocket Hook 返回值
 */
export interface UseWebSocketReturn {
    // 状态
    state: WebSocketState;
    isConnected: boolean;
    isReconnecting: boolean;
    connectionState: string;
    error: Error | null;
    
    // 方法
    connect: (options?: ConnectionOptions) => Promise<void>;
    disconnect: (code?: number, reason?: string) => void;
    reconnect: () => Promise<void>;
    send: (message: any) => Promise<SendResult>;
    sendRaw: (data: string | ArrayBuffer | Blob) => Promise<SendResult>;
    
    // 事件监听
    onMessage: (listener: MessageListener) => () => void;
    onStateChange: (listener: StateListener) => () => void;
    
    // 工具
    getMetrics: () => Record<string, number>;
    getClient: () => IWebSocketClient | null;
}

/**
 * useWebSocketMessage Hook 返回值
 */
export interface UseWebSocketMessageReturn<T = any> {
    messages: T[];
    lastMessage: T | null;
    messageCount: number;
    clearMessages: () => void;
    clearHistory: () => void;
}

/**
 * useWebSocketState Hook 返回值
 */
export interface UseWebSocketStateReturn<T = WebSocketState> {
    state: T;
    isLoading: boolean;
}

/**
 * useWebSocketFull Hook 返回值
 */
export interface UseWebSocketFullReturn<T = any> 
    extends UseWebSocketReturn, 
            UseWebSocketMessageReturn<T> {
    // 组合了所有功能
}

// ============= 特殊 Hook 类型 =============

/**
 * useWebSocketStatus Hook 返回值
 */
export interface UseWebSocketStatusReturn {
    isConnected: boolean;
    isReconnecting: boolean;
    connectionState: string;
    reconnectAttempts: number;
    totalReconnects: number;
    connectedAt?: Date;
    disconnectedAt?: Date;
}

/**
 * useWebSocketError Hook 返回值
 */
export interface UseWebSocketErrorReturn {
    error: Error | null;
    hasError: boolean;
    errorCount: number;
    lastErrorAt?: Date;
    clearError: () => void;
}

/**
 * useWebSocketMetrics Hook 返回值
 */
export interface UseWebSocketMetricsReturn {
    metrics: Record<string, number>;
    messagesSent: number;
    messagesReceived: number;
    connectionTime: number;
    errorCount: number;
    reconnectCount: number;
    resetMetrics: () => void;
}

/**
 * useWebSocketAutoReconnect Hook 配置
 */
export interface UseWebSocketAutoReconnectOptions {
    enabled?: boolean;
    maxAttempts?: number;
    delay?: number;
    onReconnectAttempt?: (attempt: number) => void;
    onReconnectSuccess?: () => void;
    onReconnectFailed?: () => void;
}

// ============= 消息相关类型 =============

/**
 * 消息过滤器
 */
export type MessageFilter<T = any> = (data: any) => data is T;

/**
 * 消息处理器
 */
export type MessageHandler<T = any> = (message: T) => void;

/**
 * 消息队列项
 */
export interface MessageQueueItem<T = any> {
    id: string;
    message: T;
    timestamp: Date;
    processed: boolean;
}

/**
 * 消息历史配置
 */
export interface MessageHistoryConfig {
    maxSize: number;
    enablePersistence: boolean;
    storageKey?: string;
}

// ============= 状态选择器类型 =============

/**
 * 状态选择器函数
 */
export type StateSelector<T = any> = (state: WebSocketState) => T;

/**
 * 相等性比较函数
 */
export type EqualityFn<T = any> = (a: T, b: T) => boolean;

// ============= 事件处理类型 =============

/**
 * 连接事件处理器
 */
export interface ConnectionEventHandlers {
    onConnecting?: () => void;
    onConnected?: (event: Event) => void;
    onDisconnected?: (event: CloseEvent) => void;
    onReconnecting?: (attempt: number) => void;
    onError?: (error: Error) => void;
}

/**
 * 消息事件处理器
 */
export interface MessageEventHandlers<T = any> {
    onMessage?: (message: T) => void;
    onMessageSent?: (message: any) => void;
    onMessageError?: (error: Error, message: any) => void;
}

// ============= 高级功能类型 =============

/**
 * 消息队列配置
 */
export interface MessageQueueConfig {
    maxSize: number;
    enableRetry: boolean;
    retryAttempts: number;
    retryDelay: number;
}

/**
 * 批量发送配置
 */
export interface BatchSendConfig {
    batchSize: number;
    flushInterval: number;
    enableCompression: boolean;
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
    enableMetrics: boolean;
    metricsInterval: number;
    enableProfiling: boolean;
}

// ============= 导出所有类型 =============
export * from './core';
