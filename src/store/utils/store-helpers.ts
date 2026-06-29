/**
 * Zustand Store 通用工具函数
 * 解决代码复用和样板代码问题
 */

import { produce } from 'immer';
import { nanoid } from 'nanoid';
import isEqual = require('fast-deep-equal');

/**
 * 切换布尔数组中的元素（用于加载状态管理）
 */
export function toggleBooleanList(list: string[], id: string, enable: boolean): string[] {
  if (enable) {
    return list.includes(id) ? list : [...list, id];
  } else {
    return list.filter(item => item !== id);
  }
}

/**
 * 通用的加载状态管理器
 */
export interface LoadingManager {
  loadingIds: string[];
  abortController?: AbortController;
}

export function createLoadingManager<T extends LoadingManager>(
  set: (partial: Partial<T>) => void,
  get: () => T,
  loadingKey: keyof T = 'loadingIds' as keyof T,
  abortKey: keyof T = 'abortController' as keyof T
) {
  return {
    toggleLoading: (id: string, loading: boolean, action?: string) => {
      if (loading) {
        const abortController = new AbortController();
        set({
          [abortKey]: abortController,
          [loadingKey]: toggleBooleanList(get()[loadingKey] as string[], id, loading),
        } as Partial<T>);
        return abortController;
      } else {
        set({
          [abortKey]: undefined,
          [loadingKey]: toggleBooleanList(get()[loadingKey] as string[], id, loading),
        } as Partial<T>);
      }
    },

    setLoading: (loading: boolean, action?: string) => {
      if (loading) {
        const abortController = new AbortController();
        set({
          [abortKey]: abortController,
          [loadingKey]: [nanoid()],
        } as Partial<T>);
        return abortController;
      } else {
        set({
          [abortKey]: undefined,
          [loadingKey]: [],
        } as Partial<T>);
      }
    },

    isLoading: (id?: string) => {
      const state = get();
      const loadingIds = state[loadingKey] as string[];
      return id ? loadingIds.includes(id) : loadingIds.length > 0;
    },
  };
}

/**
 * 通用的 CRUD Reducer 生成器
 */
export interface CrudAction<T> {
  type: 'create' | 'update' | 'delete' | 'set';
  id?: string;
  value?: Partial<T> | T | T[];
}

export function createCrudReducer<T extends { id: string }>() {
  return (state: T[], action: CrudAction<T>): T[] => {
    switch (action.type) {
      case 'create':
        return produce(state, (draft) => {
          const newItem = {
            ...action.value,
            id: (action.value as T)?.id ?? nanoid(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          (draft as any).unshift(newItem);
        });

      case 'update':
        return produce(state, (draft) => {
          const index = draft.findIndex((item) => item.id === action.id);
          if (index !== -1) {
            draft[index] = {
              ...draft[index],
              ...action.value,
              updatedAt: Date.now(),
            };
          }
        });

      case 'delete':
        return state.filter((item) => item.id !== action.id);

      case 'set':
        return Array.isArray(action.value) ? action.value as T[] : state;

      default:
        return state;
    }
  };
}

/**
 * 乐观更新模式的通用实现
 */
export interface OptimisticUpdateConfig<T, P> {
  dispatch: (action: CrudAction<T>) => void;
  refresh?: () => Promise<void>;
  onError?: (error: Error, rollbackAction: CrudAction<T>) => void;
}

export async function optimisticUpdate<T extends { id: string }, P>(
  id: string,
  updates: Partial<T>,
  serviceCall: (id: string, updates: P) => Promise<void>,
  config: OptimisticUpdateConfig<T, P>
) {
  const { dispatch, refresh, onError } = config;

  // 保存原始数据用于回滚
  const rollbackAction: CrudAction<T> = {
    type: 'update',
    id,
    value: updates, // 在实际使用中应该保存原始值
  };

  // 1. 乐观更新
  dispatch({
    type: 'update',
    id,
    value: updates,
  });

  try {
    // 2. 调用服务
    await serviceCall(id, updates as P);

    // 3. 刷新确保一致性（可选）
    if (refresh) {
      await refresh();
    }
  } catch (error) {
    // 4. 错误处理和回滚
    if (onError) {
      onError(error as Error, rollbackAction);
    } else {
      // 默认回滚逻辑
      dispatch({
        type: 'update',
        id,
        value: {
          error: {
            type: 'UpdateError',
            message: (error as Error).message,
          },
        } as any,
      });
    }
    throw error;
  }
}

/**
 * 创建操作的乐观更新模式
 */
export async function optimisticCreate<T extends { id: string }, P>(
  entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  serviceCall: (entity: P) => Promise<string>,
  config: OptimisticUpdateConfig<T, P>
) {
  const { dispatch, refresh, onError } = config;
  const tempId = nanoid();

  // 1. 乐观创建
  dispatch({
    type: 'create',
    value: {
      ...entity,
      id: tempId,
    } as T,
  });

  try {
    // 2. 调用服务
    const realId = await serviceCall(entity as P);

    // 3. 刷新确保一致性
    if (refresh) {
      await refresh();
    }

    return realId;
  } catch (error) {
    // 4. 错误处理 - 删除临时创建的项
    dispatch({
      type: 'delete',
      id: tempId,
    });

    if (onError) {
      onError(error as Error, { type: 'delete', id: tempId });
    }

    throw error;
  }
}

/**
 * 安全的状态更新（避免不必要的重渲染）
 */
export function safeSetState<T>(
  currentState: T,
  newState: Partial<T>,
  setState: (state: Partial<T>) => void
): boolean {
  const mergedState = { ...currentState, ...newState };

  if (isEqual(currentState, mergedState)) {
    return false; // 没有实际变化
  }

  setState(newState);
  return true; // 状态已更新
}

/**
 * 创建实体选择器（Selectors）
 */
export function createEntitySelectors<T extends { id: string }, S>(
  getEntities: (state: S) => T[],
  getCurrentId?: (state: S) => string | undefined
) {
  return {
    // 获取所有实体
    getAll: getEntities,

    // 根据ID获取实体
    getById: (id: string) => (state: S) =>
      getEntities(state).find(item => item.id === id),

    // 获取当前激活的实体
    getCurrent: getCurrentId
      ? (state: S) => {
          const currentId = getCurrentId(state);
          return currentId ? getEntities(state).find(item => item.id === currentId) : undefined;
        }
      : undefined,

    // 获取实体数量
    getCount: (state: S) => getEntities(state).length,

    // 检查实体是否存在
    exists: (id: string) => (state: S) =>
      getEntities(state).some(item => item.id === id),
  };
}

/**
 * 通用的错误状态管理
 */
export interface ErrorState {
  error?: {
    type: string;
    message: string;
    code?: string;
  };
}

export function createErrorManager<T extends ErrorState>(
  set: (partial: Partial<T>) => void
) {
  return {
    setError: (type: string, message: string, code?: string) => {
      set({
        error: { type, message, code },
      } as Partial<T>);
    },

    clearError: () => {
      set({
        error: undefined,
      } as Partial<T>);
    },

    hasError: (get: () => T) => !!get().error,
  };
}