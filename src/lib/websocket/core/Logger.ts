/**
 * 日志记录器实现
 */

import { ILogger } from '../types/core';
import { LOG_LEVELS, LogLevel } from '../constants';

export class Logger implements ILogger {
    private level: LogLevel;
    private prefix: string;

    constructor(level: LogLevel = LOG_LEVELS.INFO, prefix: string = '[WebSocket]') {
        this.level = level;
        this.prefix = prefix;
    }

    debug(message: string, ...args: any[]): void {
        if (this.level <= LOG_LEVELS.DEBUG) {
            console.debug(`${this.prefix} [DEBUG]`, message, ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.level <= LOG_LEVELS.INFO) {
            console.info(`${this.prefix} [INFO]`, message, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.level <= LOG_LEVELS.WARN) {
            console.warn(`${this.prefix} [WARN]`, message, ...args);
        }
    }

    error(message: string, ...args: any[]): void {
        if (this.level <= LOG_LEVELS.ERROR) {
            console.error(`${this.prefix} [ERROR]`, message, ...args);
        }
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    setPrefix(prefix: string): void {
        this.prefix = prefix;
    }
}

/**
 * 空日志记录器（用于禁用日志）
 */
export class NullLogger implements ILogger {
    debug(): void {}
    info(): void {}
    warn(): void {}
    error(): void {}
    setLevel(): void {}
}
