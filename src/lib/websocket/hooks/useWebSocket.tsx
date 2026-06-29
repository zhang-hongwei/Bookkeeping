/**
 * 基础 WebSocket Hook 实现
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
    UseWebSocketOptions,
    UseWebSocketReturn
} from '../types/hooks';
import {
    IWebSocketClient,
    WebSocketState,
    SendResult,
    ConnectionOptions,
    MessageListener,
    StateListener
} from '../types/core';
import { createWebSocketClient } from '../core/WebSocketFactory';
import { CONNECTION_STATES } from '../constants';

/**
 * 基础 WebSocket Hook
 * 只负责连接管理和基本的消息发送功能
 */
export function useWebSocket({
    config,
    enabled = true,
    autoConnect = true
}: UseWebSocketOptions): UseWebSocketReturn {
    const clientRef = useRef<IWebSocketClient | null>(null);
    const [state, setState] = useState<WebSocketState>({
        isConnected: false,
        isReconnecting: false,
        connectionState: CONNECTION_STATES.DISCONNECTED,
        reconnectAttempts: 0,
        totalReconnects: 0,
        messagesSent: 0,
        messagesReceived: 0
    });
    const [error, setError] = useState<Error | null>(null);

    // 稳定的配置引用，避免不必要的重新创建
    const stableConfig = useMemo(() => {
        return {
            ...config,
            onError: (wsError: any) => {
                setError(wsError);
                config.onError?.(wsError);
            },
            onStateChange: (newState: WebSocketState) => {
                setState(newState);
                config.onStateChange?.(newState);
            }
        };
    }, [
        config.url,
        config.protocols,
        config.reconnect,
        config.maxReconnectAttempts,
        config.reconnectInterval,
        config.heartbeatInterval,
        config.enableLogging
    ]);

    // 创建和管理 WebSocket 客户端
    useEffect(() => {
        if (!enabled || !stableConfig.url) {
            return;
        }

        // 创建客户端
        const client = createWebSocketClient(stableConfig);
        clientRef.current = client;

        // 订阅状态变化
        const unsubscribeState = client.onStateChange((newState) => {
            setState(newState);
        });

        // 监听错误
        const unsubscribeError = client.on('error', (wsError) => {
            setError(wsError);
        });

        // 自动连接
        if (autoConnect) {
            client.connect().catch((connectError) => {
                console.error('WebSocket connection failed:', connectError);
                setError(connectError);
            });
        }

        // 清理函数
        return () => {
            unsubscribeState();
            unsubscribeError();
            client.destroy();
            clientRef.current = null;
        };
    }, [enabled, stableConfig.url, autoConnect]);

    // ============= 连接管理方法 =============

    const connect = useCallback(async (options?: ConnectionOptions): Promise<void> => {
        if (!clientRef.current) {
            throw new Error('WebSocket client not initialized');
        }
        
        setError(null);
        return clientRef.current.connect(options);
    }, []);

    const disconnect = useCallback((code?: number, reason?: string): void => {
        if (clientRef.current) {
            clientRef.current.disconnect(code, reason);
        }
    }, []);

    const reconnect = useCallback(async (): Promise<void> => {
        if (!clientRef.current) {
            throw new Error('WebSocket client not initialized');
        }
        
        setError(null);
        return clientRef.current.reconnect();
    }, []);

    // ============= 消息发送方法 =============

    const send = useCallback(async (message: any): Promise<SendResult> => {
        if (!clientRef.current) {
            return {
                success: false,
                error: new Error('WebSocket client not initialized') as any,
                timestamp: new Date()
            };
        }
        
        return clientRef.current.send(message);
    }, []);

    const sendRaw = useCallback(async (data: string | ArrayBuffer | Blob): Promise<SendResult> => {
        if (!clientRef.current) {
            return {
                success: false,
                error: new Error('WebSocket client not initialized') as any,
                timestamp: new Date()
            };
        }
        
        return clientRef.current.sendRaw(data);
    }, []);

    // ============= 事件监听方法 =============

    const onMessage = useCallback((listener: MessageListener): (() => void) => {
        if (!clientRef.current) {
            return () => {};
        }
        
        return clientRef.current.onMessage(listener);
    }, []);

    const onStateChange = useCallback((listener: StateListener): (() => void) => {
        if (!clientRef.current) {
            return () => {};
        }
        
        return clientRef.current.onStateChange(listener);
    }, []);

    // ============= 工具方法 =============

    const getMetrics = useCallback((): Record<string, number> => {
        if (!clientRef.current) {
            return {};
        }
        
        return clientRef.current.getMetrics();
    }, []);

    // ============= 计算属性 =============

    const isConnected = state.isConnected;
    const isReconnecting = state.isReconnecting;
    const connectionState = state.connectionState;

    // 获取客户端实例的方法
    const getClient = useCallback((): IWebSocketClient | null => {
        return clientRef.current;
    }, []);

    return {
        // 状态
        state,
        isConnected,
        isReconnecting,
        connectionState,
        error,

        // 连接管理
        connect,
        disconnect,
        reconnect,

        // 消息发送
        send,
        sendRaw,

        // 事件监听
        onMessage,
        onStateChange,

        // 工具
        getMetrics,
        getClient
    };
}

/**
 * 简化版的 WebSocket Hook
 * 提供最基本的连接和消息发送功能
 */
export function useSimpleWebSocket(url: string, enabled: boolean = true) {
    return useWebSocket({
        config: { url },
        enabled,
        autoConnect: true
    });
}

/**
 * 只读的 WebSocket Hook
 * 只监听消息，不提供发送功能
 */
export function useWebSocketListener(url: string, onMessage?: MessageListener, enabled: boolean = true) {
    const webSocket = useWebSocket({
        config: { 
            url,
            onMessage
        },
        enabled,
        autoConnect: true
    });

    return {
        isConnected: webSocket.isConnected,
        connectionState: webSocket.connectionState,
        error: webSocket.error,
        onMessage: webSocket.onMessage
    };
}
