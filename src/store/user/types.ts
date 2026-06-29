/**
 * User Store 类型定义
 * 采用模块化Slice架构
 */

import { AuthState } from './slices/auth/initialState';
import { ProfileState } from './slices/profile/initialState';
import { PermissionState } from './slices/permission/initialState';

// User Info Interface
export interface UserInfo {
  id?: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  role: string;
  projectId?: string;
  permissions: string[];
  lastLoginTime: string;
  status: 'active' | 'inactive' | 'banned';
  createdAt?: number;
  updatedAt?: number;
}

// 聚合所有Slice的State
export type UserStoreState = AuthState &
  ProfileState &
  PermissionState;