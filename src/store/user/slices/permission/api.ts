/**
 * 用户权限相关 API 调用
 */

/**
 * 获取用户权限
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const response = await fetch(`/api/users/${userId}/permissions`);

  if (!response.ok) {
    throw new Error('Failed to fetch user permissions');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * 刷新用户权限
 */
export async function refreshUserPermissions(userId: string): Promise<string[]> {
  const response = await fetch(`/api/users/${userId}/permissions/refresh`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to refresh user permissions');
  }

  const data = await response.json();
  return data.data || [];
}