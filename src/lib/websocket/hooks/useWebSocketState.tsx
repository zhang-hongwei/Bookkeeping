/**
 * WebSocket 状态管理 Hook
 */

import { useEffect, useState, useCallback, useRef } from "react";
import {
  UseWebSocketStateOptions,
  UseWebSocketStateReturn,
  IWebSocketClient,
  WebSocketState,
  StateSelector,
  EqualityFn,
} from "../types/index";

/**
 * 默认相等性比较函数
 */
function defaultEqualityFn<T>(a: T, b: T): boolean {
  return a === b;
}

/**
 * 深度相等性比较函数
 */
function deepEqualityFn<T>(a: T, b: T): boolean {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== "object" || typeof b !== "object") return a === b;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqualityFn((a as any)[key], (b as any)[key])) return false;
  }

  return true;
}

/**
 * WebSocket 状态管理 Hook
 * 提供细粒度的状态订阅和选择器功能
 */
export function useWebSocketState<T = WebSocketState>({
  client,
  selector,
  equalityFn = defaultEqualityFn,
}: UseWebSocketStateOptions<T>): UseWebSocketStateReturn<T> {
  const [isLoading, setIsLoading] = useState(true);

  // 使用 ref 存储选择器和比较函数，避免不必要的重新订阅
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);
  selectorRef.current = selector;
  equalityFnRef.current = equalityFn;

  // 初始化状态
  const [state, setState] = useState<T>(() => {
    if (!client) {
      return {} as T;
    }

    const currentState = client.getState();
    return selectorRef.current
      ? selectorRef.current(currentState)
      : (currentState as T);
  });

  // 状态更新处理函数
  const handleStateChange = useCallback((newState: WebSocketState) => {
    const selectedState = selectorRef.current
      ? selectorRef.current(newState)
      : (newState as T);

    setState((prevState) => {
      // 使用相等性比较函数避免不必要的更新
      if (equalityFnRef.current(prevState, selectedState)) {
        return prevState;
      }
      return selectedState;
    });

    setIsLoading(false);
  }, []);

  // 订阅状态变化
  useEffect(() => {
    if (!client) {
      setIsLoading(false);
      return;
    }

    // 立即获取当前状态
    const currentState = client.getState();
    handleStateChange(currentState);

    // 订阅状态变化
    const unsubscribe = client.onStateChange(handleStateChange);

    return unsubscribe;
  }, [client, handleStateChange]);

  return {
    state,
    isLoading,
  };
}

/**
 * 连接状态 Hook
 * 专门监听连接相关状态
 */
export function useWebSocketConnectionState(client: IWebSocketClient | null) {
  return useWebSocketState({
    client,
    selector: (state) => ({
      isConnected: state.isConnected,
      isReconnecting: state.isReconnecting,
      connectionState: state.connectionState,
      reconnectAttempts: state.reconnectAttempts,
      connectedAt: state.connectedAt,
      disconnectedAt: state.disconnectedAt,
    }),
    equalityFn: deepEqualityFn,
  });
}

/**
 * 消息统计状态 Hook
 * 专门监听消息统计相关状态
 */
export function useWebSocketMessageState(client: IWebSocketClient | null) {
  return useWebSocketState({
    client,
    selector: (state) => ({
      messagesSent: state.messagesSent,
      messagesReceived: state.messagesReceived,
      lastMessage: state.lastMessage,
    }),
    equalityFn: deepEqualityFn,
  });
}

/**
 * 错误状态 Hook
 * 专门监听错误相关状态
 */
export function useWebSocketErrorState(client: IWebSocketClient | null) {
  const { state } = useWebSocketState({
    client,
    selector: (state) => ({
      lastError: state.lastError,
      hasError: !!state.lastError,
    }),
    equalityFn: deepEqualityFn,
  });

  const clearError = useCallback(() => {
    // 这里可以通过客户端清除错误状态
    // 目前的实现中没有直接的清除错误方法
    // 可以考虑在未来版本中添加
  }, []);

  return {
    ...state,
    clearError,
  };
}

/**
 * 性能监控状态 Hook
 * 监听性能相关指标
 */
export function useWebSocketPerformanceState(client: IWebSocketClient | null) {
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!client) {
      return;
    }

    // 定期更新性能指标
    const interval = setInterval(() => {
      const currentMetrics = client.getMetrics();
      setMetrics(currentMetrics);
    }, 1000);

    return () => clearInterval(interval);
  }, [client]);

  return metrics;
}

/**
 * 状态历史 Hook
 * 提供状态变化历史记录
 */
export function useWebSocketStateHistory(
  client: IWebSocketClient | null,
  maxHistorySize: number = 10
) {
  const [history, setHistory] = useState<WebSocketState[]>([]);

  const handleStateChange = useCallback(
    (newState: WebSocketState) => {
      setHistory((prev) => {
        const newHistory = [...prev, newState];
        return newHistory.slice(-maxHistorySize);
      });
    },
    [maxHistorySize]
  );

  useEffect(() => {
    if (!client) {
      return;
    }

    const unsubscribe = client.onStateChange(handleStateChange);
    return unsubscribe;
  }, [client, handleStateChange]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getStateAt = useCallback(
    (index: number): WebSocketState | null => {
      return history[index] || null;
    },
    [history]
  );

  const getPreviousState = useCallback((): WebSocketState | null => {
    return history.length > 1 ? history[history.length - 2] : null;
  }, [history]);

  return {
    history,
    historySize: history.length,
    clearHistory,
    getStateAt,
    getPreviousState,
  };
}

/**
 * 状态比较 Hook
 * 比较当前状态和之前状态的差异
 */
export function useWebSocketStateDiff(client: IWebSocketClient | null) {
  const [currentState, setCurrentState] = useState<WebSocketState | null>(null);
  const [previousState, setPreviousState] = useState<WebSocketState | null>(
    null
  );
  const [diff, setDiff] = useState<Partial<WebSocketState>>({});

  const handleStateChange = useCallback(
    (newState: WebSocketState) => {
      setPreviousState(currentState);
      setCurrentState(newState);

      if (currentState) {
        const stateDiff: Partial<WebSocketState> = {};

        (Object.keys(newState) as Array<keyof WebSocketState>).forEach(
          (key) => {
            if (newState[key] !== currentState[key]) {
              stateDiff[key] = newState[key] as any;
            }
          }
        );

        setDiff(stateDiff);
      }
    },
    [currentState]
  );

  useEffect(() => {
    if (!client) {
      return;
    }

    const unsubscribe = client.onStateChange(handleStateChange);
    return unsubscribe;
  }, [client, handleStateChange]);

  return {
    currentState,
    previousState,
    diff,
    hasChanges: Object.keys(diff).length > 0,
  };
}
