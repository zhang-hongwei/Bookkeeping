/**
 * WebSocket 工厂类实现
 */

import {
  IWebSocketFactory,
  IWebSocketClient,
  IWebSocketConnection,
  IStateManager,
  IReconnectStrategy,
  IHeartbeatManager,
  IEventEmitter,
  ILogger,
  IMetrics,
  WebSocketConfig,
  WebSocketState,
} from "../types/core";

import {
  CONNECTION_STATES,
  DEFAULT_CONFIG,
  LOG_LEVELS,
  LogLevel,
  RECONNECT_STRATEGIES,
} from "../constants";

import { WebSocketClient } from "./WebSocketClient";
import {
  BrowserWebSocketConnection,
  MockWebSocketConnection,
} from "./WebSocketConnection";
import { StateManager } from "./StateManager";
import { ReconnectStrategyFactory } from "./ReconnectStrategy";
import { HeartbeatManager, PingPongHeartbeatManager } from "./HeartbeatManager";
import { EventEmitter } from "./EventEmitter";
import { Logger, NullLogger } from "./Logger";
import { Metrics, NullMetrics } from "./Metrics";

export class WebSocketFactory implements IWebSocketFactory {
  private static instance: WebSocketFactory;

  /**
   * 获取单例实例
   */
  static getInstance(): WebSocketFactory {
    if (!WebSocketFactory.instance) {
      WebSocketFactory.instance = new WebSocketFactory();
    }
    return WebSocketFactory.instance;
  }

  createClient(config: WebSocketConfig): IWebSocketClient {
    // 创建所有依赖组件
    const connection = this.createConnection(config.url, config.protocols);
    const stateManager = this.createStateManager();
    const reconnectStrategy = this.createReconnectStrategy(
      config.reconnectStrategy || RECONNECT_STRATEGIES.EXPONENTIAL_BACKOFF,
      config
    );
    const heartbeatManager = this.createHeartbeatManager(
      config.heartbeatInterval || DEFAULT_CONFIG.heartbeatInterval
    );
    const eventEmitter = this.createEventEmitter();
    const logger = this.createLogger(config.logLevel);
    const metrics = this.createMetrics();

    // 创建客户端
    return new WebSocketClient(
      connection,
      stateManager,
      reconnectStrategy,
      heartbeatManager,
      eventEmitter,
      logger,
      metrics,
      config
    );
  }

  createConnection(
    url: string,
    protocols?: string | string[]
  ): IWebSocketConnection {
    // 在测试环境中可以返回 Mock 实现
    if (this.isTestEnvironment()) {
      return new MockWebSocketConnection(url, protocols);
    }

    return new BrowserWebSocketConnection(url, protocols);
  }

  createStateManager(initialState?: Partial<WebSocketState>): IStateManager {
    const defaultState: WebSocketState = {
      isConnected: false,
      isReconnecting: false,
      connectionState: CONNECTION_STATES.DISCONNECTED,
      reconnectAttempts: 0,
      totalReconnects: 0,
      messagesSent: 0,
      messagesReceived: 0,
    };

    return new StateManager({ ...defaultState, ...initialState });
  }

  createReconnectStrategy(
    strategy: string,
    config: WebSocketConfig
  ): IReconnectStrategy {
    return ReconnectStrategyFactory.create(strategy as any, {
      maxAttempts: config.maxReconnectAttempts,
      baseDelay: config.reconnectInterval,
      maxDelay: config.maxReconnectInterval,
    });
  }

  createHeartbeatManager(interval: number): IHeartbeatManager {
    // 可以根据配置选择不同的心跳管理器
    return new HeartbeatManager(interval);
    // 或者使用 Ping-Pong 心跳管理器
    // return new PingPongHeartbeatManager(interval);
  }

  createEventEmitter(): IEventEmitter {
    return new EventEmitter();
  }

  createLogger(level?: number): ILogger {
    if (level === undefined) {
      // 在生产环境中默认禁用调试日志
      level = this.isProductionEnvironment()
        ? LOG_LEVELS.WARN
        : LOG_LEVELS.INFO;
    }

    if (level === -1) {
      return new NullLogger();
    }

    return new Logger(level as LogLevel);
  }

  createMetrics(): IMetrics {
    // 在生产环境中可能需要使用不同的指标收集器
    if (this.isProductionEnvironment()) {
      // 可以集成外部监控系统
      return new Metrics();
    }

    return new Metrics();
  }

  // ============= 工具方法 =============

  /**
   * 创建带有预设配置的客户端
   */
  createClientWithPreset(
    preset: "development" | "production" | "testing",
    config: WebSocketConfig
  ): IWebSocketClient {
    const presetConfig = this.getPresetConfig(preset);
    const mergedConfig = { ...presetConfig, ...config };

    return this.createClient(mergedConfig);
  }

  /**
   * 批量创建客户端
   */
  createMultipleClients(configs: WebSocketConfig[]): IWebSocketClient[] {
    return configs.map((config) => this.createClient(config));
  }

  /**
   * 创建客户端池
   */
  createClientPool(
    baseConfig: WebSocketConfig,
    urls: string[]
  ): IWebSocketClient[] {
    return urls.map((url) => this.createClient({ ...baseConfig, url }));
  }

  private getPresetConfig(
    preset: "development" | "production" | "testing"
  ): Partial<WebSocketConfig> {
    switch (preset) {
      case "development":
        return {
          enableLogging: true,
          logLevel: LOG_LEVELS.DEBUG,
          reconnect: true,
          maxReconnectAttempts: 10,
          heartbeatInterval: 10000,
        };

      case "production":
        return {
          enableLogging: false,
          logLevel: LOG_LEVELS.ERROR,
          reconnect: true,
          maxReconnectAttempts: 5,
          heartbeatInterval: 30000,
        };

      case "testing":
        return {
          enableLogging: true,
          logLevel: LOG_LEVELS.DEBUG,
          reconnect: false,
          maxReconnectAttempts: 0,
          heartbeatInterval: 0,
        };

      default:
        return {};
    }
  }

  private isTestEnvironment(): boolean {
    return (
      typeof process !== "undefined" &&
      (process.env.NODE_ENV === "test" ||
        process.env.JEST_WORKER_ID !== undefined)
    );
  }

  private isProductionEnvironment(): boolean {
    return (
      typeof process !== "undefined" && process.env.NODE_ENV === "production"
    );
  }
}

/**
 * 便捷的工厂函数
 */
export function createWebSocketClient(
  config: WebSocketConfig
): IWebSocketClient {
  return WebSocketFactory.getInstance().createClient(config);
}

export function createWebSocketClientWithPreset(
  preset: "development" | "production" | "testing",
  config: WebSocketConfig
): IWebSocketClient {
  return WebSocketFactory.getInstance().createClientWithPreset(preset, config);
}

/**
 * 默认工厂实例
 */
export const defaultWebSocketFactory = WebSocketFactory.getInstance();
