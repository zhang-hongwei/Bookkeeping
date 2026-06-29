
// WebSocket 连接状态枚举
export declare enum ConnectionState {
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    RECONNECTING = 'reconnecting',
    ERROR = 'error'
}

// WebSocket 配置接口
export interface WebSocketConfig {
    url: string;
    protocols?: string | string[];
    reconnect?: boolean;
    maxReconnectAttempts?: number;
    reconnectInterval?: number;
    heartbeatInterval?: number;
    onOpen?: (event: Event) => void;
    onMessage?: (data: any) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
    onReconnect?: (attempt: number) => void;
    onReconnectFailed?: () => void;
}

// WebSocket 状态接口
export interface WebSocketState {
    isConnected: boolean;
    isReconnecting: boolean;
    connectionState: ConnectionState;
    reconnectAttempts: number;
    lastError?: WebSocketError;
    lastMessage?: any;
}

// 自定义 WebSocket 错误类
export declare class WebSocketError extends Error {
    code?: number;
    event?: Event;
    constructor(
        message: string,
        code?: number,
        event?: Event
    );
}

// 消息监听器类型
export type MessageListener = (data: any) => void;

// 发送消息的结果类型
export interface SendResult {
    success: boolean;
    error?: WebSocketError;
}

// 兼容旧接口
export interface WebsocketResultType {
    type: string;
    message: string;
    timestamp: string;
}

export interface WebsocketSendType {
    type: string;
    message: any;
}

// Hook 返回值接口
export interface UseWebSocketReturn {
    isConnected: boolean;
    connectionState: ConnectionState;
    isReconnecting: boolean;
    reconnectAttempts: number;
    lastError?: WebSocketError;
    sendMessage: (message: any) => Promise<SendResult>;
    reconnect: () => void;
    disconnect: () => void;
}

// Context 值接口
export interface WebSocketContextValue {
    isConnected: boolean;
    connectionState: ConnectionState;
    isReconnecting: boolean;
    lastError?: WebSocketError;
    sendMessage: (message: any) => Promise<SendResult>;
    addMessageListener: (listener: MessageListener) => () => void;
    removeMessageListener: (listener: MessageListener) => void;
    reconnect: () => void;
    disconnect: () => void;
}
