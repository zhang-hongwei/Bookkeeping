/**
 * WebSocket 客户端核心实现
 */

import {
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
  SendResult,
  WebSocketError,
  MessageListener,
  StateListener,
  ConnectionOptions,
  IWebSocketPlugin,
} from "../types/core";

import {
  CONNECTION_STATES,
  ERROR_TYPES,
  EVENTS,
  METRICS,
  DEFAULT_CONFIG,
} from "../constants";

import {
  serializeMessage,
  deserializeMessage,
  validateMessage,
  isHeartbeatMessage,
  isPingMessage,
  isPongMessage,
  createPongMessage,
} from "../utils/messageUtils";

export class WebSocketClient implements IWebSocketClient {
  private connection: IWebSocketConnection;
  private stateManager: IStateManager;
  private reconnectStrategy: IReconnectStrategy;
  private heartbeatManager: IHeartbeatManager;
  private eventEmitter: IEventEmitter;
  private logger: ILogger;
  private metrics: IMetrics;
  private config: Required<WebSocketConfig>;

  private reconnectTimer: number | null = null;
  private isDestroyed: boolean = false;
  private plugins: Map<string, IWebSocketPlugin> = new Map();
  private messageListeners: Set<MessageListener> = new Set();

  constructor(
    connection: IWebSocketConnection,
    stateManager: IStateManager,
    reconnectStrategy: IReconnectStrategy,
    heartbeatManager: IHeartbeatManager,
    eventEmitter: IEventEmitter,
    logger: ILogger,
    metrics: IMetrics,
    config: WebSocketConfig
  ) {
    this.connection = connection;
    this.stateManager = stateManager;
    this.reconnectStrategy = reconnectStrategy;
    this.heartbeatManager = heartbeatManager;
    this.eventEmitter = eventEmitter;
    this.logger = logger;
    this.metrics = metrics;

    // 合并配置
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<WebSocketConfig>;

    this.setupEventHandlers();
    this.setupHeartbeat();
  }

  // ============= 连接管理 =============

  async connect(options: ConnectionOptions = {}): Promise<void> {
    if (this.isDestroyed) {
      throw new WebSocketError(
        "Client has been destroyed",
        ERROR_TYPES.CONNECTION_ERROR
      );
    }

    this.logger.info("Attempting to connect to:", this.connection.getUrl());

    try {
      this.stateManager.updateState({
        connectionState: CONNECTION_STATES.CONNECTING,
      });

      this.eventEmitter.emit(EVENTS.CONNECTING);
      this.metrics.increment(METRICS.CONNECTION_TIME);

      const startTime = Date.now();
      await this.connection.connect();
      const connectionTime = Date.now() - startTime;

      this.metrics.timing(METRICS.CONNECTION_TIME, connectionTime);
      this.logger.info(`Connected successfully in ${connectionTime}ms`);
    } catch (error) {
      const wsError = new WebSocketError(
        `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ERROR_TYPES.CONNECTION_ERROR,
        undefined,
        error instanceof Error ? error : undefined
      );

      this.handleConnectionError(wsError);
      throw wsError;
    }
  }

  disconnect(code: number = 1000, reason: string = "Normal closure"): void {
    this.logger.info("Disconnecting WebSocket connection");

    this.clearReconnectTimer();
    this.heartbeatManager.stop();

    this.connection.disconnect(code, reason);

    this.stateManager.updateState({
      isConnected: false,
      connectionState: CONNECTION_STATES.DISCONNECTED,
      disconnectedAt: new Date(),
    });

    this.eventEmitter.emit(EVENTS.DISCONNECTED);
  }

  async reconnect(): Promise<void> {
    this.logger.info("Manual reconnect requested");
    this.disconnect();

    // 重置重连计数
    this.stateManager.updateState({ reconnectAttempts: 0 });
    this.reconnectStrategy.reset();

    return this.connect();
  }

  // ============= 消息发送 =============

  async send(message: any): Promise<SendResult> {
    const timestamp = new Date();

    try {
      if (!this.isConnected()) {
        throw new WebSocketError(
          "WebSocket is not connected",
          ERROR_TYPES.SEND_ERROR
        );
      }

      if (!validateMessage(message)) {
        throw new WebSocketError(
          "Invalid message format",
          ERROR_TYPES.SEND_ERROR
        );
      }

      const serializedMessage = serializeMessage(message);
      await this.sendRaw(serializedMessage);

      this.metrics.increment(METRICS.MESSAGE_COUNT);
      this.stateManager.updateState({
        messagesSent: this.stateManager.getState().messagesSent + 1,
      });

      this.logger.debug("Message sent successfully:", message);

      return { success: true, timestamp };
    } catch (error) {
      const wsError =
        error instanceof WebSocketError
          ? error
          : new WebSocketError(
              `Send failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              ERROR_TYPES.SEND_ERROR,
              undefined,
              error instanceof Error ? error : undefined
            );

      this.metrics.increment(METRICS.ERROR_COUNT);
      this.logger.error("Failed to send message:", wsError);

      return { success: false, error: wsError, timestamp };
    }
  }

