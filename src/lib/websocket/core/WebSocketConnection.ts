/**
 * WebSocket 连接实现
 */

import { IWebSocketConnection } from "../types/core";
import { normalizeWebSocketUrl } from "../utils/urlUtils";

/**
 * 浏览器 WebSocket 连接实现
 */
export class BrowserWebSocketConnection implements IWebSocketConnection {
  private ws: WebSocket | null = null;
  private url: string;
  private protocols?: string | string[];
  private connectionTimeout: number = 10000;

  constructor(url: string, protocols?: string | string[]) {
    this.url = normalizeWebSocketUrl(url);
    this.protocols = protocols;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url, this.protocols);

        // 设置连接超时
        const timeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error("Connection timeout"));
          }
        }, this.connectionTimeout);

        this.ws.onopen = (event) => {
          clearTimeout(timeout);
          resolve();
        };

        this.ws.onerror = (event) => {
          clearTimeout(timeout);
          reject(new Error("WebSocket connection failed"));
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          if (event.code !== 1000) {
            reject(new Error(`Connection closed with code: ${event.code}`));
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(code: number = 1000, reason: string = "Normal closure"): void {
    if (this.ws) {
      this.ws.close(code, reason);
      this.ws = null;
    }
  }

  send(data: string | ArrayBuffer | Blob): void {
    if (!this.ws) {
      throw new Error("WebSocket is not connected");
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not in OPEN state");
    }

    this.ws.send(data);
  }

  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  getUrl(): string {
    return this.url;
  }

  getProtocols(): string | string[] | undefined {
    return this.protocols;
  }

  onOpen(handler: (event: Event) => void): void {
    if (this.ws) {
      this.ws.onopen = handler;
    }
  }

  onMessage(handler: (event: MessageEvent) => void): void {
    if (this.ws) {
      this.ws.onmessage = handler;
    }
  }

  onClose(handler: (event: CloseEvent) => void): void {
    if (this.ws) {
      this.ws.onclose = handler;
    }
  }

  onError(handler: (event: Event) => void): void {
    if (this.ws) {
      this.ws.onerror = handler;
    }
  }

  /**
   * 获取 WebSocket 实例（用于高级操作）
   */
  getWebSocket(): WebSocket | null {
    return this.ws;
  }

  /**
   * 设置连接超时时间
   */
  setConnectionTimeout(timeout: number): void {
    this.connectionTimeout = timeout;
  }

  /**
   * 获取连接信息
   */
  getConnectionInfo(): {
    url: string;
    protocols?: string | string[];
    readyState: number;
    readyStateText: string;
    bufferedAmount?: number;
    extensions?: string;
    protocol?: string;
  } {
    const readyStateMap: any = {
      [WebSocket.CONNECTING]: "CONNECTING",
      [WebSocket.OPEN]: "OPEN",
      [WebSocket.CLOSING]: "CLOSING",
      [WebSocket.CLOSED]: "CLOSED",
    };

    return {
      url: this.url,
      protocols: this.protocols,
      readyState: this.getReadyState(),
      readyStateText: readyStateMap[this.getReadyState()] || "UNKNOWN",
      bufferedAmount: this.ws?.bufferedAmount,
      extensions: this.ws?.extensions,
      protocol: this.ws?.protocol,
    };
  }
}

/**
 * Mock WebSocket 连接实现（用于测试）
 */
export class MockWebSocketConnection implements IWebSocketConnection {
  private readyState: number = WebSocket.CLOSED;
  private url: string;
  private protocols?: string | string[];
  private eventHandlers: {
    onopen?: (event: Event) => void;
    onmessage?: (event: MessageEvent) => void;
    onclose?: (event: CloseEvent) => void;
    onerror?: (event: Event) => void;
  } = {};

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
  }

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      this.readyState = WebSocket.CONNECTING;

      setTimeout(() => {
        this.readyState = WebSocket.OPEN;
        const event = new Event("open");
        this.eventHandlers.onopen?.(event);
        resolve();
      }, 100);
    });
  }

  disconnect(code: number = 1000, reason: string = "Normal closure"): void {
    this.readyState = WebSocket.CLOSING;

    setTimeout(() => {
      this.readyState = WebSocket.CLOSED;
      const event = new CloseEvent("close", { code, reason });
      this.eventHandlers.onclose?.(event);
    }, 50);
  }

  send(data: string | ArrayBuffer | Blob): void {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not in OPEN state");
    }

    // 模拟发送成功
    console.log("Mock WebSocket sent:", data);
  }

  getReadyState(): number {
    return this.readyState;
  }

  getUrl(): string {
    return this.url;
  }

  getProtocols(): string | string[] | undefined {
    return this.protocols;
  }

  onOpen(handler: (event: Event) => void): void {
    this.eventHandlers.onopen = handler;
  }

  onMessage(handler: (event: MessageEvent) => void): void {
    this.eventHandlers.onmessage = handler;
  }

  onClose(handler: (event: CloseEvent) => void): void {
    this.eventHandlers.onclose = handler;
  }

  onError(handler: (event: Event) => void): void {
    this.eventHandlers.onerror = handler;
  }

  /**
   * 模拟接收消息（测试用）
   */
  simulateMessage(data: any): void {
    if (this.readyState === WebSocket.OPEN && this.eventHandlers.onmessage) {
      const event = new MessageEvent("message", { data });
      this.eventHandlers.onmessage(event);
    }
  }

  /**
   * 模拟连接错误（测试用）
   */
  simulateError(): void {
    const event = new Event("error");
    this.eventHandlers.onerror?.(event);
  }
}
