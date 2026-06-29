/**
 * 核心类型定义
 */

import { 
    ConnectionState, 
    ErrorType, 
    ReconnectStrategy, 
    LogLevel,
    EventName,
    MetricName
} from '../constants';

// ============= 基础接口 =============

/**
 * WebSocket 连接接口
 */
export interface IWebSocketConnection {
    connect(): Promise<void>;
    disconnect(code?: number, reason?: string): void;
    send(data: string | ArrayBuffer | Blob): void;
    getReadyState(): number;
    getUrl(): string;
    getProtocols(): string | string[] | undefined;
    
    // 事件处理
    onOpen(handler: (event: Event) => void): void;
    onMessage(handler: (event: MessageEvent) => void): void;
    onClose(handler: (event: CloseEvent) => void): void;
    onError(handler: (event: Event) => void): void;
}

/**
 * 状态管理器接口
 */
export interface IStateManager {
    getState(): WebSocketState;
    updateState(updates: Partial<WebSocketState>): void;
    subscribe(listener: StateListener): () => void;
    reset(): void;
}

/**
 * 重连策略接口
 */
export interface IReconnectStrategy {
    shouldReconnect(attempt: number, error?: WebSocketError): boolean;
    getDelay(attempt: number): number;
    reset(): void;
    getMaxAttempts(): number;
}

/**
 * 心跳管理器接口
 */
export interface IHeartbeatManager {
    start(): void;
    stop(): void;
    isRunning(): boolean;
    setInterval(interval: number): void;
    onHeartbeat(callback: () => void): void;
}

/**
 * 事件发射器接口
 */
export interface IEventEmitter {
    on(event: EventName, listener: (...args: any[]) => void): () => void;
    emit(event: EventName, ...args: any[]): void;
    off(event: EventName, listener: (...args: any[]) => void): void;
    removeAllListeners(event?: EventName): void;
}

/**
 * 日志记录器接口
 */
export interface ILogger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    setLevel(level: LogLevel): void;
}

/**
 * 性能监控接口
 */
export interface IMetrics {
    increment(metric: MetricName, value?: number): void;
    gauge(metric: MetricName, value: number): void;
    timing(metric: MetricName, duration: number): void;
    getMetrics(): Record<MetricName, number>;
    reset(): void;
}

// ============= 数据类型 =============

/**
 * WebSocket 配置
 */
export interface WebSocketConfig {
    url: string;
    protocols?: string | string[];
    reconnect?: boolean;
    maxReconnectAttempts?: number;
    reconnectInterval?: number;
    maxReconnectInterval?: number;
    reconnectStrategy?: ReconnectStrategy;
    heartbeatInterval?: number;
    connectionTimeout?: number;
    binaryType?: BinaryType;
    enableLogging?: boolean;
    logLevel?: LogLevel;
    
    // 回调函数
    onOpen?: (event: Event) => void;
    onMessage?: (data: any) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (error: WebSocketError) => void;
    onReconnect?: (attempt: number) => void;
    onReconnectFailed?: () => void;
    onStateChange?: (state: WebSocketState) => void;
}

/**
 * WebSocket 状态
 */
export interface WebSocketState {
    isConnected: boolean;
    isReconnecting: boolean;
    connectionState: ConnectionState;
    reconnectAttempts: number;
    lastError?: WebSocketError;
    lastMessage?: any;
    connectedAt?: Date;
    disconnectedAt?: Date;
    totalReconnects: number;
    messagesSent: number;
    messagesReceived: number;
}

/**
 * 自定义 WebSocket 错误
 */
export class WebSocketError extends Error {
    public readonly type: ErrorType;
    public readonly code?: number;
    public readonly timestamp: Date;
    public readonly originalError?: Error;

    constructor(
        message: string,
        type: ErrorType,
        code?: number,
        originalError?: Error
    ) {
        super(message);
        this.name = 'WebSocketError';
        this.type = type;
        this.code = code;
        this.timestamp = new Date();
        this.originalError = originalError;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            type: this.type,
            code: this.code,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack
        };
    }
}

/**
 * 发送结果
 */
export interface SendResult {
    success: boolean;
    error?: WebSocketError;
    timestamp: Date;
}

/**
 * 消息监听器
 */
export type MessageListener = (data: any) => void;

/**
 * 状态监听器
 */
export type StateListener = (state: WebSocketState) => void;

/**
 * 连接选项
 */
export interface ConnectionOptions {
    timeout?: number;
    retryOnFailure?: boolean;
}

/**
 * 插件接口
 */
export interface IWebSocketPlugin {
    name: string;
    version: string;
    install(client: IWebSocketClient): void;
    uninstall(client: IWebSocketClient): void;
}

/**
 * WebSocket 客户端接口
 */
export interface IWebSocketClient {
    // 连接管理
    connect(options?: ConnectionOptions): Promise<void>;
    disconnect(code?: number, reason?: string): void;
    reconnect(): Promise<void>;
    
    // 消息发送
    send(message: any): Promise<SendResult>;
    sendRaw(data: string | ArrayBuffer | Blob): Promise<SendResult>;
    
    // 状态管理
    getState(): WebSocketState;
    isConnected(): boolean;
    isReconnecting(): boolean;
    
    // 事件监听
    on(event: EventName, listener: (...args: any[]) => void): () => void;
    off(event: EventName, listener: (...args: any[]) => void): void;
    
    // 消息监听
    onMessage(listener: MessageListener): () => void;
    onStateChange(listener: StateListener): () => void;
    
    // 插件管理
    use(plugin: IWebSocketPlugin): void;
    
    // 工具方法
    getMetrics(): Record<MetricName, number>;
    destroy(): void;
}

// ============= 工厂接口 =============

/**
 * WebSocket 工厂接口
 */
export interface IWebSocketFactory {
    createClient(config: WebSocketConfig): IWebSocketClient;
    createConnection(url: string, protocols?: string | string[]): IWebSocketConnection;
    createStateManager(initialState?: Partial<WebSocketState>): IStateManager;
    createReconnectStrategy(strategy: ReconnectStrategy, config: WebSocketConfig): IReconnectStrategy;
    createHeartbeatManager(interval: number): IHeartbeatManager;
    createEventEmitter(): IEventEmitter;
    createLogger(level?: LogLevel): ILogger;
    createMetrics(): IMetrics;
}
