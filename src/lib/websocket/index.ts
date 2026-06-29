/**
 * WebSocket 库统一导出
 */

// 导入需要在内部使用的函数
import { WebSocketClient } from './core/WebSocketClient';
import {
    createWebSocketClient,
    createWebSocketClientWithPreset
} from './core/WebSocketFactory';
import { useWebSocket } from './hooks/useWebSocket';
import { WebSocketProvider } from './providers/WebSocketProvider';

// ============= 核心组件 =============
export { WebSocketClient } from './core/WebSocketClient';
export { WebSocketFactory, createWebSocketClient, createWebSocketClientWithPreset, defaultWebSocketFactory } from './core/WebSocketFactory';
export { BrowserWebSocketConnection, MockWebSocketConnection } from './core/WebSocketConnection';
export { StateManager } from './core/StateManager';
export { 
    ExponentialBackoffStrategy, 
    LinearBackoffStrategy, 
    FixedIntervalStrategy, 
    CustomReconnectStrategy,
    ReconnectStrategyFactory 
} from './core/ReconnectStrategy';
export { HeartbeatManager, PingPongHeartbeatManager } from './core/HeartbeatManager';
export { EventEmitter } from './core/EventEmitter';
export { Logger, NullLogger } from './core/Logger';
export { Metrics, NullMetrics } from './core/Metrics';

// ============= Hooks =============
export { useWebSocket, useSimpleWebSocket, useWebSocketListener } from './hooks/useWebSocket';
export { 
    useWebSocketMessage, 
    useTypedWebSocketMessage, 
    useWebSocketMessageQueue,
    useWebSocketMessageStats 
} from './hooks/useWebSocketMessage';
export { 
    useWebSocketState,
    useWebSocketConnectionState,
    useWebSocketMessageState,
    useWebSocketErrorState,
    useWebSocketPerformanceState,
    useWebSocketStateHistory,
    useWebSocketStateDiff
} from './hooks/useWebSocketState';
// useWebSocketFull 已移除，推荐使用组合方式：
// const webSocket = useWebSocket(config);
// const messages = useWebSocketMessage({ client: webSocket.getClient() });
// const connectionState = useWebSocketConnectionState(webSocket.getClient());

// ============= Providers =============
export {
    WebSocketProvider,
    useWebSocketContext,
    useOptionalWebSocketContext,
    useSafeWebSocketContext,
} from './providers/WebSocketProvider';
export { 
    WebSocketErrorBoundary,
    useWebSocketErrorBoundary,
    createWebSocketErrorBoundary,
    NetworkErrorBoundary,
    AuthErrorBoundary
} from './providers/WebSocketErrorBoundary';

// ============= 工具函数 =============
export {
    isValidWebSocketUrl,
    normalizeWebSocketUrl,
    parseWebSocketUrl,
    buildWebSocketUrl,
    isSecureWebSocketUrl,
    getWebSocketDomain,
    getWebSocketPort,
    compareWebSocketUrls,
    extractQueryParams,
    addQueryParams,
    removeQueryParams,
    isLocalWebSocketUrl
} from './utils/urlUtils';

export {
    serializeMessage,
    deserializeMessage,
    validateMessage,
    createHeartbeatMessage,
    createPingMessage,
    createPongMessage,
    isHeartbeatMessage,
    isPingMessage,
    isPongMessage,
    generateMessageId,
    getMessageSize,
    createBatchMessage,
    parseBatchMessage,
    createTypeFilter,
    createPropertyFilter,
    combineFilters,
    createPropertyMapper,
    createSchemaValidator,
    createMessageStatsCollector
} from './utils/messageUtils';

// ============= 常量 =============
export {
    CONNECTION_STATES,
    CLOSE_CODES,
    ERROR_TYPES,
    DEFAULT_CONFIG,
    RECONNECT_STRATEGIES,
    MESSAGE_TYPES,
    LOG_LEVELS,
    EVENTS,
    METRICS
} from './constants';

export type {
    ConnectionState,
    CloseCode,
    ErrorType,
    ReconnectStrategy,
    MessageType,
    LogLevel,
    EventName,
    MetricName
} from './constants';

// ============= 类型定义 =============
export type * from './types/core';
export type * from './types/hooks';
export type * from './types/providers';

// ============= 默认导出 =============
export { createWebSocketClient as default } from './core/WebSocketFactory';

// ============= 版本信息 =============
export const VERSION = '1.0.0';

// ============= 便捷创建函数 =============

/**
 * 创建开发环境的 WebSocket 客户端
 */
export function createDevWebSocketClient(url: string, options: any = {}) {
    return createWebSocketClientWithPreset('development', {
        url,
        ...options
    });
}

/**
 * 创建生产环境的 WebSocket 客户端
 */
export function createProdWebSocketClient(url: string, options: any = {}) {
    return createWebSocketClientWithPreset('production', {
        url,
        ...options
    });
}

/**
 * 创建测试环境的 WebSocket 客户端
 */
export function createTestWebSocketClient(url: string, options: any = {}) {
    return createWebSocketClientWithPreset('testing', {
        url,
        ...options
    });
}

/**
 * 快速创建简单的 WebSocket 连接
 */
export function quickConnect(url: string, onMessage?: any) {
    const client = createWebSocketClient({
        url,
        onMessage,
        reconnect: true,
        maxReconnectAttempts: 5
    });

    client.connect();
    return client;
}

// ============= 兼容性导出 =============
// 为了保持与旧版本的兼容性

/**
 * @deprecated 使用 createWebSocketClient 替代
 */
export const CustomizedWebSocket = WebSocketClient;

/**
 * @deprecated 使用 useWebSocket 替代
 */
export { useWebSocket as useWebsocket };

/**
 * @deprecated 使用 WebSocketProvider 替代
 */
export { WebSocketProvider as WebsocketProvider };

// ============= 兼容旧接口的类型 =============
export interface WebsocketResultType {
    type: string;
    message: string;
    timestamp: string;
}

export interface WebsocketSendType {
    type: string;
    message: any;
}
