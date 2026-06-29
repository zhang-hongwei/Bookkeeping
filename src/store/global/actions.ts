import { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import { GlobalStore, GlobalState, AppSettings, NotificationItem, ThemeMode, Locale } from './types';
import { globalInitialState } from './initialState';

/**
 * 创建全局状态操作
 */
export const createGlobalActions = (): StateCreator<
  GlobalStore,
  [],
  [],
  GlobalActions
> => (set, get) => ({
  
  // ============ 基础状态操作 ============
  setState: (newState: Partial<GlobalState>) => {
    set((state) => ({ ...state, ...newState }));
  },

  reset: () => {
    set(globalInitialState);
  },

  // ============ 应用初始化 ============
  initialize: async () => {
    const { updateDeviceInfo, setOnlineStatus } = get();
    
    try {
      set({ initialized: false });
      
      // 更新设备信息
      updateDeviceInfo();
      
      // 设置网络状态监听
      if (typeof window !== 'undefined') {
        const handleOnline = () => setOnlineStatus(true);
        const handleOffline = () => setOnlineStatus(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // 清理函数会在组件卸载时调用
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
      
      // 模拟初始化过程
      await new Promise(resolve => setTimeout(resolve, 100));
      
      set({ initialized: true });
    } catch (error) {
      console.error('应用初始化失败:', error);
      get().setError('应用初始化失败', error instanceof Error ? error.stack : undefined);
    }
  },

  setInitialized: (initialized: boolean) => {
    set({ initialized });
  },

  // ============ 设置管理 ============
  updateSettings: (newSettings: Partial<AppSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },

  setThemeMode: (mode: ThemeMode) => {
    set((state) => ({
      settings: { ...state.settings, themeMode: mode }
    }));
  },

  setPrimaryColor: (color: string) => {
    set((state) => ({
      settings: { ...state.settings, primaryColor: color }
    }));
  },

  setLocale: (locale: Locale) => {
    set((state) => ({
      settings: { ...state.settings, locale }
    }));
  },

  toggleSidebar: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        sidebar: {
          ...state.settings.sidebar,
          collapsed: !state.settings.sidebar.collapsed
        }
      }
    }));
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set((state) => ({
      settings: {
        ...state.settings,
        sidebar: { ...state.settings.sidebar, collapsed }
      }
    }));
  },

  setSidebarMobile: (mobile: boolean) => {
    set((state) => ({
      settings: {
        ...state.settings,
        sidebar: { ...state.settings.sidebar, mobile }
      }
    }));
  },

  // ============ 加载状态管理 ============
  setLoading: (key: string, loading: boolean) => {
    set((state) => ({
      loading: { ...state.loading, [key]: loading }
    }));
  },

  setGlobalLoading: (loading: boolean) => {
    set((state) => ({
      loading: { ...state.loading, global: loading }
    }));
  },

  isLoading: (key?: string) => {
    const { loading } = get();
    if (key) {
      return loading[key] || false;
    }
    return loading.global;
  },

  // ============ 通知系统 ============
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const id = nanoid();
    const newNotification: NotificationItem = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration || 5000,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));

    // 自动移除通知
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    }));
  },

  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    }));
  },

  // ============ 页面信息管理 ============
  setPageInfo: (title: string, path: string, breadcrumbs = []) => {
    set((state) => ({
      currentPage: { ...state.currentPage, title, path, breadcrumbs }
    }));
    
    // 更新文档标题
    if (typeof document !== 'undefined') {
      document.title = title ? `${title} | ${process.env.NEXT_PUBLIC_APP_NAME || 'Next.js Template'}` : process.env.NEXT_PUBLIC_APP_NAME || 'Next.js Template';
    }
  },

  updatePageTitle: (title: string) => {
    set((state) => ({
      currentPage: { ...state.currentPage, title }
    }));
    
    if (typeof document !== 'undefined') {
      document.title = title ? `${title} | ${process.env.NEXT_PUBLIC_APP_NAME || 'Next.js Template'}` : process.env.NEXT_PUBLIC_APP_NAME || 'Next.js Template';
    }
  },

  updateBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => {
    set((state) => ({
      currentPage: { ...state.currentPage, breadcrumbs }
    }));
  },

  // ============ 模态框管理 ============
  openModal: (key: string, data?: any) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [key]: { open: true, data }
      }
    }));
  },

  closeModal: (key: string) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [key]: { open: false, data: undefined }
      }
    }));
  },

  toggleModal: (key: string, data?: any) => {
    const { modals } = get();
    const isOpen = modals[key]?.open;
    
    if (isOpen) {
      get().closeModal(key);
    } else {
      get().openModal(key, data);
    }
  },

  isModalOpen: (key: string) => {
    const { modals } = get();
    return modals[key]?.open || false;
  },

  getModalData: (key: string) => {
    const { modals } = get();
    return modals[key]?.data;
  },

  // ============ 设备检测 ============
  updateDeviceInfo: () => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    set((state) => ({
      device: {
        ...state.device,
        isMobile,
        isTablet,
        isDesktop,
        userAgent,
      }
    }));

    // 根据设备类型自动调整侧边栏
    if (isMobile) {
      get().setSidebarMobile(true);
      get().setSidebarCollapsed(true);
    } else {
      get().setSidebarMobile(false);
    }
  },

  setOnlineStatus: (online: boolean) => {
    set({ online });
    
    // 网络状态变化时显示通知
    const { addNotification } = get();
    if (online) {
      addNotification({
        type: 'success',
        title: '网络已连接',
        message: '网络连接已恢复',
        duration: 3000,
      });
    } else {
      addNotification({
        type: 'warning',
        title: '网络已断开',
        message: '请检查网络连接',
        duration: 0, // 不自动消失
      });
    }
  },

  // ============ 错误处理 ============
  setError: (message: string, stack?: string) => {
    set({
      error: {
        hasError: true,
        message,
        stack,
      }
    });

    // 显示错误通知
    get().addNotification({
      type: 'error',
      title: '发生错误',
      message,
      duration: 8000,
    });
  },

  clearError: () => {
    set({
      error: {
        hasError: false,
        message: undefined,
        stack: undefined,
      }
    });
  },

  // ============ 工具方法 ============
  showSuccess: (message: string, title = '成功') => {
    get().addNotification({
      type: 'success',
      title,
      message,
      duration: 4000,
    });
  },

  showError: (message: string, title = '错误') => {
    get().addNotification({
      type: 'error',
      title,
      message,
      duration: 6000,
    });
  },

  showWarning: (message: string, title = '警告') => {
    get().addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000,
    });
  },

  showInfo: (message: string, title = '提示') => {
    get().addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  },
});

// 导入 GlobalActions 类型
import type { GlobalActions } from './types';