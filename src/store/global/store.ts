import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GlobalStore } from './types';
import { globalInitialState } from './initialState';
import { createGlobalActions } from './actions';

/**
 * 全局状态管理 Store
 * 
 * 功能：
 * - 应用设置（主题、语言、布局等）
 * - 加载状态管理
 * - 通知系统
 * - 模态框管理
 * - 设备信息检测
 * - 页面信息管理
 * - 错误处理
 * 
 * 持久化：
 * - 应用设置会被持久化到 localStorage
 * - 临时状态（加载、通知等）不会被持久化
 */
export const useGlobalStore = create<GlobalStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...globalInitialState,
        ...createGlobalActions()(set, get, api),
      }),
      {
        name: 'global-store',
        
        // 只持久化需要保存的状态
        partialize: (state) => ({
          settings: state.settings,
          // 不持久化临时状态：loading, notifications, error, modals
        }),
        
        // 版本控制（用于数据迁移）
        version: 1,
        
        // 数据迁移函数
        migrate: (persistedState: any, version: number) => {
          // 如果存储的版本低于当前版本，进行数据迁移
          if (version < 1) {
            // 可以在这里添加数据迁移逻辑
            return {
              ...persistedState,
              settings: {
                ...globalInitialState.settings,
                ...persistedState.settings,
              },
            };
          }
          return persistedState;
        },
        
        // 序列化配置
        serialize: {
          reviver: (key, value) => {
            // 可以在这里处理特殊的反序列化逻辑
            return value;
          },
        },
        
        // 存储引擎配置（可选）
        // storage: createJSONStorage(() => sessionStorage), // 使用 sessionStorage
      }
    ),
    {
      name: 'global-store',
      // 在开发环境启用 Redux DevTools
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * 获取全局状态的 Hook（选择器模式）
 * 
 * 使用示例：
 * ```tsx
 * const themeMode = useGlobalSelector(state => state.settings.themeMode);
 * const isLoading = useGlobalSelector(state => state.isLoading('api'));
 * ```
 */
export const useGlobalSelector = <T>(selector: (state: GlobalStore) => T): T => {
  return useGlobalStore(selector);
};

/**
 * 获取全局操作方法的 Hook
 * 
 * 使用示例：
 * ```tsx
 * const { setThemeMode, showSuccess, openModal } = useGlobalActions();
 * ```
 */
export const useGlobalActions = () => {
  return useGlobalStore((state) => ({
    // 基础操作
    setState: state.setState,
    reset: state.reset,
    
    // 初始化
    initialize: state.initialize,
    setInitialized: state.setInitialized,
    
    // 设置管理
    updateSettings: state.updateSettings,
    setThemeMode: state.setThemeMode,
    setPrimaryColor: state.setPrimaryColor,
    setLocale: state.setLocale,
    toggleSidebar: state.toggleSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
    setSidebarMobile: state.setSidebarMobile,
    
    // 加载状态
    setLoading: state.setLoading,
    setGlobalLoading: state.setGlobalLoading,
    isLoading: state.isLoading,
    
    // 通知系统
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
    markNotificationAsRead: state.markNotificationAsRead,
    markAllNotificationsAsRead: state.markAllNotificationsAsRead,
    
    // 页面信息
    setPageInfo: state.setPageInfo,
    updatePageTitle: state.updatePageTitle,
    updateBreadcrumbs: state.updateBreadcrumbs,
    
    // 模态框管理
    openModal: state.openModal,
    closeModal: state.closeModal,
    toggleModal: state.toggleModal,
    isModalOpen: state.isModalOpen,
    getModalData: state.getModalData,
    
    // 设备和网络
    updateDeviceInfo: state.updateDeviceInfo,
    setOnlineStatus: state.setOnlineStatus,
    
    // 错误处理
    setError: state.setError,
    clearError: state.clearError,
    
    // 工具方法
    showSuccess: state.showSuccess,
    showError: state.showError,
    showWarning: state.showWarning,
    showInfo: state.showInfo,
  }));
};

/**
 * 便捷的状态选择器 Hooks
 */

// 获取主题设置
export const useThemeSettings = () => {
  return useGlobalSelector(state => ({
    themeMode: state.settings.themeMode,
    primaryColor: state.settings.primaryColor,
  }));
};

// 获取侧边栏状态
export const useSidebarState = () => {
  return useGlobalSelector(state => state.settings.sidebar);
};

// 获取设备信息
export const useDeviceInfo = () => {
  return useGlobalSelector(state => state.device);
};

// 获取当前页面信息
export const usePageInfo = () => {
  return useGlobalSelector(state => state.currentPage);
};

// 获取通知列表
export const useNotifications = () => {
  return useGlobalSelector(state => state.notifications);
};

// 获取在线状态
export const useOnlineStatus = () => {
  return useGlobalSelector(state => state.online);
};

// 获取错误状态
export const useErrorState = () => {
  return useGlobalSelector(state => state.error);
};

// 默认导出
export default useGlobalStore;