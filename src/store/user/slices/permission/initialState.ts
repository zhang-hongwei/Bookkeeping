/**
 * Permission Slice Initial State
 * 用户权限状态管理
 */

export interface PermissionState {
  // 权限列表
  permissions: string[];

  // 加载状态管理
  permissionLoadingIds: string[];
  permissionAbortController?: AbortController;

  // 错误状态
  permissionError?: {
    type: string;
    message: string;
    code?: string;
  };

  // 初始化标记
  permissionsInit: boolean;
}

export const initialPermissionState: PermissionState = {
  permissions: [],
  permissionLoadingIds: [],
  permissionAbortController: undefined,
  permissionError: undefined,
  permissionsInit: false,
};