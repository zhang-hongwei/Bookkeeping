/**
 * 状态管理器实现
 */

import { IStateManager } from '../types/core';
import { WebSocketState, StateListener } from '../types/core';
import { CONNECTION_STATES } from '../constants';

export class StateManager implements IStateManager {
    private state: WebSocketState;
    private listeners: Set<StateListener> = new Set();
    private history: WebSocketState[] = [];
    private maxHistorySize: number = 10;

    constructor(initialState?: Partial<WebSocketState>) {
        this.state = {
            isConnected: false,
            isReconnecting: false,
            connectionState: CONNECTION_STATES.DISCONNECTED,
            reconnectAttempts: 0,
            totalReconnects: 0,
            messagesSent: 0,
            messagesReceived: 0,
            ...initialState
        };
        
        this.addToHistory(this.state);
    }

    getState(): WebSocketState {
        return { ...this.state };
    }

    updateState(updates: Partial<WebSocketState>): void {
        const previousState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // 添加到历史记录
        this.addToHistory(this.state);
        
        // 通知所有监听器
        this.notifyListeners(this.state, previousState);
    }

    subscribe(listener: StateListener): () => void {
        this.listeners.add(listener);
        
        // 立即调用一次监听器，传递当前状态
        listener(this.state);
        
        // 返回取消订阅函数
        return () => {
            this.listeners.delete(listener);
        };
    }

    reset(): void {
        const initialState: WebSocketState = {
            isConnected: false,
            isReconnecting: false,
            connectionState: CONNECTION_STATES.DISCONNECTED,
            reconnectAttempts: 0,
            totalReconnects: 0,
            messagesSent: 0,
            messagesReceived: 0
        };
        
        this.updateState(initialState);
        this.history = [initialState];
    }

    // 扩展方法

    /**
     * 获取状态历史
     */
    getHistory(): WebSocketState[] {
        return [...this.history];
    }

    /**
     * 获取上一个状态
     */
    getPreviousState(): WebSocketState | null {
        return this.history.length > 1 ? this.history[this.history.length - 2] : null;
    }

    /**
     * 检查状态是否发生变化
     */
    hasStateChanged(key: keyof WebSocketState): boolean {
        const previous = this.getPreviousState();
        if (!previous) return true;
        
        return this.state[key] !== previous[key];
    }

    /**
     * 获取监听器数量
     */
    getListenerCount(): number {
        return this.listeners.size;
    }

    /**
     * 设置历史记录最大大小
     */
    setMaxHistorySize(size: number): void {
        this.maxHistorySize = size;
        this.trimHistory();
    }

    /**
     * 清除历史记录
     */
    clearHistory(): void {
        this.history = [this.state];
    }

    private addToHistory(state: WebSocketState): void {
        this.history.push({ ...state });
        this.trimHistory();
    }

    private trimHistory(): void {
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
    }

    private notifyListeners(currentState: WebSocketState, previousState: WebSocketState): void {
        this.listeners.forEach(listener => {
            try {
                listener(currentState);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }

    /**
     * 批量更新状态（减少通知次数）
     */
    batchUpdate(updates: Array<Partial<WebSocketState>>): void {
        const previousState = { ...this.state };
        
        updates.forEach(update => {
            this.state = { ...this.state, ...update };
        });
        
        this.addToHistory(this.state);
        this.notifyListeners(this.state, previousState);
    }

    /**
     * 条件更新状态
     */
    conditionalUpdate(
        condition: (currentState: WebSocketState) => boolean,
        updates: Partial<WebSocketState>
    ): boolean {
        if (condition(this.state)) {
            this.updateState(updates);
            return true;
        }
        return false;
    }

    /**
     * 获取状态快照（包含时间戳）
     */
    getSnapshot(): WebSocketState & { timestamp: number } {
        return {
            ...this.state,
            timestamp: Date.now()
        };
    }
}
