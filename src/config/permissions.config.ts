/**
 * 权限系统配置文件
 * 可根据项目需求自定义配置
 */

import { PERMISSIONS, DEFAULT_ROLES } from '@/lib/auth/permissions';

// 权限系统配置
export const permissionConfig = {
  // 是否启用RBAC权限系统
  enabled: process.env.NEXT_PUBLIC_ENABLE_RBAC !== 'false',
  
  // 默认角色（新用户注册时自动分配）
  defaultRole: process.env.NEXT_PUBLIC_DEFAULT_ROLE || 'user',
  
  // 超级管理员邮箱列表（首次注册时自动分配super_admin角色）
  superAdminEmails: (process.env.SUPER_ADMIN_EMAILS || '').split(',').filter(Boolean),
  
  // 权限策略
  strategy: {
    // 权限继承模式: flat（扁平）| hierarchical（层级）
    inheritance: 'hierarchical' as 'flat' | 'hierarchical',
    
    // 是否启用资源级权限
    resourceLevel: process.env.ENABLE_RESOURCE_PERMISSIONS === 'true',
    
    // 是否启用动态权限（运行时创建新权限）
    dynamic: process.env.ENABLE_DYNAMIC_PERMISSIONS === 'true',
  },
  
  // 多租户配置
  multiTenant: {
    enabled: process.env.ENABLE_MULTI_TENANT === 'true',
    isolationLevel: 'role' as 'role' | 'permission' | 'both',
  },
  
  // 审计配置
  audit: {
    enabled: process.env.ENABLE_AUDIT_LOG === 'true',
    logLevel: 'all' as 'all' | 'write' | 'critical',
    retention: 90, // 日志保留天数
  },
  
  // 缓存配置
  cache: {
    enabled: true,
    ttl: 300, // 权限缓存时间（秒）
    prefix: 'perm:',
  },
  
  // UI配置
  ui: {
    // 是否显示权限不足的详细信息
    showPermissionErrors: process.env.NODE_ENV === 'development',
    
    // 权限不足时的重定向路径
    unauthorizedRedirect: '/403',
    
    // 未登录时的重定向路径
    unauthenticatedRedirect: '/signin',
  },
};

// 导出权限和角色定义
export { PERMISSIONS, DEFAULT_ROLES };

// 自定义业务权限（项目特定）
export const CUSTOM_PERMISSIONS = {
  // 示例：博客系统权限
  POST_CREATE: 'post:create',
  POST_EDIT: 'post:edit',
  POST_DELETE: 'post:delete',
  POST_PUBLISH: 'post:publish',
  
  // 示例：商城系统权限
  PRODUCT_MANAGE: 'product:manage',
  ORDER_VIEW: 'order:view',
  ORDER_PROCESS: 'order:process',
  
  // 在此添加项目特定的权限...
} as const;

// 自定义角色（项目特定）
export const CUSTOM_ROLES = {
  // 示例：内容编辑角色
  EDITOR: {
    name: 'editor',
    description: '内容编辑',
    permissions: [
      PERMISSIONS.USER_VIEW_OWN,
      PERMISSIONS.USER_UPDATE_OWN,
      CUSTOM_PERMISSIONS.POST_CREATE,
      CUSTOM_PERMISSIONS.POST_EDIT,
    ],
  },
  
  // 示例：内容审核角色
  MODERATOR: {
    name: 'moderator',
    description: '内容审核员',
    permissions: [
      PERMISSIONS.USER_VIEW,
      CUSTOM_PERMISSIONS.POST_EDIT,
      CUSTOM_PERMISSIONS.POST_DELETE,
      CUSTOM_PERMISSIONS.POST_PUBLISH,
    ],
  },
  
  // 在此添加项目特定的角色...
} as const;

// 权限分组（用于UI展示）
export const PERMISSION_GROUPS = {
  用户管理: [
    { code: PERMISSIONS.USER_VIEW, name: '查看用户' },
    { code: PERMISSIONS.USER_CREATE, name: '创建用户' },
    { code: PERMISSIONS.USER_UPDATE, name: '更新用户' },
    { code: PERMISSIONS.USER_DELETE, name: '删除用户' },
  ],
  角色管理: [
    { code: PERMISSIONS.ROLE_VIEW, name: '查看角色' },
    { code: PERMISSIONS.ROLE_CREATE, name: '创建角色' },
    { code: PERMISSIONS.ROLE_UPDATE, name: '更新角色' },
    { code: PERMISSIONS.ROLE_DELETE, name: '删除角色' },
    { code: PERMISSIONS.ROLE_ASSIGN, name: '分配角色' },
  ],
  系统管理: [
    { code: PERMISSIONS.SYSTEM_CONFIG, name: '系统配置' },
    { code: PERMISSIONS.SYSTEM_MONITOR, name: '系统监控' },
    { code: PERMISSIONS.SYSTEM_BACKUP, name: '系统备份' },
  ],
  // 添加自定义权限分组...
};

// 权限验证规则
export const PERMISSION_RULES = {
  // 定义权限之间的依赖关系
  dependencies: {
    [PERMISSIONS.USER_DELETE]: [PERMISSIONS.USER_VIEW],
    [PERMISSIONS.USER_UPDATE]: [PERMISSIONS.USER_VIEW],
    [PERMISSIONS.ROLE_ASSIGN]: [PERMISSIONS.ROLE_VIEW, PERMISSIONS.USER_VIEW],
  },
  
  // 定义互斥权限
  exclusions: {
    // 示例：guest角色不能同时拥有admin权限
    guest: [PERMISSIONS.ADMIN_ACCESS, PERMISSIONS.ADMIN_SUPER],
  },
};

// 初始化函数（用于种子数据）
export async function getInitialPermissions() {
  const permissions = [];
  
  // 添加默认权限
  for (const [key, code] of Object.entries(PERMISSIONS)) {
    const [resource, action, modifier] = code.split(':');
    permissions.push({
      code,
      name: key.replace(/_/g, ' ').toLowerCase(),
      resource,
      action: modifier ? `${action}:${modifier}` : action,
      description: `Permission for ${code}`,
    });
  }
  
  // 添加自定义权限
  for (const [key, code] of Object.entries(CUSTOM_PERMISSIONS)) {
    const [resource, action, modifier] = code.split(':');
    permissions.push({
      code,
      name: key.replace(/_/g, ' ').toLowerCase(),
      resource,
      action: modifier ? `${action}:${modifier}` : action,
      description: `Custom permission for ${code}`,
    });
  }
  
  return permissions;
}

// 初始化角色
export async function getInitialRoles() {
  const roles = [];
  
  // 添加默认角色
  for (const role of Object.values(DEFAULT_ROLES)) {
    roles.push(role);
  }
  
  // 添加自定义角色
  for (const role of Object.values(CUSTOM_ROLES)) {
    roles.push({
      ...role,
      is_system: false,
    });
  }
  
  return roles;
}