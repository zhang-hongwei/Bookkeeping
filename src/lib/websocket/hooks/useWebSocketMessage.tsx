/**
 * WebSocket 消息处理 Hook
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    UseWebSocketMessageOptions,
    UseWebSocketMessageReturn
} from '../types/hooks';
import {
    IWebSocketClient
} from '../types/core';

/**
 * WebSocket 消息处理 Hook
 * 专门处理消息相关逻辑，包括消息历史、过滤等
 */
export function useWebSocketMessage<T = any>({
    client,
    filter,
    maxMessages = 100,
    enableHistory = true
}: UseWebSocketMessageOptions<T>): UseWebSocketMessageReturn<T> {
    const [messages, setMessages] = useState<T[]>([]);
    const [lastMessage, setLastMessage] = useState<T | null>(null);
    const [messageCount, setMessageCount] = useState(0);
    
    // 使用 ref 来存储过滤函数，避免不必要的重新订阅
    const filterRef = useRef(filter);
    filterRef.current = filter;

    // 消息处理函数
    const handleMessage = useCallback((data: any) => {
        // 应用过滤器
        if (filterRef.current && !filterRef.current(data)) {
            return;
        }

        const message = data as T;
        setLastMessage(message);
        setMessageCount(prev => prev + 1);

        if (enableHistory) {
            setMessages(prev => {
                const newMessages = [...prev, message];
                // 限制消息历史大小
                return newMessages.slice(-maxMessages);
            });
        }
    }, [maxMessages, enableHistory]);

    // 订阅消息
    useEffect(() => {
        if (!client) {
            return;
        }

        const unsubscribe = client.onMessage(handleMessage);
        return unsubscribe;
    }, [client, handleMessage]);

    // 清理方法
    const clearMessages = useCallback(() => {
        setMessages([]);
        setLastMessage(null);
    }, []);

    const clearHistory = useCallback(() => {
        setMessages([]);
        // 保留最后一条消息
        if (lastMessage) {
            setMessages([lastMessage]);
        }
    }, [lastMessage]);

    return {
        messages,
        lastMessage,
        messageCount,
        clearMessages,
        clearHistory
    };
}

/**
 * 类型化的消息 Hook
 * 提供类型安全的消息处理
 */
export function useTypedWebSocketMessage<T>(
    client: IWebSocketClient | null,
    typeGuard: (data: any) => data is T,
    maxMessages?: number
) {
    return useWebSocketMessage<T>({
        client,
        filter: typeGuard,
        maxMessages,
        enableHistory: true
    });
}

/**
 * 消息队列 Hook
 * 提供消息队列功能，支持批处理
 */
export function useWebSocketMessageQueue<T = any>(
    client: IWebSocketClient | null,
    batchSize: number = 10,
    flushInterval: number = 1000
) {
    const [queue, setQueue] = useState<T[]>([]);
    const [processedBatches, setProcessedBatches] = useState<T[][]>([]);
    const timerRef = useRef<number | null>(null);

    // 处理新消息
    const handleMessage = useCallback((data: T) => {
        setQueue(prev => {
            const newQueue = [...prev, data];
            
            // 如果达到批处理大小，立即处理
            if (newQueue.length >= batchSize) {
                const batch = newQueue.splice(0, batchSize);
                setProcessedBatches(prevBatches => [...prevBatches, batch]);
                return newQueue;
            }
            
            return newQueue;
        });
    }, [batchSize]);

    // 定时刷新队列
    useEffect(() => {
        if (queue.length > 0) {
            timerRef.current = window.setTimeout(() => {
                setQueue(currentQueue => {
                    if (currentQueue.length > 0) {
                        setProcessedBatches(prev => [...prev, [...currentQueue]]);
                        return [];
                    }
                    return currentQueue;
                });
            }, flushInterval);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [queue.length, flushInterval]);

    // 订阅消息
    useEffect(() => {
        if (!client) {
            return;
        }

        const unsubscribe = client.onMessage(handleMessage);
        return unsubscribe;
    }, [client, handleMessage]);

    // 手动刷新队列
    const flush = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        
        setQueue(currentQueue => {
            if (currentQueue.length > 0) {
                setProcessedBatches(prev => [...prev, [...currentQueue]]);
                return [];
            }
            return currentQueue;
        });
    }, []);

    // 清空队列和批次
    const clear = useCallback(() => {
        setQueue([]);
        setProcessedBatches([]);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    return {
        queue,
        processedBatches,
        queueSize: queue.length,
        batchCount: processedBatches.length,
        flush,
        clear
    };
}

/**
 * 消息统计 Hook
 * 提供消息统计信息
 */
export function useWebSocketMessageStats(client: IWebSocketClient | null) {
    const [stats, setStats] = useState({
        totalMessages: 0,
        messagesPerSecond: 0,
        averageMessageSize: 0,
        messageTypes: {} as Record<string, number>
    });

    const startTimeRef = useRef(Date.now());
    const messageSizesRef = useRef<number[]>([]);

    const handleMessage = useCallback((data: any) => {
        setStats(prev => {
            const newTotal = prev.totalMessages + 1;
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const messagesPerSecond = elapsed > 0 ? newTotal / elapsed : 0;

            // 计算消息大小
            const messageSize = JSON.stringify(data).length;
            messageSizesRef.current.push(messageSize);
            const averageMessageSize = messageSizesRef.current.reduce((a, b) => a + b, 0) / messageSizesRef.current.length;

            // 统计消息类型
            const messageTypes = { ...prev.messageTypes };
            if (data && typeof data === 'object' && data.type) {
                messageTypes[data.type] = (messageTypes[data.type] || 0) + 1;
            }

            return {
                totalMessages: newTotal,
                messagesPerSecond: Math.round(messagesPerSecond * 100) / 100,
                averageMessageSize: Math.round(averageMessageSize),
                messageTypes
            };
        });
    }, []);

    useEffect(() => {
        if (!client) {
            return;
        }

        const unsubscribe = client.onMessage(handleMessage);
        return unsubscribe;
    }, [client, handleMessage]);

    const reset = useCallback(() => {
        setStats({
            totalMessages: 0,
            messagesPerSecond: 0,
            averageMessageSize: 0,
            messageTypes: {}
        });
        startTimeRef.current = Date.now();
        messageSizesRef.current = [];
    }, []);

    return {
        ...stats,
        reset
    };
}
