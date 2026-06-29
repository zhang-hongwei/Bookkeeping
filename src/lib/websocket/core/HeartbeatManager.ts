/**
 * 心跳管理器实现
 */

import { IHeartbeatManager } from "../types/core";
import {
  createHeartbeatMessage,
  createPingMessage,
} from "../utils/messageUtils";

export class HeartbeatManager implements IHeartbeatManager {
  private interval: number;
  private timer: number | null = null;
  private _isRunning: boolean = false;
  private heartbeatCallback?: () => void;
  private missedHeartbeats: number = 0;
  private maxMissedHeartbeats: number = 3;
  private lastHeartbeatTime: number = 0;

  constructor(interval: number = 30000) {
    this.interval = interval;
  }

  start(): void {
    if (this._isRunning) {
      return;
    }

    this._isRunning = true;
    this.missedHeartbeats = 0;
    this.scheduleNextHeartbeat();
  }

  stop(): void {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  isRunning(): boolean {
    return this._isRunning;
  }

  setInterval(interval: number): void {
    this.interval = interval;

    // 如果正在运行，重新启动以应用新的间隔
    if (this._isRunning) {
      this.stop();
      this.start();
    }
  }

  onHeartbeat(callback: () => void): void {
    this.heartbeatCallback = callback;
  }

  /**
   * 记录心跳响应
   */
  recordHeartbeatResponse(): void {
    this.missedHeartbeats = 0;
    this.lastHeartbeatTime = Date.now();
  }

  /**
   * 获取错过的心跳次数
   */
  getMissedHeartbeats(): number {
    return this.missedHeartbeats;
  }

  /**
   * 获取最后心跳时间
   */
  getLastHeartbeatTime(): number {
    return this.lastHeartbeatTime;
  }

  /**
   * 检查连接是否健康
   */
  isConnectionHealthy(): boolean {
    return this.missedHeartbeats < this.maxMissedHeartbeats;
  }

  /**
   * 设置最大错过心跳次数
   */
  setMaxMissedHeartbeats(max: number): void {
    this.maxMissedHeartbeats = max;
  }

  /**
   * 获取心跳间隔
   */
  getInterval(): number {
    return this.interval;
  }

  /**
   * 获取心跳统计信息
   */
  getStats(): {
    interval: number;
    isRunning: boolean;
    missedHeartbeats: number;
    maxMissedHeartbeats: number;
    lastHeartbeatTime: number;
    isHealthy: boolean;
  } {
    return {
      interval: this.interval,
      isRunning: this._isRunning,
      missedHeartbeats: this.missedHeartbeats,
      maxMissedHeartbeats: this.maxMissedHeartbeats,
      lastHeartbeatTime: this.lastHeartbeatTime,
      isHealthy: this.isConnectionHealthy(),
    };
  }

  private scheduleNextHeartbeat(): void {
    if (!this._isRunning) {
      return;
    }

    this.timer = window.setTimeout(() => {
      this.sendHeartbeat();
      this.scheduleNextHeartbeat();
    }, this.interval);
  }

  protected sendHeartbeat(): void {
    if (!this._isRunning) {
      return;
    }

    this.missedHeartbeats++;

    // 如果错过太多心跳，可能需要触发重连
    if (this.missedHeartbeats >= this.maxMissedHeartbeats) {
      console.warn(
        `Missed ${this.missedHeartbeats} heartbeats, connection may be unhealthy`
      );
    }

    // 执行心跳回调
    if (this.heartbeatCallback) {
      try {
        this.heartbeatCallback();
      } catch (error) {
        console.error("Error in heartbeat callback:", error);
      }
    }
  }

  /**
   * 重置心跳状态
   */
  reset(): void {
    this.missedHeartbeats = 0;
    this.lastHeartbeatTime = 0;
  }
}

/**
 * Ping-Pong 心跳管理器
 * 使用 ping-pong 机制进行心跳检测
 */
export class PingPongHeartbeatManager extends HeartbeatManager {
  private pendingPings: Map<string, number> = new Map();
  private pingTimeout: number = 5000; // 5秒超时
  private sendPingCallback?: (pingMessage: any) => void;

  constructor(interval: number = 30000, pingTimeout: number = 5000) {
    super(interval);
    this.pingTimeout = pingTimeout;
  }

  /**
   * 设置发送 ping 消息的回调
   */
  onSendPing(callback: (pingMessage: any) => void): void {
    this.sendPingCallback = callback;
  }

  /**
   * 处理 pong 响应
   */
  handlePongResponse(pongMessage: any): void {
    const pingId = pongMessage.pingId;
    if (pingId && this.pendingPings.has(pingId)) {
      const sentTime = this.pendingPings.get(pingId)!;
      const roundTripTime = Date.now() - sentTime;

      this.pendingPings.delete(pingId);
      this.recordHeartbeatResponse();

      console.debug(`Ping-pong round trip time: ${roundTripTime}ms`);
    }
  }

  /**
   * 获取待处理的 ping 数量
   */
  getPendingPingCount(): number {
    return this.pendingPings.size;
  }

  /**
   * 清理超时的 ping
   */
  private cleanupTimeoutPings(): void {
    const now = Date.now();
    const timeoutPings: string[] = [];

    this.pendingPings.forEach((sentTime, pingId) => {
      if (now - sentTime > this.pingTimeout) {
        timeoutPings.push(pingId);
      }
    });

    timeoutPings.forEach((pingId) => {
      this.pendingPings.delete(pingId);
      console.warn(`Ping ${pingId} timed out`);
    });
  }

  protected sendHeartbeat(): void {
    // 清理超时的 ping
    this.cleanupTimeoutPings();

    // 发送 ping 消息
    if (this.sendPingCallback) {
      const pingMessage = createPingMessage();
      this.pendingPings.set(pingMessage.id, Date.now());

      try {
        this.sendPingCallback(pingMessage);
      } catch (error) {
        console.error("Error sending ping:", error);
        this.pendingPings.delete(pingMessage.id);
      }
    }

    // 调用父类方法
    super.sendHeartbeat();
  }

  reset(): void {
    super.reset();
    this.pendingPings.clear();
  }
}
