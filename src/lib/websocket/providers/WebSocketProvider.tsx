/**
 * WebSocket Provider 实现
 */

import React, { createContext, useContext, useMemo, useRef } from 'react';
import {
    WebSocketProviderProps,
    WebSocketContextValue,
    MessageListener,
    StateListener
} from '../types/providers';
import { useWebSocket } from '../hooks/useWebSocket';
import { WebSocketErrorBoundary } from './WebSocketErrorBoundary';

// 创建 Context
const WebSocketContext = createContext<WebSocketContextValue | null>(null);

/**
 * WebSocket Provider 组件
 * 提供 WebSocket 连接的全局状态管理
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
    children,
    config,
    url,
    enabled = true,
    autoConnect = true,
    fallback,
    onError
}) => {
    // 消息监听器管理
    const messageListeners = useRef(new Set<MessageListener>()).current;
    const stateListeners = useRef(new Set<StateListener>()).current;

    // 构建最终配置
    const finalConfig = useMemo(() => {
        if (config) {
            return config;
        }

        if (url) {
            return { url };
        }

        // 如果没有配置，返回 null，表示不启用 WebSocket
        return null;
    }, [config, url]);

    // 如果没有配置，直接返回 children（不提供 WebSocket 功能）
    if (!finalConfig) {
        return (
            <WebSocketContext.Provider value={null}>
                {children}
            </WebSocketContext.Provider>
        );
    }

    // 使用 WebSocket Hook
    const webSocket = useWebSocket({
        config: {
            ...finalConfig,
            onMessage: (data: any) => {
                // 分发消息给所有监听器
                messageListeners.forEach(listener => {
                    try {
                        listener(data);
                    } catch (error) {
                        console.error('Error in message listener:', error);
                    }
                });

                // 调用原始回调
                finalConfig?.onMessage?.(data);
            },
            onStateChange: (state: any) => {
                // 分发状态变化给所有监听器
                stateListeners.forEach(listener => {
                    try {
                        listener(state);
                    } catch (error) {
                        console.error('Error in state listener:', error);
                    }
                });

                // 调用原始回调
                finalConfig?.onStateChange?.(state);
            },
            onError: (error: any) => {
                onError?.(error);
                finalConfig?.onError?.(error);
            }
        },
        enabled,
        autoConnect
    });

    // 消息监听器管理方法
    const addMessageListener = (listener: MessageListener): (() => void) => {
        messageListeners.add(listener);
        return () => messageListeners.delete(listener);
    };

    const removeMessageListener = (listener: MessageListener): void => {
        messageListeners.delete(listener);
    };

    // 状态监听器管理方法
    const addStateListener = (listener: StateListener): (() => void) => {
        stateListeners.add(listener);
        return () => stateListeners.delete(listener);
    };

    const removeStateListener = (listener: StateListener): void => {
        stateListeners.delete(listener);
    };

    // 获取客户端实例（需要修改 useWebSocket 来暴露客户端）
    const getClient = () => {
        // 这里需要从 webSocket 中获取客户端实例
        // 当前实现中暂时返回 null
        return null;
    };

    // Context 值
    const contextValue = {
        // 状态
        state: webSocket.state,
        isConnected: webSocket.isConnected,
        isReconnecting: webSocket.isReconnecting,
        connectionState: webSocket.connectionState,
        error: webSocket.error,

        // 连接管理
        connect: webSocket.connect,
        disconnect: webSocket.disconnect,
        reconnect: webSocket.reconnect,

        // 消息发送
        send: webSocket.send,
        sendRaw: webSocket.sendRaw,

        // 事件监听（统一使用 onMessage 风格）
        onMessage: addMessageListener,
        onStateChange: addStateListener,

        // 工具方法
        getMetrics: webSocket.getMetrics,
        getClient,

        // 兼容性方法（标记为废弃）
        /** @deprecated 使用 onMessage 替代 */
        addMessageListener,
        /** @deprecated 使用 onMessage 替代 */
        removeMessageListener,
        /** @deprecated 使用 onStateChange 替代 */
        addStateListener,
        /** @deprecated 使用 onStateChange 替代 */
        removeStateListener
    } as WebSocketContextValue;

    return (
        <WebSocketErrorBoundary fallback={fallback} onError={onError}>
            <WebSocketContext.Provider value={contextValue}>
                {children}
            </WebSocketContext.Provider>
        </WebSocketErrorBoundary>
    );
};

/**
 * 使用 WebSocket Context 的 Hook
 */
export const useWebSocketContext = (): WebSocketContextValue => {
    const context = useContext(WebSocketContext);

    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider with valid configuration. ' +
                       'Make sure you have provided either "config" or "url" prop to WebSocketProvider.');
    }

    return context;
};

/**
 * 条件使用 WebSocket Context 的 Hook
 * 如果不在 Provider 内部或没有配置，返回 null 而不是抛出错误
 */
export const useOptionalWebSocketContext = (): WebSocketContextValue | null => {
    return useContext(WebSocketContext);
};

/**
 * 安全使用 WebSocket Context 的 Hook
 * 检查 WebSocket 是否可用，如果不可用则返回默认值
 */
export const useSafeWebSocketContext = () => {
    const context = useContext(WebSocketContext);

    const isAvailable = !!context;

    return {
        isAvailable,
        context,
        // 安全的方法调用
        send: context?.send || (async () => ({
            success: false,
            error: new Error('WebSocket not available'),
            timestamp: new Date()
        })),
        isConnected: context?.isConnected || false,
        onMessage: context?.onMessage || (() => () => {}),
        onStateChange: context?.onStateChange || (() => () => {})
    };
};

/**
 * 简化的 WebSocket Provider
 * 只需要 URL 即可使用
 */
export const SimpleWebSocketProvider: React.FC<{
    children: React.ReactNode;
    url?: string;  // 现在 URL 也是可选的
    enabled?: boolean;
    onError?: (error: Error) => void;
}> = ({ children, url, enabled = true, onError }) => {
    return (
        <WebSocketProvider
            url={url}
            enabled={enabled}
            onError={onError}
        >
            {children}
        </WebSocketProvider>
    );
};
