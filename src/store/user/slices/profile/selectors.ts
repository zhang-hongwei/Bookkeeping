/**
 * Profile Slice Selectors
 * 用户档案信息查询函数
 */

import type { UserStore } from '../../store';

// 基础用户信息selectors
const getUserInfo = (s: UserStore) => s.userInfo;
const getUserId = (s: UserStore) => s.userInfo.id;
const getUsername = (s: UserStore) => s.userInfo.username;
const getUserName = (s: UserStore) => s.userInfo.name;
const getUserEmail = (s: UserStore) => s.userInfo.email;
const getUserAvatar = (s: UserStore) => s.userInfo.avatar;
const getUserPhone = (s: UserStore) => s.userInfo.phone;
const getUserRole = (s: UserStore) => s.userInfo.role;
const getUserStatus = (s: UserStore) => s.userInfo.status;
const getProjectId = (s: UserStore) => s.userInfo.projectId;
const getLastLoginTime = (s: UserStore) => s.userInfo.lastLoginTime;
const getUserCreatedAt = (s: UserStore) => s.userInfo.createdAt;
const getUserUpdatedAt = (s: UserStore) => s.userInfo.updatedAt;

// 状态检查selectors
const isUserActive = (s: UserStore) => s.userInfo.status === 'active';
const isUserInactive = (s: UserStore) => s.userInfo.status === 'inactive';
const isUserBanned = (s: UserStore) => s.userInfo.status === 'banned';
const hasProject = (s: UserStore) => !!s.userInfo.projectId;

// 角色检查selectors
const isAdmin = (s: UserStore) => s.userInfo.role === 'admin';
const isUser = (s: UserStore) => s.userInfo.role === 'user';
const isModerator = (s: UserStore) => s.userInfo.role === 'moderator';

// 计算属性selectors
const getUserDisplayName = (s: UserStore) => s.userInfo.name || s.userInfo.username || s.userInfo.email;
const isUserInfoComplete = (s: UserStore) => {
  const { username, name, email } = s.userInfo;
  return !!(username && name && email);
};

// 加载状态selectors
const getProfileLoadingIds = (s: UserStore) => s.profileLoadingIds;
const isProfileLoading = (id?: string) => (s: UserStore) => {
  if (id) return s.profileLoadingIds.includes(id);
  return s.profileLoadingIds.length > 0;
};
const getProfileAbortController = (s: UserStore) => s.profileAbortController;

// 错误状态selectors
const getProfileError = (s: UserStore) => s.profileError;
const hasProfileError = (s: UserStore) => !!s.profileError;
const getProfileErrorType = (s: UserStore) => s.profileError?.type;
const getProfileErrorMessage = (s: UserStore) => s.profileError?.message;
const getProfileErrorCode = (s: UserStore) => s.profileError?.code;

// 初始化状态selectors
const isProfileInit = (s: UserStore) => s.profileInit;
const needsProfileInit = (s: UserStore) => !s.profileInit;

// 统一导出profile selectors
export const profileSelectors = {
  // 基础用户信息
  getUserInfo,
  getUserId,
  getUsername,
  getUserName,
  getUserEmail,
  getUserAvatar,
  getUserPhone,
  getUserRole,
  getUserStatus,
  getProjectId,
  getLastLoginTime,
  getUserCreatedAt,
  getUserUpdatedAt,

  // 状态检查
  isUserActive,
  isUserInactive,
  isUserBanned,
  hasProject,

  // 角色检查
  isAdmin,
  isUser,
  isModerator,

  // 计算属性
  getUserDisplayName,
  isUserInfoComplete,

  // 加载状态
  getProfileLoadingIds,
  isProfileLoading,
  getProfileAbortController,

  // 错误状态
  getProfileError,
  hasProfileError,
  getProfileErrorType,
  getProfileErrorMessage,
  getProfileErrorCode,

  // 初始化状态
  isProfileInit,
  needsProfileInit,
};