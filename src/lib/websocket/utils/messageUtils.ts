/**
 * 消息处理工具函数
 */

import { MESSAGE_TYPES } from '../constants';

/**
 * 消息序列化选项
 */
export interface SerializationOptions {
    enableCompression?: boolean;
    binaryFormat?: 'arraybuffer' | 'blob';
    encoding?: 'utf8' | 'base64';
}

/**
 * 序列化消息
 */
export function serializeMessage(message: any, options: SerializationOptions = {}): string | ArrayBuffer | Blob {
    const { enableCompression = false, binaryFormat = 'arraybuffer', encoding = 'utf8' } = options;

    try {
        // 处理字符串消息
        if (typeof message === 'string') {
            return message;
        }

        // 处理二进制数据
        if (message instanceof ArrayBuffer || message instanceof Blob) {
            return message;
        }

        // 处理对象消息
        const jsonString = JSON.stringify(message);
        
        if (enableCompression) {
            // 这里可以添加压缩逻辑
            // 例如使用 pako 库进行 gzip 压缩
            return jsonString;
        }

        if (encoding === 'base64') {
            return btoa(jsonString);
        }

        return jsonString;
    } catch (error) {
        throw new Error(`Failed to serialize message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * 反序列化消息
 */
export function deserializeMessage(data: string | ArrayBuffer | Blob, options: SerializationOptions = {}): any {
    const { encoding = 'utf8' } = options;

    try {
        // 处理字符串数据
        if (typeof data === 'string') {
            if (encoding === 'base64') {
                const decoded = atob(data);
                return JSON.parse(decoded);
            }

            // 尝试解析 JSON
            try {
                return JSON.parse(data);
            } catch {
                // 如果不是 JSON，返回原始字符串
                return data;
            }
        }

        // 处理二进制数据
        if (data instanceof ArrayBuffer) {
            const decoder = new TextDecoder();
            const text = decoder.decode(data);
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        }

        if (data instanceof Blob) {
            // Blob 需要异步处理，这里返回 Promise
            return data.text().then(text => {
                try {
                    return JSON.parse(text);
                } catch {
                    return text;
                }
            });
        }

        return data;
    } catch (error) {
        throw new Error(`Failed to deserialize message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * 验证消息格式
 */
export function validateMessage(message: any): boolean {
    if (message === null || message === undefined) {
        return false;
    }

    // 检查是否为支持的数据类型
    if (typeof message === 'string' || 
        message instanceof ArrayBuffer || 
        message instanceof Blob) {
        return true;
    }

    // 检查对象是否可序列化
    try {
        JSON.stringify(message);
        return true;
    } catch {
        return false;
    }
}

/**
 * 创建心跳消息
 */
export function createHeartbeatMessage(timestamp?: number): any {
    return {
        type: MESSAGE_TYPES.HEARTBEAT,
        timestamp: timestamp || Date.now()
    };
}

/**
 * 创建 Ping 消息
 */
export function createPingMessage(id?: string): any {
    return {
        type: MESSAGE_TYPES.PING,
        id: id || generateMessageId(),
        timestamp: Date.now()
    };
}

/**
 * 创建 Pong 消息
 */
export function createPongMessage(pingId?: string): any {
    return {
        type: MESSAGE_TYPES.PONG,
        pingId,
        timestamp: Date.now()
    };
}

/**
 * 检查是否为心跳消息
 */
export function isHeartbeatMessage(message: any): boolean {
    return message && 
           typeof message === 'object' && 
           message.type === MESSAGE_TYPES.HEARTBEAT;
}

/**
 * 检查是否为 Ping 消息
 */
export function isPingMessage(message: any): boolean {
    return message && 
           typeof message === 'object' && 
           message.type === MESSAGE_TYPES.PING;
}

/**
 * 检查是否为 Pong 消息
 */
export function isPongMessage(message: any): boolean {
    return message && 
           typeof message === 'object' && 
           message.type === MESSAGE_TYPES.PONG;
}

/**
 * 生成唯一消息 ID
 */
export function generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 计算消息大小（字节）
 */
export function getMessageSize(message: any): number {
    if (typeof message === 'string') {
        return new Blob([message]).size;
    }

    if (message instanceof ArrayBuffer) {
        return message.byteLength;
    }

    if (message instanceof Blob) {
        return message.size;
    }

    // 对于对象，计算 JSON 字符串的大小
    try {
        const jsonString = JSON.stringify(message);
        return new Blob([jsonString]).size;
    } catch {
        return 0;
    }
}

/**
 * 消息批处理
 */
export interface BatchMessage {
    id: string;
    messages: any[];
    timestamp: number;
    count: number;
}

export function createBatchMessage(messages: any[]): BatchMessage {
    return {
        id: generateMessageId(),
        messages,
        timestamp: Date.now(),
        count: messages.length
    };
}

/**
 * 解析批处理消息
 */
export function parseBatchMessage(batchMessage: BatchMessage): any[] {
    if (!batchMessage || !Array.isArray(batchMessage.messages)) {
        return [];
    }
    return batchMessage.messages;
}

/**
 * 消息过滤器
 */
export type MessageFilter = (message: any) => boolean;

/**
 * 创建类型过滤器
 */
export function createTypeFilter(types: string[]): MessageFilter {
    return (message: any) => {
        return message && 
               typeof message === 'object' && 
               types.includes(message.type);
    };
}

/**
 * 创建属性过滤器
 */
export function createPropertyFilter(property: string, value: any): MessageFilter {
    return (message: any) => {
        return message && 
               typeof message === 'object' && 
               message[property] === value;
    };
}

/**
 * 组合多个过滤器（AND 逻辑）
 */
export function combineFilters(...filters: MessageFilter[]): MessageFilter {
    return (message: any) => {
        return filters.every(filter => filter(message));
    };
}

/**
 * 消息转换器
 */
export type MessageTransformer = (message: any) => any;

/**
 * 创建属性映射转换器
 */
export function createPropertyMapper(mapping: Record<string, string>): MessageTransformer {
    return (message: any) => {
        if (!message || typeof message !== 'object') {
            return message;
        }

        const transformed: any = {};
        Object.entries(mapping).forEach(([oldKey, newKey]) => {
            if (oldKey in message) {
                transformed[newKey] = message[oldKey];
            }
        });

        return { ...message, ...transformed };
    };
}

/**
 * 消息验证器
 */
export type MessageValidator = (message: any) => { valid: boolean; errors: string[] };

/**
 * 创建 Schema 验证器
 */
export function createSchemaValidator(schema: any): MessageValidator {
    return (message: any) => {
        const errors: string[] = [];
        
        // 简单的 schema 验证实现
        if (schema.type && typeof message !== schema.type) {
            errors.push(`Expected type ${schema.type}, got ${typeof message}`);
        }

        if (schema.required && Array.isArray(schema.required)) {
            schema.required.forEach((field: string) => {
                if (!(field in message)) {
                    errors.push(`Missing required field: ${field}`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    };
}

/**
 * 消息统计信息
 */
export interface MessageStats {
    totalMessages: number;
    totalSize: number;
    averageSize: number;
    messageTypes: Record<string, number>;
    lastMessageTime?: number;
}

/**
 * 创建消息统计收集器
 */
export function createMessageStatsCollector(): {
    addMessage: (message: any) => void;
    getStats: () => MessageStats;
    reset: () => void;
} {
    let stats: MessageStats = {
        totalMessages: 0,
        totalSize: 0,
        averageSize: 0,
        messageTypes: {}
    };

    return {
        addMessage: (message: any) => {
            stats.totalMessages++;
            const size = getMessageSize(message);
            stats.totalSize += size;
            stats.averageSize = stats.totalSize / stats.totalMessages;
            stats.lastMessageTime = Date.now();

            // 统计消息类型
            if (message && typeof message === 'object' && message.type) {
                stats.messageTypes[message.type] = (stats.messageTypes[message.type] || 0) + 1;
            }
        },

        getStats: () => ({ ...stats }),

        reset: () => {
            stats = {
                totalMessages: 0,
                totalSize: 0,
                averageSize: 0,
                messageTypes: {},
                lastMessageTime: undefined
            };
        }
    };
}
