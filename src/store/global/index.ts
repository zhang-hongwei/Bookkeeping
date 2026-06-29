/**
 * 全局状态管理模块
 * 
 * 提供应用级别的状态管理，包括：
 * - 应用设置（主题、语言、布局等）
 * - 加载状态管理
 * - 通知系统
 * - 模态框管理
 * - 设备信息检测
 * - 页面信息管理
 * - 错误处理
 */

// 导出主要的 Store
export {
  useGlobalStore,
  useGlobalSelector,
  useGlobalActions,
  
  // 便捷的选择器 Hooks
  useThemeSettings,
  useSidebarState,
  useDeviceInfo,
  usePageInfo,
  useNotifications,
  useOnlineStatus,
  useErrorState,
} from './store';

// 导出类型定义
export type {
  GlobalStore,
  GlobalState,
  GlobalActions,
  AppSettings,
  NotificationItem,
  NotificationType,
  ThemeMode,
  Locale,
  SidebarState,
  LoadingState,
} from './types';

// 导出初始状态（主要用于测试和重置）
export { globalInitialState } from './initialState';

// 默认导出主 Store
export { default } from './store';