/**
 * 认证相关API调用
 */

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

/**
 * 获取用户权限
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const response = await fetch(`/api/auth/permissions?userId=${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user permissions');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * 获取用户角色
 */
export async function getUserRoles(userId: string): Promise<Role[]> {
  const response = await fetch(`/api/roles?userId=${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user roles');
  }

  const data = await response.json();
  return data.data || [];
}