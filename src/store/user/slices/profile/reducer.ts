/**
 * Profile Slice Reducer
 * 处理用户档案信息的同步更新逻辑
 */

import { produce } from 'immer';
import { UserInfo } from '../../types';

// Profile Reducer Actions
export interface SetUserInfoAction {
  type: 'setUserInfo';
  value: UserInfo;
}

export interface UpdateUserInfoAction {
  type: 'updateUserInfo';
  value: Partial<UserInfo>;
}

export interface ClearUserInfoAction {
  type: 'clearUserInfo';
}

export interface SetProfileErrorAction {
  type: 'setProfileError';
  value: {
    type: string;
    message: string;
    code?: string;
  };
}

export interface ClearProfileErrorAction {
  type: 'clearProfileError';
}

export interface SetProfileInitAction {
  type: 'setProfileInit';
  value: boolean;
}

export type ProfileDispatch =
  | SetUserInfoAction
  | UpdateUserInfoAction
  | ClearUserInfoAction
  | SetProfileErrorAction
  | ClearProfileErrorAction
  | SetProfileInitAction;

// Profile State Interface
export interface ProfileSliceState {
  userInfo: UserInfo;
  profileError?: {
    type: string;
    message: string;
    code?: string;
  };
  profileInit: boolean;
}

// Profile Reducer
export const profileReducer = (state: ProfileSliceState, payload: ProfileDispatch): ProfileSliceState => {
  switch (payload.type) {
    case 'setUserInfo':
      return produce(state, (draft) => {
        draft.userInfo = {
          ...payload.value,
          updatedAt: Date.now(),
        };
        draft.profileInit = true;
        draft.profileError = undefined;
      });

    case 'updateUserInfo':
      return produce(state, (draft) => {
        draft.userInfo = {
          ...draft.userInfo,
          ...payload.value,
          updatedAt: Date.now(),
        };
        draft.profileError = undefined;
      });

    case 'clearUserInfo':
      return produce(state, (draft) => {
        draft.userInfo = {
          id: undefined,
          username: '',
          name: '',
          email: '',
          avatar: '',
          phone: '',
          role: '',
          projectId: undefined,
          permissions: [],
          lastLoginTime: '',
          status: 'inactive',
          createdAt: undefined,
          updatedAt: undefined,
        };
        draft.profileInit = false;
      });

    case 'setProfileError':
      return produce(state, (draft) => {
        draft.profileError = payload.value;
      });

    case 'clearProfileError':
      return produce(state, (draft) => {
        draft.profileError = undefined;
      });

    case 'setProfileInit':
      return produce(state, (draft) => {
        draft.profileInit = payload.value;
      });

    default:
      return state;
  }
};