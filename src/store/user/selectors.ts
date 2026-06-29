/**
 * User Store Selectors
 * 统一导出所有Slice的selectors
 */

// 导出所有slice的selectors
export { authSelectors } from './slices/auth/selectors';
export { profileSelectors } from './slices/profile/selectors';
export { permissionSelectors } from './slices/permission/selectors';

// 重新导出常用的selectors作为顶层快捷方式
import { authSelectors } from './slices/auth/selectors';
import { profileSelectors } from './slices/profile/selectors';
import { permissionSelectors } from './slices/permission/selectors';

// 用户选择器 - 提供便捷访问
export const userSelectors = {
  // 认证相关
  isLoggedIn: authSelectors.isLoggedIn,
  getToken: authSelectors.getToken,
  isAuthenticated: authSelectors.isAuthenticated,
  needsAuthentication: authSelectors.needsAuthentication,

  // 用户信息相关
  getUserInfo: profileSelectors.getUserInfo,
  getUserId: profileSelectors.getUserId,
  getUsername: profileSelectors.getUsername,
  getUserName: profileSelectors.getUserName,
  getUserEmail: profileSelectors.getUserEmail,
  getUserAvatar: profileSelectors.getUserAvatar,
  getUserDisplayName: profileSelectors.getUserDisplayName,
  isUserInfoComplete: profileSelectors.isUserInfoComplete,

  // 权限相关
  getPermissions: permissionSelectors.getPermissions,
  hasPermission: permissionSelectors.hasPermission,
  hasAnyPermission: permissionSelectors.hasAnyPermission,
  hasAllPermissions: permissionSelectors.hasAllPermissions,

  // 角色相关
  isAdmin: profileSelectors.isAdmin,
  isUser: profileSelectors.isUser,
  isModerator: profileSelectors.isModerator,

  // 状态相关
  isUserActive: profileSelectors.isUserActive,
  isUserInactive: profileSelectors.isUserInactive,
  isUserBanned: profileSelectors.isUserBanned,

  // 加载状态（聚合所有slice的加载状态）
  isLoading: (id?: string, slice?: 'auth' | 'profile' | 'permission') => (s: any) => {
    if (slice) {
      switch (slice) {
        case 'auth':
          return authSelectors.isAuthLoading(id)(s);
        case 'profile':
          return profileSelectors.isProfileLoading(id)(s);
        case 'permission':
          return permissionSelectors.isPermissionLoading(id)(s);
        default:
          return false;
      }
    }
    // 如果没有指定slice，检查所有slice的加载状态
    return (
      authSelectors.isAuthLoading(id)(s) ||
      profileSelectors.isProfileLoading(id)(s) ||
      permissionSelectors.isPermissionLoading(id)(s)
    );
  },

  // 错误状态（聚合所有slice的错误状态）
  hasError: (slice?: 'auth' | 'profile' | 'permission') => (s: any) => {
    if (slice) {
      switch (slice) {
        case 'auth':
          return authSelectors.hasAuthError(s);
        case 'profile':
          return profileSelectors.hasProfileError(s);
        case 'permission':
          return permissionSelectors.hasPermissionError(s);
        default:
          return false;
      }
    }
    // 如果没有指定slice，检查所有slice的错误状态
    return (
      authSelectors.hasAuthError(s) ||
      profileSelectors.hasProfileError(s) ||
      permissionSelectors.hasPermissionError(s)
    );
  },

  // 初始化状态
  isInitialized: (s: any) => {
    return (
      profileSelectors.isProfileInit(s) &&
      permissionSelectors.isPermissionsInit(s)
    );
  },
};