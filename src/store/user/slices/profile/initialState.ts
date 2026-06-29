/**
 * Profile Slice Initial State
 * 用户档案信息状态管理
 */

import { UserInfo } from '../../types';

export interface ProfileState {
  // 用户信息
  userInfo: UserInfo;

  // 加载状态管理
  profileLoadingIds: string[];
  profileAbortController?: AbortController;

  // 错误状态
  profileError?: {
    type: string;
    message: string;
    code?: string;
  };

  // 初始化标记
  profileInit: boolean;
}

export const initialProfileState: ProfileState = {
  userInfo: {
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
  },
  profileLoadingIds: [],
  profileAbortController: undefined,
  profileError: undefined,
  profileInit: false,
};