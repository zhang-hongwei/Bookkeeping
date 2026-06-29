/**
 * Permission Slice Actions
 * 用户权限相关的所有操作
 */

import { StateCreator } from 'zustand';
import type { UserStore } from '../../store';
import { PermissionDispatch, permissionReducer } from './reducer';
import { toggleBooleanList } from '../../../utils/store-helpers';
// API calls should be handled through frontend API routes
// Do not import server-side repositories directly into client components
import isEqual = require('fast-deep-equal');

// SWR Keys
const SWR_USE_FETCH_USER_PERMISSIONS = 'SWR_USE_FETCH_USER_PERMISSIONS';

// Permission Action Types
export interface PermissionAction {
  // === Public Actions ===
  refreshPermissions: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;

  // === Internal Actions ===
  internal_setPermissions: (permissions: string[]) => void;
  internal_addPermission: (permission: string) => void;
  internal_removePermission: (permission: string) => void;
  internal_clearPermissions: () => void;

  // 加载状态管理
  internal_togglePermissionLoading: (loading: boolean, id: string, action?: string) => AbortController | void;
  internal_setPermissionLoading: (loading: boolean, action?: string) => AbortController | void;
  isPermissionLoading: (id?: string) => boolean;

  // 错误管理
  internal_setPermissionError: (type: string, message: string, code?: string) => void;
  internal_clearPermissionError: () => void;
  hasPermissionError: () => boolean;

  // === Dispatch Methods ===
  internal_dispatchPermission: (action: PermissionDispatch) => void;

  // SWR Integration
  // useFetchUserPermissions: (enable: boolean, userId?: string) => any;
  refreshPermissionsData: () => Promise<void>;
}

export const createPermissionSlice: StateCreator<
  UserStore,
  [],
  [],
  PermissionAction
> = (set, get) => ({
  // === Public Actions ===
  refreshPermissions: async () => {
    const state = get();
    if (!state.userInfo?.id) return;

    const { internal_togglePermissionLoading, internal_dispatchPermission, internal_clearPermissionError } = get();

    const abortController = internal_togglePermissionLoading(true, 'refreshPermissions');

    try {
      // Call frontend API route instead of server repository
      const response = await fetch(`/api/users/${state.userInfo.id}/permissions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.statusText}`);
      }
      const data = await response.json();
      const permissions = data.permissions || [];
      internal_dispatchPermission({
        type: 'setPermissions',
        value: permissions,
      });
      internal_clearPermissionError();
    } catch (error) {
      get().internal_setPermissionError('RefreshPermissionsError', (error as Error).message);
      throw error;
    } finally {
      internal_togglePermissionLoading(false, 'refreshPermissions');
    }
  },

  hasPermission: (permission: string) => {
    const state = get();
    return state.permissions.includes(permission);
  },

  hasAnyPermission: (permissions: string[]) => {
    const state = get();
    return permissions.some(permission => state.permissions.includes(permission));
  },

  hasAllPermissions: (permissions: string[]) => {
    const state = get();
    return permissions.every(permission => state.permissions.includes(permission));
  },

  // === Internal Actions ===
  internal_setPermissions: (permissions: string[]) => {
    get().internal_dispatchPermission({
      type: 'setPermissions',
      value: permissions,
    });
  },

  internal_addPermission: (permission: string) => {
    get().internal_dispatchPermission({
      type: 'addPermission',
      value: permission,
    });
  },

  internal_removePermission: (permission: string) => {
    get().internal_dispatchPermission({
      type: 'removePermission',
      value: permission,
    });
  },

  internal_clearPermissions: () => {
    get().internal_dispatchPermission({ type: 'clearPermissions' });
  },

  // 加载状态管理
  internal_togglePermissionLoading: (loading: boolean, id: string, action?: string) => {
    const currentState = get();

    if (loading) {
      const abortController = new AbortController();
      set({
        permissionAbortController: abortController,
        permissionLoadingIds: toggleBooleanList(currentState.permissionLoadingIds, id, loading),
      }, false);
      return abortController;
    } else {
      set({
        permissionAbortController: undefined,
        permissionLoadingIds: toggleBooleanList(currentState.permissionLoadingIds, id, loading),
      }, false);
    }
  },

  internal_setPermissionLoading: (loading: boolean, action?: string) => {
    if (loading) {
      const abortController = new AbortController();
      set({
        permissionAbortController: abortController,
        permissionLoadingIds: ['permission-operation'],
      }, false);
      return abortController;
    } else {
      set({
        permissionAbortController: undefined,
        permissionLoadingIds: [],
      }, false);
    }
  },

  isPermissionLoading: (id?: string) => {
    const state = get();
    return id ? state.permissionLoadingIds.includes(id) : state.permissionLoadingIds.length > 0;
  },

  // 错误管理
  internal_setPermissionError: (type: string, message: string, code?: string) => {
    get().internal_dispatchPermission({
      type: 'setPermissionError',
      value: { type, message, code },
    });
  },

  internal_clearPermissionError: () => {
    get().internal_dispatchPermission({ type: 'clearPermissionError' });
  },

  hasPermissionError: () => {
    return !!get().permissionError;
  },

  // === Dispatch Methods ===
  internal_dispatchPermission: (action: PermissionDispatch) => {
    const currentState = get();
    const newPermissionState = permissionReducer(
      {
        permissions: currentState.permissions,
        permissionError: currentState.permissionError,
        permissionsInit: currentState.permissionsInit,
      },
      action
    );

    if (isEqual(newPermissionState, {
      permissions: currentState.permissions,
      permissionError: currentState.permissionError,
      permissionsInit: currentState.permissionsInit,
    })) return;

    set(newPermissionState, false);
  },

  // SWR Integration
  refreshPermissionsData: async () => {
    const state = get();
    if (!state.userInfo?.id) return;

    // 这里应该实现SWR的mutate调用
    // return mutate([SWR_USE_FETCH_USER_PERMISSIONS, state.userInfo.id]);
  },
});