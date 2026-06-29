/**
 * WebSocket 相关常量定义
 */

// 连接状态常量
export const CONNECTION_STATES = {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    RECONNECTING: 'reconnecting',
    ERROR: 'error'
} as const;

// WebSocket 关闭码
export const CLOSE_CODES = {
    NORMAL: 1000,
    GOING_AWAY: 1001,
    PROTOCOL_ERROR: 1002,
    UNSUPPORTED_DATA: 1003,
    NO_STATUS: 1005,
    ABNORMAL: 1006,
    INVALID_DATA: 1007,
    POLICY_VIOLATION: 1008,
    MESSAGE_TOO_BIG: 1009,
    EXTENSION_REQUIRED: 1010,
    INTERNAL_ERROR: 1011,
    SERVICE_RESTART: 1012,
    TRY_AGAIN_LATER: 1013,
    BAD_GATEWAY: 1014,
    TLS_HANDSHAKE: 1015
} as const;

// 错误类型
export const ERROR_TYPES = {
    CONNECTION_ERROR: 'CONNECTION_ERROR',
    SEND_ERROR: 'SEND_ERROR',
    PROTOCOL_ERROR: 'PROTOCOL_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
    reconnect: true,
    maxReconnectAttempts: 5,
    reconnectInterval: 1000,
    maxReconnectInterval: 30000,
    heartbeatInterval: 30000,
    connectionTimeout: 10000,
    protocols: [] as string[],
    binaryType: 'blob' as BinaryType,
    enableLogging: false
} as const;

// 重连策略类型
export const RECONNECT_STRATEGIES = {
    EXPONENTIAL_BACKOFF: 'exponential_backoff',
    LINEAR_BACKOFF: 'linear_backoff',
    FIXED_INTERVAL: 'fixed_interval'
} as const;

// 消息类型
export const MESSAGE_TYPES = {
    PING: 'ping',
    PONG: 'pong',
    HEARTBEAT: 'heartbeat',
    DATA: 'data',
    ERROR: 'error',
    CLOSE: 'close'
} as const;

// 日志级别
export const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
} as const;

// 事件名称
export const EVENTS = {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    RECONNECTING: 'reconnecting',
    MESSAGE: 'message',
    ERROR: 'error',
    STATE_CHANGE: 'state_change',
    HEARTBEAT: 'heartbeat'
} as const;

// 性能监控指标
export const METRICS = {
    CONNECTION_TIME: 'connection_time',
    MESSAGE_COUNT: 'message_count',
    ERROR_COUNT: 'error_count',
    RECONNECT_COUNT: 'reconnect_count',
    BYTES_SENT: 'bytes_sent',
    BYTES_RECEIVED: 'bytes_received'
} as const;

// 导出类型
export type ConnectionState = typeof CONNECTION_STATES[keyof typeof CONNECTION_STATES];
export type CloseCode = typeof CLOSE_CODES[keyof typeof CLOSE_CODES];
export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];
export type ReconnectStrategy = typeof RECONNECT_STRATEGIES[keyof typeof RECONNECT_STRATEGIES];
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];
export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];
export type EventName = typeof EVENTS[keyof typeof EVENTS];
export type MetricName = typeof METRICS[keyof typeof METRICS];