  async sendRaw(data: string | ArrayBuffer | Blob): Promise<SendResult> {
    const timestamp = new Date();

    try {
      this.connection.send(data);

      // 计算发送的字节数
      let bytesSent = 0;
      if (typeof data === "string") {
        bytesSent = new Blob([data]).size;
      } else if (data instanceof ArrayBuffer) {
        bytesSent = data.byteLength;
      } else if (data instanceof Blob) {
        bytesSent = data.size;
      }

      this.metrics.increment(METRICS.BYTES_SENT, bytesSent);

      return { success: true, timestamp };
    } catch (error) {
      const wsError = new WebSocketError(
        `Raw send failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ERROR_TYPES.SEND_ERROR,
        undefined,
        error instanceof Error ? error : undefined
      );

      return { success: false, error: wsError, timestamp };
    }
  }

  // ============= 状态管理 =============

  getState(): WebSocketState {
    return this.stateManager.getState();
  }

  isConnected(): boolean {
    return this.stateManager.getState().isConnected;
  }

  isReconnecting(): boolean {
    return this.stateManager.getState().isReconnecting;
  }

  // ============= 事件监听 =============

  on(event: string, listener: (...args: any[]) => void): () => void {
    return this.eventEmitter.on(event as any, listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event as any, listener);
  }

  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onStateChange(listener: StateListener): () => void {
    return this.stateManager.subscribe(listener);
  }

  // ============= 插件管理 =============

  use(plugin: IWebSocketPlugin): void {
    if (this.plugins.has(plugin.name)) {
      this.logger.warn(`Plugin ${plugin.name} is already installed`);
      return;
    }

    try {
      plugin.install(this);
      this.plugins.set(plugin.name, plugin);
      this.logger.info(`Plugin ${plugin.name} installed successfully`);
    } catch (error) {
      this.logger.error(`Failed to install plugin ${plugin.name}:`, error);
    }
  }

  // ============= 工具方法 =============

  getMetrics(): Record<string, number> {
    return this.metrics.getMetrics();
  }

  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.logger.info("Destroying WebSocket client");

    this.isDestroyed = true;
    this.disconnect();

    // 卸载所有插件
    this.plugins.forEach((plugin) => {
      try {
        plugin.uninstall(this);
      } catch (error) {
        this.logger.error(`Error uninstalling plugin ${plugin.name}:`, error);
      }
    });
    this.plugins.clear();

    // 清理监听器
    this.messageListeners.clear();
    this.eventEmitter.removeAllListeners();
  }

  // ============= 私有方法 =============

  private setupEventHandlers(): void {
    this.connection.onOpen((event) => {
      this.handleConnectionOpen(event);
    });

    this.connection.onMessage((event) => {
      this.handleMessage(event);
    });

    this.connection.onClose((event) => {
      this.handleConnectionClose(event);
    });

    this.connection.onError((event) => {
      this.handleConnectionError(
        new WebSocketError("Connection error", ERROR_TYPES.CONNECTION_ERROR)
      );
    });
  }

  private setupHeartbeat(): void {
    this.heartbeatManager.onHeartbeat(() => {
      if (this.isConnected()) {
        this.send({ type: "heartbeat", timestamp: Date.now() }).catch(
          (error) => {
            this.logger.error("Failed to send heartbeat:", error);
          }
        );
      }
    });
  }

  private handleConnectionOpen(event: Event): void {
    this.stateManager.updateState({
      isConnected: true,
      isReconnecting: false,
      connectionState: CONNECTION_STATES.CONNECTED,
      connectedAt: new Date(),
      reconnectAttempts: 0,
    });

    this.heartbeatManager.start();
    this.eventEmitter.emit(EVENTS.CONNECTED, event);
    this.config.onOpen?.(event);

    this.logger.info("WebSocket connection established");
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = deserializeMessage(event.data);

      // 处理特殊消息类型
      if (isPingMessage(data)) {
        const pongMessage = createPongMessage(data.id);
        this.send(pongMessage);
        return;
      }

      if (isPongMessage(data)) {
        // TODO
        // this.heartbeatManager.recordHeartbeatResponse();
        return;
      }

      if (isHeartbeatMessage(data)) {
        // TODO
        // this.heartbeatManager.recordHeartbeatResponse();
        return;
      }

      // 更新统计信息
      this.metrics.increment(METRICS.MESSAGE_COUNT);
      this.stateManager.updateState({
        messagesReceived: this.stateManager.getState().messagesReceived + 1,
        lastMessage: data,
      });

      // 通知监听器
      this.messageListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          this.logger.error("Error in message listener:", error);
        }
      });

      this.eventEmitter.emit(EVENTS.MESSAGE, data);
      this.config.onMessage?.(data);
    } catch (error) {
      this.logger.error("Error handling message:", error);
    }
  }

  private handleConnectionClose(event: CloseEvent): void {
    this.stateManager.updateState({
      isConnected: false,
      connectionState: CONNECTION_STATES.DISCONNECTED,
      disconnectedAt: new Date(),
    });

    this.heartbeatManager.stop();
    this.eventEmitter.emit(EVENTS.DISCONNECTED, event);
    this.config.onClose?.(event);

    // 如果不是正常关闭且启用重连，则尝试重连
    if (event.code !== 1000 && this.config.reconnect && !this.isDestroyed) {
      this.attemptReconnect();
    }

    this.logger.info(`WebSocket connection closed with code: ${event.code}`);
  }

  private handleConnectionError(error: WebSocketError): void {
    this.stateManager.updateState({
      connectionState: CONNECTION_STATES.ERROR,
      lastError: error,
    });

    this.metrics.increment(METRICS.ERROR_COUNT);
    this.eventEmitter.emit(EVENTS.ERROR, error);
    this.config.onError?.(error);

    this.logger.error("WebSocket connection error:", error);
  }

  private attemptReconnect(): void {
    const currentAttempts = this.stateManager.getState().reconnectAttempts;

    if (!this.reconnectStrategy.shouldReconnect(currentAttempts)) {
      this.logger.warn("Max reconnect attempts reached");
      this.config.onReconnectFailed?.();
      return;
    }

    const delay = this.reconnectStrategy.getDelay(currentAttempts);

    this.stateManager.updateState({
      isReconnecting: true,
      connectionState: CONNECTION_STATES.RECONNECTING,
      reconnectAttempts: currentAttempts + 1,
      totalReconnects: this.stateManager.getState().totalReconnects + 1,
    });

    this.eventEmitter.emit(EVENTS.RECONNECTING, currentAttempts + 1);
    this.config.onReconnect?.(currentAttempts + 1);
    this.metrics.increment(METRICS.RECONNECT_COUNT);

    this.logger.info(
      `Attempting reconnect ${currentAttempts + 1} in ${delay}ms`
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch((error) => {
        this.logger.error("Reconnect attempt failed:", error);
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
