/**
 * Auth Slice Initial State
 * 用户认证状态管理
 */

export interface AuthState {
  // 登录状态
  isLoggedIn: boolean;
  token?: string;

  // 加载状态管理
  authLoadingIds: string[];
  authAbortController?: AbortController;

  // 错误状态
  authError?: {
    type: string;
    message: string;
    code?: string;
  };
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  token: undefined,
  authLoadingIds: [],
  authAbortController: undefined,
  authError: undefined,
};