/**
 * User Store
 * 采用模块化Slice架构聚合所有用户相关状态和操作
 */

import { subscribeWithSelector, persist, devtools } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import { StateCreator } from "zustand/vanilla";

import { type UserStoreState, initialState } from "./initialState";
import { type AuthAction, createAuthSlice } from "./slices/auth/action";
import {
  type ProfileAction,
  createProfileSlice,
} from "./slices/profile/action";
import {
  type PermissionAction,
  createPermissionSlice,
} from "./slices/permission/action";

export type UserStore = UserStoreState &
  AuthAction &
  ProfileAction &
  PermissionAction & {
    // 通用状态设置
    setState: (newState: Partial<UserStore>) => void;
  };

const createStore: StateCreator<UserStore> = (...parameters) => ({
  ...initialState,
  ...createAuthSlice(...parameters),
  ...createProfileSlice(...parameters),
  ...createPermissionSlice(...parameters),

  // 通用状态设置
  setState: (newState: Partial<UserStore>) => {
    const [set] = parameters;
    set(newState, false);
  },
});

//  ===============  实装 useStore ============ //

export const useUserStore = createWithEqualityFn<UserStore>()(
  subscribeWithSelector(
    devtools(
      persist(createStore, {
        name: "user-store",
        // 持久化配置 - 只持久化必要的状态
        partialize: (state: UserStore) => ({
          // 认证状态 - 必须持久化
          isLoggedIn: state.isLoggedIn,
          token: state.token,

          // 用户基本信息 - 建议持久化
          userInfo: {
            id: state.userInfo.id,
            username: state.userInfo.username,
            name: state.userInfo.name,
            email: state.userInfo.email,
            avatar: state.userInfo.avatar,
            role: state.userInfo.role,
            status: state.userInfo.status,
          },

          // 权限信息 - 建议持久化
          permissions: state.permissions,

          // 初始化标记
          profileInit: state.profileInit,
          permissionsInit: state.permissionsInit,
        }),

        // 版本控制
        version: 1,

        // 迁移函数（当版本更新时）
        migrate: (persistedState: unknown, version: number) => {
          if (version < 1) {
            // 处理版本升级逻辑
            return {
              ...initialState,
              ...(persistedState as object),
            };
          }
          return persistedState;
        },
      }),
      {
        name: "user-store",
      }
    )
  ),
  shallow
);

export const getUserStoreState = () => useUserStore.getState();

// 默认导出
export default useUserStore;

// 导出类型
export type { UserInfo } from "./types";
