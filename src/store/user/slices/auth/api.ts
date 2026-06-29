/**
 * 认证相关 API 调用
 */

/**
 * 用户登出
 */
export async function logoutUser(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to logout');
  }
}