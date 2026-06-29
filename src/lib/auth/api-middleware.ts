/**
 * API 路由权限映射配置
 * 统一管理所有 API 端点的权限要求
 */

import { PERMISSIONS } from './permissions';

// API 路由权限映射
export const API_PERMISSIONS = {
  // 用户管理
  'GET /api/users': [PERMISSIONS.USER_VIEW],
  'POST /api/users': [PERMISSIONS.USER_CREATE],
  'PATCH /api/users/[id]': [PERMISSIONS.USER_UPDATE],
  'DELETE /api/users/[id]': [PERMISSIONS.USER_DELETE],

  // 角色管理
  'GET /api/roles': [PERMISSIONS.ROLE_VIEW],
  'POST /api/roles': [PERMISSIONS.ROLE_CREATE],
  'PATCH /api/roles/[id]': [PERMISSIONS.ROLE_UPDATE],
  'DELETE /api/roles/[id]': [PERMISSIONS.ROLE_DELETE],

  // 用户角色分配
  'GET /api/users/[id]/roles': [PERMISSIONS.ROLE_VIEW],
  'POST /api/users/[id]/roles': [PERMISSIONS.ROLE_ASSIGN],
  'DELETE /api/users/[id]/roles': [PERMISSIONS.ROLE_ASSIGN],

  // 健康数据
  'GET /api/nutrition-stats': [PERMISSIONS.USER_VIEW], // 自己的数据
  'GET /api/health-goals': [PERMISSIONS.USER_VIEW],
  'POST /api/health-goals': [PERMISSIONS.USER_UPDATE],

  // 公开接口（无需权限）
  'POST /api/auth/signin': [],
  'POST /api/register': [],
  'GET /api/auth/permissions': [], // 已登录即可
} as const;

// 匹配 API 路径和方法
export function matchApiPermissions(method: string, pathname: string): string[] {
  const key = `${method} ${pathname}` as keyof typeof API_PERMISSIONS;

  // 精确匹配
  if (API_PERMISSIONS[key]) {
    return API_PERMISSIONS[key];
  }

  // 动态路由匹配
  for (const [pattern, permissions] of Object.entries(API_PERMISSIONS)) {
    const [patternMethod, patternPath] = pattern.split(' ');

    if (patternMethod === method && matchDynamicRoute(patternPath, pathname)) {
      return permissions;
    }
  }

  // 默认需要登录但无特殊权限
  return [];
}

// 匹配动态路由 /api/users/[id] -> /api/users/123
function matchDynamicRoute(pattern: string, pathname: string): boolean {
  const patternParts = pattern.split('/');
  const pathnameParts = pathname.split('/');

  if (patternParts.length !== pathnameParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return true; // 动态段匹配任何值
    }
    return part === pathnameParts[index];
  });
}