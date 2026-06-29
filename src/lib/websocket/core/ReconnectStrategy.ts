/**
 * 重连策略实现
 */

import { IReconnectStrategy } from '../types/core';
import { WebSocketError } from '../types/core';
import { RECONNECT_STRATEGIES, ReconnectStrategy } from '../constants';

/**
 * 指数退避重连策略
 */
export class ExponentialBackoffStrategy implements IReconnectStrategy {
    private maxAttempts: number;
    private baseDelay: number;
    private maxDelay: number;
    private multiplier: number;
    private jitter: boolean;

    constructor(
        maxAttempts: number = 5,
        baseDelay: number = 1000,
        maxDelay: number = 30000,
        multiplier: number = 2,
        jitter: boolean = true
    ) {
        this.maxAttempts = maxAttempts;
        this.baseDelay = baseDelay;
        this.maxDelay = maxDelay;
        this.multiplier = multiplier;
        this.jitter = jitter;
    }

    shouldReconnect(attempt: number, error?: WebSocketError): boolean {
        if (attempt >= this.maxAttempts) {
            return false;
        }

        // 检查特定错误类型是否应该重连
        if (error) {
            // 某些错误类型不应该重连
            const nonRetryableErrors = ['AUTHENTICATION_ERROR', 'RATE_LIMIT_ERROR'];
            if (nonRetryableErrors.includes(error.type)) {
                return false;
            }
        }

        return true;
    }

    getDelay(attempt: number): number {
        let delay = this.baseDelay * Math.pow(this.multiplier, attempt);
        delay = Math.min(delay, this.maxDelay);

        // 添加抖动以避免雷群效应
        if (this.jitter) {
            const jitterRange = delay * 0.1; // 10% 抖动
            delay += (Math.random() - 0.5) * 2 * jitterRange;
        }

        return Math.max(delay, 0);
    }

    reset(): void {
        // 指数退避策略不需要重置状态
    }

    getMaxAttempts(): number {
        return this.maxAttempts;
    }

    setMaxAttempts(maxAttempts: number): void {
        this.maxAttempts = maxAttempts;
    }

    setBaseDelay(baseDelay: number): void {
        this.baseDelay = baseDelay;
    }

    setMaxDelay(maxDelay: number): void {
        this.maxDelay = maxDelay;
    }
}

/**
 * 线性退避重连策略
 */
export class LinearBackoffStrategy implements IReconnectStrategy {
    private maxAttempts: number;
    private baseDelay: number;
    private increment: number;
    private maxDelay: number;

    constructor(
        maxAttempts: number = 5,
        baseDelay: number = 1000,
        increment: number = 1000,
        maxDelay: number = 30000
    ) {
        this.maxAttempts = maxAttempts;
        this.baseDelay = baseDelay;
        this.increment = increment;
        this.maxDelay = maxDelay;
    }

    shouldReconnect(attempt: number, error?: WebSocketError): boolean {
        return attempt < this.maxAttempts;
    }

    getDelay(attempt: number): number {
        const delay = this.baseDelay + (attempt * this.increment);
        return Math.min(delay, this.maxDelay);
    }

    reset(): void {
        // 线性退避策略不需要重置状态
    }

    getMaxAttempts(): number {
        return this.maxAttempts;
    }
}

/**
 * 固定间隔重连策略
 */
export class FixedIntervalStrategy implements IReconnectStrategy {
    private maxAttempts: number;
    private interval: number;

    constructor(maxAttempts: number = 5, interval: number = 5000) {
        this.maxAttempts = maxAttempts;
        this.interval = interval;
    }

    shouldReconnect(attempt: number, error?: WebSocketError): boolean {
        return attempt < this.maxAttempts;
    }

    getDelay(attempt: number): number {
        return this.interval;
    }

    reset(): void {
        // 固定间隔策略不需要重置状态
    }

    getMaxAttempts(): number {
        return this.maxAttempts;
    }
}

/**
 * 自定义重连策略
 */
export class CustomReconnectStrategy implements IReconnectStrategy {
    private shouldReconnectFn: (attempt: number, error?: WebSocketError) => boolean;
    private getDelayFn: (attempt: number) => number;
    private resetFn?: () => void;
    private maxAttempts: number;

    constructor(
        shouldReconnectFn: (attempt: number, error?: WebSocketError) => boolean,
        getDelayFn: (attempt: number) => number,
        maxAttempts: number = 5,
        resetFn?: () => void
    ) {
        this.shouldReconnectFn = shouldReconnectFn;
        this.getDelayFn = getDelayFn;
        this.maxAttempts = maxAttempts;
        this.resetFn = resetFn;
    }

    shouldReconnect(attempt: number, error?: WebSocketError): boolean {
        return this.shouldReconnectFn(attempt, error);
    }

    getDelay(attempt: number): number {
        return this.getDelayFn(attempt);
    }

    reset(): void {
        this.resetFn?.();
    }

    getMaxAttempts(): number {
        return this.maxAttempts;
    }
}

/**
 * 重连策略工厂
 */
export class ReconnectStrategyFactory {
    static create(
        strategy: ReconnectStrategy,
        options: {
            maxAttempts?: number;
            baseDelay?: number;
            maxDelay?: number;
            increment?: number;
            multiplier?: number;
            jitter?: boolean;
        } = {}
    ): IReconnectStrategy {
        const {
            maxAttempts = 5,
            baseDelay = 1000,
            maxDelay = 30000,
            increment = 1000,
            multiplier = 2,
            jitter = true
        } = options;

        switch (strategy) {
            case RECONNECT_STRATEGIES.EXPONENTIAL_BACKOFF:
                return new ExponentialBackoffStrategy(
                    maxAttempts,
                    baseDelay,
                    maxDelay,
                    multiplier,
                    jitter
                );

            case RECONNECT_STRATEGIES.LINEAR_BACKOFF:
                return new LinearBackoffStrategy(
                    maxAttempts,
                    baseDelay,
                    increment,
                    maxDelay
                );

            case RECONNECT_STRATEGIES.FIXED_INTERVAL:
                return new FixedIntervalStrategy(maxAttempts, baseDelay);

            default:
                return new ExponentialBackoffStrategy(
                    maxAttempts,
                    baseDelay,
                    maxDelay,
                    multiplier,
                    jitter
                );
        }
    }
}
