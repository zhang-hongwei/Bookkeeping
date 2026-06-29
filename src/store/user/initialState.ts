/**
 * User Store Initial State
 * 聚合所有Slice的初始状态
 */

import { initialAuthState } from './slices/auth/initialState';
import { initialProfileState } from './slices/profile/initialState';
import { initialPermissionState } from './slices/permission/initialState';
import { UserStoreState } from './types';

export type { UserStoreState };

export const initialState: UserStoreState = {
  // Auth Slice State
  ...initialAuthState,

  // Profile Slice State
  ...initialProfileState,

  // Permission Slice State
  ...initialPermissionState,
};