/**
 * 用户资料相关 API 调用
 */
import { UserInfo } from '../../types';

/**
 * 获取用户信息
 */
export async function getUserById(userId: string): Promise<UserInfo> {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, updates: Partial<UserInfo>): Promise<UserInfo> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 更新用户配置文件
 */
export async function updateUserProfile(userId: string, updates: Partial<UserInfo>): Promise<UserInfo> {
  const response = await fetch(`/api/users/${userId}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 删除用户
 */
export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}