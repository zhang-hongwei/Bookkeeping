/**
 * Profile Slice Actions
 * 用户档案信息相关的所有操作
 */

import { StateCreator } from 'zustand';
import type { UserStore } from '../../store';
import type { UserInfo } from '../../types';
import { ProfileDispatch, profileReducer } from './reducer';
import { toggleBooleanList } from '../../../utils/store-helpers';
// Use frontend API routes instead of server services in client components
import isEqual = require('fast-deep-equal');

// SWR Keys
const SWR_USE_FETCH_USER_PROFILE = 'SWR_USE_FETCH_USER_PROFILE';

// Profile Action Types
export interface ProfileAction {
  // === Public Actions ===
  updateUserInfo: (updates: Partial<UserInfo>) => Promise<void>;
  updateUserProfile: (updates: Partial<UserInfo>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;

  // === Internal Actions ===
  internal_setUserInfo: (userInfo: UserInfo) => void;
  internal_updateUserInfo: (updates: Partial<UserInfo>) => Promise<void>;
  internal_clearUserInfo: () => void;

  // 加载状态管理
  internal_toggleProfileLoading: (loading: boolean, id: string, action?: string) => AbortController | void;
  internal_setProfileLoading: (loading: boolean, action?: string) => AbortController | void;
  isProfileLoading: (id?: string) => boolean;

  // 错误管理
  internal_setProfileError: (type: string, message: string, code?: string) => void;
  internal_clearProfileError: () => void;
  hasProfileError: () => boolean;

  // === Dispatch Methods ===
  internal_dispatchProfile: (action: ProfileDispatch) => void;

  // SWR Integration
  // useFetchUserProfile: (enable: boolean, userId?: string) => any;
  refreshProfile: () => Promise<void>;
}

export const createProfileSlice: StateCreator<
  UserStore,
  [],
  [],
  ProfileAction
> = (set, get) => ({
  // === Public Actions ===
  updateUserInfo: async (updates: Partial<UserInfo>) => {
    const state = get();
    if (!state.userInfo.id) {
      throw new Error('User ID is required for updating user info');
    }

    return get().internal_updateUserInfo(updates);
  },

  updateUserProfile: async (updates: Partial<UserInfo>) => {
    const state = get();
    if (!state.userInfo.id) {
      throw new Error('User ID is required for updating user profile');
    }

    const { internal_toggleProfileLoading, internal_dispatchProfile, internal_clearProfileError } = get();

    const abortController = internal_toggleProfileLoading(true, 'updateUserProfile');

    try {
      // 1. 乐观更新
      internal_dispatchProfile({
        type: 'updateUserInfo',
        value: updates,
      });

      // 2. 调用前端 API 路由
      const response = await fetch(`/api/users/${state.userInfo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      const updatedUser = await response.json();

      // 3. 更新为服务器返回的最新数据
      internal_dispatchProfile({
        type: 'setUserInfo',
        value: updatedUser,
      });

      internal_clearProfileError();
    } catch (error) {
      // 4. 错误处理 - 刷新数据以回滚乐观更新
      if (state.userInfo.id) {
        await get().refreshUserProfile();
      }
      get().internal_setProfileError('UpdateUserProfileError', (error as Error).message);
      throw error;
    } finally {
      internal_toggleProfileLoading(false, 'updateUserProfile');
    }
  },

  refreshUserProfile: async () => {
    const state = get();
    if (!state.userInfo.id) return;

    const { internal_toggleProfileLoading, internal_dispatchProfile, internal_clearProfileError } = get();

    const abortController = internal_toggleProfileLoading(true, 'refreshUserProfile');

    try {
      // 调用前端 API 路由
      const response = await fetch(`/api/users/${state.userInfo.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      const userInfo = await response.json();
      internal_dispatchProfile({
        type: 'setUserInfo',
        value: userInfo,
      });
      internal_clearProfileError();
    } catch (error) {
      get().internal_setProfileError('RefreshUserProfileError', (error as Error).message);
      throw error;
    } finally {
      internal_toggleProfileLoading(false, 'refreshUserProfile');
    }
  },

  // === Internal Actions ===
  internal_setUserInfo: (userInfo: UserInfo) => {
    get().internal_dispatchProfile({
      type: 'setUserInfo',
      value: userInfo,
    });
  },

  internal_updateUserInfo: async (updates: Partial<UserInfo>) => {
    return get().updateUserProfile(updates);
  },

  internal_clearUserInfo: () => {
    get().internal_dispatchProfile({ type: 'clearUserInfo' });
  },

  // 加载状态管理
  internal_toggleProfileLoading: (loading: boolean, id: string, action?: string) => {
    const currentState = get();

    if (loading) {
      const abortController = new AbortController();
      set({
        profileAbortController: abortController,
        profileLoadingIds: toggleBooleanList(currentState.profileLoadingIds, id, loading),
      }, false);
      return abortController;
    } else {
      set({
        profileAbortController: undefined,
        profileLoadingIds: toggleBooleanList(currentState.profileLoadingIds, id, loading),
      }, false);
    }
  },

  internal_setProfileLoading: (loading: boolean, action?: string) => {
    if (loading) {
      const abortController = new AbortController();
      set({
        profileAbortController: abortController,
        profileLoadingIds: ['profile-operation'],
      }, false);
      return abortController;
    } else {
      set({
        profileAbortController: undefined,
        profileLoadingIds: [],
      }, false);
    }
  },

  isProfileLoading: (id?: string) => {
    const state = get();
    return id ? state.profileLoadingIds.includes(id) : state.profileLoadingIds.length > 0;
  },

  // 错误管理
  internal_setProfileError: (type: string, message: string, code?: string) => {
    get().internal_dispatchProfile({
      type: 'setProfileError',
      value: { type, message, code },
    });
  },

  internal_clearProfileError: () => {
    get().internal_dispatchProfile({ type: 'clearProfileError' });
  },

  hasProfileError: () => {
    return !!get().profileError;
  },

  // === Dispatch Methods ===
  internal_dispatchProfile: (action: ProfileDispatch) => {
    const currentState = get();
    const newProfileState = profileReducer(
      {
        userInfo: currentState.userInfo,
        profileError: currentState.profileError,
        profileInit: currentState.profileInit,
      },
      action
    );

    if (isEqual(newProfileState, {
      userInfo: currentState.userInfo,
      profileError: currentState.profileError,
      profileInit: currentState.profileInit,
    })) return;

    set(newProfileState, false);
  },

  // SWR Integration
  refreshProfile: async () => {
    const state = get();
    if (!state.userInfo.id) return;

    // 这里应该实现SWR的mutate调用
    // return mutate([SWR_USE_FETCH_USER_PROFILE, state.userInfo.id]);
  },
});