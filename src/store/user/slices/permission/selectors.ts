/**
 * Permission Slice Selectors
 * 用户权限查询函数
 */

import type { UserStore } from '../../store';

// 基础权限selectors
const getPermissions = (s: UserStore) => s.permissions;
const hasPermission = (permission: string) => (s: UserStore) =>
  s.permissions.includes(permission);
const hasAnyPermission = (permissions: string[]) => (s: UserStore) =>
  permissions.some(permission => s.permissions.includes(permission));
const hasAllPermissions = (permissions: string[]) => (s: UserStore) =>
  permissions.every(permission => s.permissions.includes(permission));

// 权限计数selectors
const getPermissionCount = (s: UserStore) => s.permissions.length;
const hasNoPermissions = (s: UserStore) => s.permissions.length === 0;
const hasAnyPermissions = (s: UserStore) => s.permissions.length > 0;

// 权限类别检查selectors（根据权限命名约定）
const hasAdminPermissions = (s: UserStore) =>
  s.permissions.some(p => p.startsWith('admin:'));
const hasUserPermissions = (s: UserStore) =>
  s.permissions.some(p => p.startsWith('user:'));
const hasModeratorPermissions = (s: UserStore) =>
  s.permissions.some(p => p.startsWith('moderator:'));

// 特定权限检查selectors
const canRead = (resource: string) => (s: UserStore) =>
  s.permissions.includes(`${resource}:read`) || s.permissions.includes('admin:all');
const canWrite = (resource: string) => (s: UserStore) =>
  s.permissions.includes(`${resource}:write`) || s.permissions.includes('admin:all');
const canDelete = (resource: string) => (s: UserStore) =>
  s.permissions.includes(`${resource}:delete`) || s.permissions.includes('admin:all');
const canManage = (resource: string) => (s: UserStore) =>
  s.permissions.includes(`${resource}:manage`) || s.permissions.includes('admin:all');

// 加载状态selectors
const getPermissionLoadingIds = (s: UserStore) => s.permissionLoadingIds;
const isPermissionLoading = (id?: string) => (s: UserStore) => {
  if (id) return s.permissionLoadingIds.includes(id);
  return s.permissionLoadingIds.length > 0;
};
const getPermissionAbortController = (s: UserStore) => s.permissionAbortController;

// 错误状态selectors
const getPermissionError = (s: UserStore) => s.permissionError;
const hasPermissionError = (s: UserStore) => !!s.permissionError;
const getPermissionErrorType = (s: UserStore) => s.permissionError?.type;
const getPermissionErrorMessage = (s: UserStore) => s.permissionError?.message;
const getPermissionErrorCode = (s: UserStore) => s.permissionError?.code;

// 初始化状态selectors
const isPermissionsInit = (s: UserStore) => s.permissionsInit;
const needsPermissionsInit = (s: UserStore) => !s.permissionsInit;

// 权限分组selectors
const getPermissionsByCategory = (s: UserStore) => {
  const permissions = s.permissions;
  const grouped: Record<string, string[]> = {};

  permissions.forEach(permission => {
    const [category] = permission.split(':');
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(permission);
  });

  return grouped;
};

const getPermissionCategories = (s: UserStore) => {
  const permissions = s.permissions;
  const categories = new Set<string>();

  permissions.forEach(permission => {
    const [category] = permission.split(':');
    categories.add(category);
  });

  return Array.from(categories);
};

// 统一导出permission selectors
export const permissionSelectors = {
  // 基础权限
  getPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,

  // 权限计数
  getPermissionCount,
  hasNoPermissions,
  hasAnyPermissions,

  // 权限类别检查
  hasAdminPermissions,
  hasUserPermissions,
  hasModeratorPermissions,

  // 特定权限检查
  canRead,
  canWrite,
  canDelete,
  canManage,

  // 加载状态
  getPermissionLoadingIds,
  isPermissionLoading,
  getPermissionAbortController,

  // 错误状态
  getPermissionError,
  hasPermissionError,
  getPermissionErrorType,
  getPermissionErrorMessage,
  getPermissionErrorCode,

  // 初始化状态
  isPermissionsInit,
  needsPermissionsInit,

  // 权限分组
  getPermissionsByCategory,
  getPermissionCategories,
};