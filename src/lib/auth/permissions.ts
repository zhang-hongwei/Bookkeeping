/**
 * 权限系统核心模块
 */

// 权限定义
export const PERMISSIONS = {
  // 用户管理
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_VIEW_OWN: 'user:view:own',
  USER_UPDATE_OWN: 'user:update:own',
  
  // 角色管理
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_ASSIGN: 'role:assign',
  
  // 权限管理
  PERMISSION_VIEW: 'permission:view',
  PERMISSION_ASSIGN: 'permission:assign',
  
  // 系统管理
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_BACKUP: 'system:backup',
  
  // 管理员权限
  ADMIN_ACCESS: 'admin:access',
  ADMIN_SUPER: 'admin:super',
  
  // 审计日志
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// 默认角色定义
export const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    name: 'super_admin',
    description: '超级管理员',
    is_system: true,
    permissions: ['*'], // 所有权限
  },
  ADMIN: {
    name: 'admin',
    description: '管理员',
    is_system: true,
    permissions: [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.ROLE_VIEW,
      PERMISSIONS.ROLE_ASSIGN,
      PERMISSIONS.PERMISSION_VIEW,
      PERMISSIONS.ADMIN_ACCESS,
      PERMISSIONS.AUDIT_VIEW,
    ],
  },
  USER: {
    name: 'user',
    description: '普通用户',
    is_system: true,
    permissions: [
      PERMISSIONS.USER_VIEW_OWN,
      PERMISSIONS.USER_UPDATE_OWN,
    ],
  },
  GUEST: {
    name: 'guest',
    description: '访客',
    is_system: true,
    permissions: [
      PERMISSIONS.USER_VIEW,
    ],
  },
} as const;

// 权限检查工具函数
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string | string[],
  options?: {
    requireAll?: boolean; // 是否需要所有权限
    checkOwnership?: boolean; // 是否检查所有权
    ownerId?: string;
    userId?: string;
  }
): boolean {
  const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
  
  // 超级管理员拥有所有权限
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // 检查通配符权限（如 user:* 匹配 user:create）
  const hasWildcard = userPermissions.some(perm => {
    if (perm.endsWith(':*')) {
      const prefix = perm.slice(0, -2);
      return required.some(req => req.startsWith(prefix + ':'));
    }
    return false;
  });
  
  if (hasWildcard) {
    return true;
  }
  
  // 检查所有权
  if (options?.checkOwnership && options.ownerId && options.userId) {
    const ownPermissions = required.map(p => p + ':own');
    const hasOwnPermission = ownPermissions.some(p => userPermissions.includes(p));
    
    if (hasOwnPermission && options.ownerId === options.userId) {
      return true;
    }
  }
  
  // 标准权限检查
  if (options?.requireAll) {
    return required.every(perm => userPermissions.includes(perm));
  } else {
    return required.some(perm => userPermissions.includes(perm));
  }
}

// 权限组合工具
export function combinePermissions(...permissionSets: string[][]): string[] {
  const combined = new Set<string>();
  
  for (const permissions of permissionSets) {
    for (const permission of permissions) {
      combined.add(permission);
    }
  }
  
  return Array.from(combined);
}

// 权限继承解析
export function resolvePermissions(permissions: string[]): string[] {
  const resolved = new Set<string>();
  
  for (const permission of permissions) {
    resolved.add(permission);
    
    // 处理通配符
    if (permission === '*') {
      // 返回所有权限
      return Object.values(PERMISSIONS);
    }
    
    // 处理部分通配符（如 user:*）
    if (permission.endsWith(':*')) {
      const prefix = permission.slice(0, -2);
      Object.values(PERMISSIONS).forEach(perm => {
        if (perm.startsWith(prefix + ':')) {
          resolved.add(perm);
        }
      });
    }
  }
  
  return Array.from(resolved);
}