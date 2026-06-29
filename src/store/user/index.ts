/**
 * User Store 导出文件
 */

// 重新导出store
export { default as useUserStore, getUserStoreState } from "./store";

// 重新导出类型
export type { UserStore } from "./store";
export type { UserInfo } from "./types";

// 重新导出初始状态
export { initialState } from "./initialState";

// 重新导出selectors
export {
  userSelectors,
  authSelectors,
  profileSelectors,
  permissionSelectors
} from "./selectors";

// API functions have been moved to services layer
// Use services directly instead: import { userService } from '@/services/user.service';