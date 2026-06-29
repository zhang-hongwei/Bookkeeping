/**
 * 事件发射器实现
 */

import { IEventEmitter } from '../types/core';
import { EventName } from '../constants';

export class EventEmitter implements IEventEmitter {
    private listeners: Map<EventName, Set<(...args: any[]) => void>> = new Map();
    private maxListeners: number = 100;

    on(event: EventName, listener: (...args: any[]) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        const eventListeners = this.listeners.get(event)!;
        
        if (eventListeners.size >= this.maxListeners) {
            console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${event}`);
        }

        eventListeners.add(listener);

        // 返回取消订阅函数
        return () => this.off(event, listener);
    }

    emit(event: EventName, ...args: any[]): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(listener => {
                try {
                    listener(...args);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    off(event: EventName, listener: (...args: any[]) => void): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(listener);
            if (eventListeners.size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    removeAllListeners(event?: EventName): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    listenerCount(event: EventName): number {
        const eventListeners = this.listeners.get(event);
        return eventListeners ? eventListeners.size : 0;
    }

    eventNames(): EventName[] {
        return Array.from(this.listeners.keys());
    }

    setMaxListeners(max: number): void {
        this.maxListeners = max;
    }

    getMaxListeners(): number {
        return this.maxListeners;
    }
}
