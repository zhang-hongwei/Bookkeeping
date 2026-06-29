/**
 * Auth Slice Reducer
 * 处理认证状态的同步更新逻辑
 */

import { produce } from 'immer';

// Auth Reducer Actions
export interface SetTokenAction {
  type: 'setToken';
  value: string;
}

export interface ClearTokenAction {
  type: 'clearToken';
}

export interface SetLoginStatusAction {
  type: 'setLoginStatus';
  value: boolean;
}

export interface SetAuthErrorAction {
  type: 'setAuthError';
  value: {
    type: string;
    message: string;
    code?: string;
  };
}

export interface ClearAuthErrorAction {
  type: 'clearAuthError';
}

export type AuthDispatch =
  | SetTokenAction
  | ClearTokenAction
  | SetLoginStatusAction
  | SetAuthErrorAction
  | ClearAuthErrorAction;

// Auth State Interface
export interface AuthSliceState {
  isLoggedIn: boolean;
  token?: string;
  authError?: {
    type: string;
    message: string;
    code?: string;
  };
}

// Auth Reducer
export const authReducer = (state: AuthSliceState, payload: AuthDispatch): AuthSliceState => {
  switch (payload.type) {
    case 'setToken':
      return produce(state, (draft) => {
        draft.token = payload.value;
        draft.isLoggedIn = true;
        draft.authError = undefined;
      });

    case 'clearToken':
      return produce(state, (draft) => {
        draft.token = undefined;
        draft.isLoggedIn = false;
      });

    case 'setLoginStatus':
      return produce(state, (draft) => {
        draft.isLoggedIn = payload.value;
        if (!payload.value) {
          draft.token = undefined;
        }
      });

    case 'setAuthError':
      return produce(state, (draft) => {
        draft.authError = payload.value;
      });

    case 'clearAuthError':
      return produce(state, (draft) => {
        draft.authError = undefined;
      });

    default:
      return state;
  }
};