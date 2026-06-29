/**
 * Auth Slice Actions
 * 用户认证相关的所有操作
 */

import { StateCreator } from "zustand";
import type { UserStore } from "../../store";
import { AuthDispatch, authReducer } from "./reducer";
import { toggleBooleanList } from "../../../utils/store-helpers";
// Logout functionality handled by next-auth
const isEqual = require("fast-deep-equal");

// SWR Keys
const SWR_USE_FETCH_AUTH_STATUS = "SWR_USE_FETCH_AUTH_STATUS";

// Auth Action Types
export interface AuthAction {
  // === Public Actions ===
  login: (token: string, userInfo: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;

  // === Internal Actions ===
  internal_setToken: (token: string) => void;
  internal_clearToken: () => void;
  internal_setLoginStatus: (status: boolean) => void;

  // 加载状态管理
  internal_toggleAuthLoading: (
    loading: boolean,
    id: string,
    action?: string
  ) => AbortController | void;
  internal_setAuthLoading: (
    loading: boolean,
    action?: string
  ) => AbortController | void;
  isAuthLoading: (id?: string) => boolean;

  // 错误管理
  internal_setAuthError: (type: string, message: string, code?: string) => void;
  internal_clearAuthError: () => void;
  hasAuthError: () => boolean;

  // === Dispatch Methods ===
  internal_dispatchAuth: (action: AuthDispatch) => void;

  // SWR Integration
  // useFetchAuthStatus: (enable: boolean) => any;
  refreshAuthStatus: () => Promise<void>;
}

export const createAuthSlice: StateCreator<UserStore, [], [], AuthAction> = (
  set,
  get
) => ({
  // === Public Actions ===
  login: async (token: string, userInfo: any) => {
    const {
      internal_setAuthLoading,
      internal_dispatchAuth,
      internal_clearAuthError,
      internal_setUserInfo,
      internal_setPermissions,
      internal_clearProfileError,
      internal_clearPermissionError,
    } = get();

    const abortController = internal_setAuthLoading(true, "login");

    try {
      // 1. 设置认证状态
      internal_dispatchAuth({ type: "setToken", value: token });

      // 2. 设置用户信息
      if (userInfo) {
        internal_setUserInfo(userInfo);
      }

      // 3. 设置权限
      if (userInfo?.permissions && userInfo.permissions.length > 0) {
        internal_setPermissions(userInfo.permissions);
      }

      // 4. 清除所有错误状态
      internal_clearAuthError();
      internal_clearProfileError();
      internal_clearPermissionError();
    } catch (error) {
      // 如果顶层登录失败，清理所有状态
      get().logout();
      get().internal_setAuthError("LoginError", (error as Error).message);
      throw error;
    } finally {
      internal_setAuthLoading(false);
    }
  },

  logout: async () => {
    const {
      internal_setAuthLoading,
      internal_dispatchAuth,
      internal_clearAuthError,
      internal_clearUserInfo,
      internal_clearPermissions,
      internal_clearProfileError,
      internal_clearPermissionError,
    } = get();

    const abortController = internal_setAuthLoading(true, "logout");

    try {
      // next-auth 会处理实际的登出逻辑
      // 这里只需要清理前端状态
    } catch (error) {
      // 即使有错误，也要清理本地状态
      console.warn("Logout process error, but clearing local state:", error);
    } finally {
      // 清理所有状态
      internal_dispatchAuth({ type: "clearToken" });
      internal_clearUserInfo();
      internal_clearPermissions();
      internal_clearAuthError();
      internal_clearProfileError();
      internal_clearPermissionError();
      internal_setAuthLoading(false);
    }
  },

  refreshAuth: async () => {
    const { internal_toggleAuthLoading, internal_clearAuthError } = get();

    const abortController = internal_toggleAuthLoading(true, "refreshAuth");

    try {
      // 这里应该调用刷新认证状态的API
      // const authStatus = await refreshAuthStatus();
      // internal_dispatchAuth({ type: 'setLoginStatus', value: authStatus.isValid });

      internal_clearAuthError();
    } catch (error) {
      get().internal_setAuthError("RefreshAuthError", (error as Error).message);
      throw error;
    } finally {
      internal_toggleAuthLoading(false, "refreshAuth");
    }
  },

  // === Internal Actions ===
  internal_setToken: (token: string) => {
    get().internal_dispatchAuth({ type: "setToken", value: token });
  },

  internal_clearToken: () => {
    get().internal_dispatchAuth({ type: "clearToken" });
  },

  internal_setLoginStatus: (status: boolean) => {
    get().internal_dispatchAuth({ type: "setLoginStatus", value: status });
  },

  // 加载状态管理
  internal_toggleAuthLoading: (
    loading: boolean,
    id: string,
    action?: string
  ) => {
    const currentState = get();

    if (loading) {
      const abortController = new AbortController();
      set(
        {
          authAbortController: abortController,
          authLoadingIds: toggleBooleanList(
            currentState.authLoadingIds,
            id,
            loading
          ),
        },
        false
      );
      return abortController;
    } else {
      set(
        {
          authAbortController: undefined,
          authLoadingIds: toggleBooleanList(
            currentState.authLoadingIds,
            id,
            loading
          ),
        },
        false
      );
    }
  },

  internal_setAuthLoading: (loading: boolean, action?: string) => {
    if (loading) {
      const abortController = new AbortController();
      set(
        {
          authAbortController: abortController,
          authLoadingIds: ["auth-operation"],
        },
        false
      );
      return abortController;
    } else {
      set(
        {
          authAbortController: undefined,
          authLoadingIds: [],
        },
        false
      );
    }
  },

  isAuthLoading: (id?: string) => {
    const state = get();
    return id
      ? state.authLoadingIds.includes(id)
      : state.authLoadingIds.length > 0;
  },

  // 错误管理
  internal_setAuthError: (type: string, message: string, code?: string) => {
    get().internal_dispatchAuth({
      type: "setAuthError",
      value: { type, message, code },
    });
  },

  internal_clearAuthError: () => {
    get().internal_dispatchAuth({ type: "clearAuthError" });
  },

  hasAuthError: () => {
    return !!get().authError;
  },

  // === Dispatch Methods ===
  internal_dispatchAuth: (action: AuthDispatch) => {
    const currentState = get();
    const newAuthState = authReducer(
      {
        isLoggedIn: currentState.isLoggedIn,
        token: currentState.token,
        authError: currentState.authError,
      },
      action
    );

    if (
      isEqual(newAuthState, {
        isLoggedIn: currentState.isLoggedIn,
        token: currentState.token,
        authError: currentState.authError,
      })
    )
      return;

    set(newAuthState, false);
  },

  // SWR Integration
  refreshAuthStatus: async () => {
    // 这里应该实现SWR的mutate调用
    // return mutate([SWR_USE_FETCH_AUTH_STATUS]);
  },
});
