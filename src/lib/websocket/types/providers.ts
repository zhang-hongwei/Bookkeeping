/**
 * Provider 相关类型定义
 */

import { ReactNode } from 'react';
import { 
    WebSocketConfig, 
    WebSocketState, 
    SendResult, 
    MessageListener,
    StateListener,
    IWebSocketClient,
    ConnectionOptions
} from './core';

// ============= Provider 配置类型 =============

/**
 * WebSocket Provider 属性
 */
export interface WebSocketProviderProps {
    children: ReactNode;
    config?: WebSocketConfig;
    url?: string;
    enabled?: boolean;
    autoConnect?: boolean;
    fallback?: ReactNode;
    onError?: (error: Error) => void;
}

// 注意：如果既没有提供 config 也没有提供 url，
// Provider 仍会渲染 children，但不会提供 WebSocket 功能

/**
 * WebSocket Context 值
 */
export interface WebSocketContextValue {
    // 状态
    state: WebSocketState;
    isConnected: boolean;
    isReconnecting: boolean;
    connectionState: string;
    error: Error | null;
    
    // 连接管理
    connect: (options?: ConnectionOptions) => Promise<void>;
    disconnect: (code?: number, reason?: string) => void;
    reconnect: () => Promise<void>;
    
    // 消息发送
    send: (message: any) => Promise<SendResult>;
    sendRaw: (data: string | ArrayBuffer | Blob) => Promise<SendResult>;
    
    // 事件监听（推荐使用）
    onMessage: (listener: MessageListener) => () => void;
    onStateChange: (listener: StateListener) => () => void;

    // 兼容性方法（已废弃）
    /** @deprecated 使用 onMessage 替代 */
    addMessageListener: (listener: MessageListener) => () => void;
    /** @deprecated 使用 onMessage 替代 */
    removeMessageListener: (listener: MessageListener) => void;
    /** @deprecated 使用 onStateChange 替代 */
    addStateListener: (listener: StateListener) => () => void;
    /** @deprecated 使用 onStateChange 替代 */
    removeStateListener: (listener: StateListener) => void;
    
    // 工具方法
    getMetrics: () => Record<string, number>;
    getClient: () => IWebSocketClient | null;
}

// ============= 错误边界类型 =============

/**
 * WebSocket 错误边界属性
 */
export interface WebSocketErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode | ((error: Error) => ReactNode);
    onError?: (error: Error, errorInfo: any) => void;
    resetOnPropsChange?: boolean;
    resetKeys?: Array<string | number>;
}

/**
 * 错误边界状态
 */
export interface WebSocketErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: any;
}

// ============= 高阶组件类型 =============

/**
 * withWebSocket HOC 配置
 */
export interface WithWebSocketOptions {
    config?: WebSocketConfig;
    propName?: string;
    enableAutoConnect?: boolean;
}

/**
 * withWebSocket HOC 注入的属性
 */
export interface WithWebSocketProps {
    webSocket: WebSocketContextValue;
}

// ============= 消息管理器类型 =============

/**
 * 消息管理器配置
 */
export interface MessageManagerConfig {
    maxListeners: number;
    enableFiltering: boolean;
    enableBatching: boolean;
    batchSize: number;
    batchTimeout: number;
}

/**
 * 消息监听器配置
 */
export interface MessageListenerConfig {
    id?: string;
    filter?: (data: any) => boolean;
    once?: boolean;
    priority?: number;
}

/**
 * 消息分发器接口
 */
export interface IMessageDispatcher {
    addListener(listener: MessageListener, config?: MessageListenerConfig): () => void;
    removeListener(listener: MessageListener): void;
    dispatch(message: any): void;
    clear(): void;
    getListenerCount(): number;
}

// ============= 状态管理器类型 =============

/**
 * 状态管理器配置
 */
export interface StateManagerConfig {
    enableHistory: boolean;
    historySize: number;
    enablePersistence: boolean;
    persistenceKey: string;
}

/**
 * 状态历史项
 */
export interface StateHistoryItem {
    state: WebSocketState;
    timestamp: Date;
    action?: string;
}

/**
 * 状态变化事件
 */
export interface StateChangeEvent {
    previousState: WebSocketState;
    currentState: WebSocketState;
    changes: Partial<WebSocketState>;
    timestamp: Date;
}

// ============= 连接池类型 =============

/**
 * 连接池配置
 */
export interface ConnectionPoolConfig {
    maxConnections: number;
    enableLoadBalancing: boolean;
    healthCheckInterval: number;
    connectionTimeout: number;
}

/**
 * 连接池项
 */
export interface ConnectionPoolItem {
    id: string;
    client: IWebSocketClient;
    url: string;
    isHealthy: boolean;
    lastUsed: Date;
    connectionCount: number;
}

/**
 * 连接池接口
 */
export interface IConnectionPool {
    getConnection(url?: string): Promise<IWebSocketClient>;
    releaseConnection(client: IWebSocketClient): void;
    removeConnection(client: IWebSocketClient): void;
    getHealthyConnections(): ConnectionPoolItem[];
    getConnectionCount(): number;
    destroy(): void;
}

// ============= 中间件类型 =============

/**
 * 中间件函数
 */
export type Middleware = (
    context: MiddlewareContext,
    next: () => Promise<void>
) => Promise<void>;

/**
 * 中间件上下文
 */
export interface MiddlewareContext {
    type: 'send' | 'receive' | 'connect' | 'disconnect';
    data?: any;
    client: IWebSocketClient;
    timestamp: Date;
    metadata?: Record<string, any>;
}

/**
 * 中间件管理器接口
 */
export interface IMiddlewareManager {
    use(middleware: Middleware): void;
    remove(middleware: Middleware): void;
    execute(context: MiddlewareContext): Promise<void>;
    clear(): void;
}

// ============= 插件系统类型 =============

/**
 * 插件配置
 */
export interface PluginConfig {
    name: string;
    version: string;
    enabled: boolean;
    options?: Record<string, any>;
}

/**
 * 插件管理器接口
 */
export interface IPluginManager {
    register(plugin: any, config?: PluginConfig): void;
    unregister(name: string): void;
    enable(name: string): void;
    disable(name: string): void;
    getPlugin(name: string): any;
    getPlugins(): PluginConfig[];
}

// ============= 事件总线类型 =============

/**
 * 事件总线配置
 */
export interface EventBusConfig {
    maxListeners: number;
    enableWildcard: boolean;
    enableAsync: boolean;
}

/**
 * 事件监听器配置
 */
export interface EventListenerConfig {
    once?: boolean;
    priority?: number;
    async?: boolean;
}

// ============= 导出类型 =============
export * from './core';
export * from './hooks';
