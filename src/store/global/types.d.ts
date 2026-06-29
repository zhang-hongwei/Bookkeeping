// ================== 全局Store类型定义 ==================

// 主题类型
export type ThemeMode = 'light' | 'dark' | 'system';

// 语言类型
export type Locale = 'zh-CN' | 'en-US' | 'ja-JP';

// 侧边栏状态
export interface SidebarState {
  collapsed: boolean;
  width: number;
  mobile: boolean;
}

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知项
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
  read?: boolean;
}

// 加载状态管理
export interface LoadingState {
  global: boolean;
  [key: string]: boolean;
}

// 应用设置
export interface AppSettings {
  // 主题设置
  themeMode: ThemeMode;
  primaryColor: string;
  
  // 语言设置
  locale: Locale;
  
  // 布局设置
  sidebar: SidebarState;
  showBreadcrumb: boolean;
  showFooter: boolean;
  
  // 功能设置
  enableNotifications: boolean;
  enableAnimations: boolean;
  autoSave: boolean;
  
  // 开发者设置
  debugMode: boolean;
  showPerformanceMonitor: boolean;
}

// 全局状态
export interface GlobalState {
  // 应用初始化状态
  initialized: boolean;
  
  // 应用设置
  settings: AppSettings;
  
  // 加载状态
  loading: LoadingState;
  
  // 通知系统
  notifications: NotificationItem[];
  
  // 网络状态
  online: boolean;
  
  // 设备信息
  device: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    userAgent: string;
  };
  
  // 当前页面信息
  currentPage: {
    title: string;
    path: string;
    breadcrumbs: Array<{ label: string; path?: string }>;
  };
  
  // 模态框状态管理
  modals: {
    [key: string]: {
      open: boolean;
      data?: any;
    };
  };
  
  // 错误状态
  error: {
    hasError: boolean;
    message?: string;
    stack?: string;
  };
}

// 全局操作接口
export interface GlobalActions {
  // ============ 基础状态操作 ============
  setState: (newState: Partial<GlobalState>) => void;
  reset: () => void;
  
  // ============ 应用初始化 ============
  initialize: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  
  // ============ 设置管理 ============
  updateSettings: (settings: Partial<AppSettings>) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  setLocale: (locale: Locale) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobile: (mobile: boolean) => void;
  
  // ============ 加载状态管理 ============
  setLoading: (key: string, loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  isLoading: (key?: string) => boolean;
  
  // ============ 通知系统 ============
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // ============ 页面信息管理 ============
  setPageInfo: (title: string, path: string, breadcrumbs?: Array<{ label: string; path?: string }>) => void;
  updatePageTitle: (title: string) => void;
  updateBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
  
  // ============ 模态框管理 ============
  openModal: (key: string, data?: any) => void;
  closeModal: (key: string) => void;
  toggleModal: (key: string, data?: any) => void;
  isModalOpen: (key: string) => boolean;
  getModalData: (key: string) => any;
  
  // ============ 设备检测 ============
  updateDeviceInfo: () => void;
  setOnlineStatus: (online: boolean) => void;
  
  // ============ 错误处理 ============
  setError: (message: string, stack?: string) => void;
  clearError: () => void;
  
  // ============ 工具方法 ============
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

// 完整的全局Store类型
export type GlobalStore = GlobalState & GlobalActions;

// ============ 持久化配置 ============
export interface PersistConfig {
  // 需要持久化的字段
  persistedFields: (keyof GlobalState)[];
  
  // 存储key
  storageKey: string;
  
  // 版本号（用于数据迁移）
  version: number;
}