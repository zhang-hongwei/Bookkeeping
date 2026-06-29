/**
 * Auth Slice Selectors
 * 认证状态查询函数
 */

import type { UserStore } from '../../store';

// 基础认证selectors
const isLoggedIn = (s: UserStore) => s.isLoggedIn;
const getToken = (s: UserStore) => s.token;
const hasValidToken = (s: UserStore) => !!s.token && s.isLoggedIn;

// 加载状态selectors
const getAuthLoadingIds = (s: UserStore) => s.authLoadingIds;
const isAuthLoading = (id?: string) => (s: UserStore) => {
  if (id) return s.authLoadingIds.includes(id);
  return s.authLoadingIds.length > 0;
};
const getAuthAbortController = (s: UserStore) => s.authAbortController;

// 错误状态selectors
const getAuthError = (s: UserStore) => s.authError;
const hasAuthError = (s: UserStore) => !!s.authError;
const getAuthErrorType = (s: UserStore) => s.authError?.type;
const getAuthErrorMessage = (s: UserStore) => s.authError?.message;
const getAuthErrorCode = (s: UserStore) => s.authError?.code;

// 认证状态检查
const isAuthenticated = (s: UserStore) => s.isLoggedIn && !!s.token;
const needsAuthentication = (s: UserStore) => !s.isLoggedIn || !s.token;

// 统一导出认证selectors
export const authSelectors = {
  // 基础认证
  isLoggedIn,
  getToken,
  hasValidToken,

  // 加载状态
  getAuthLoadingIds,
  isAuthLoading,
  getAuthAbortController,

  // 错误状态
  getAuthError,
  hasAuthError,
  getAuthErrorType,
  getAuthErrorMessage,
  getAuthErrorCode,

  // 认证状态检查
  isAuthenticated,
  needsAuthentication,
};