import { GlobalState } from './types';

/**
 * 获取设备信息
 */
function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      userAgent: 'Server',
    };
  }

  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    userAgent,
  };
}

/**
 * 获取网络状态
 */
function getOnlineStatus(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * 全局状态初始值
 */
export const globalInitialState: GlobalState = {
  // 应用初始化状态
  initialized: false,

  // 应用设置
  settings: {
    // 主题设置
    themeMode: 'system',
    primaryColor: '#1976d2',

    // 语言设置
    locale: 'zh-CN',

    // 布局设置
    sidebar: {
      collapsed: false,
      width: 260,
      mobile: false,
    },
    showBreadcrumb: true,
    showFooter: true,

    // 功能设置
    enableNotifications: true,
    enableAnimations: true,
    autoSave: true,

    // 开发者设置
    debugMode: process.env.NODE_ENV === 'development',
    showPerformanceMonitor: false,
  },

  // 加载状态
  loading: {
    global: false,
  },

  // 通知系统
  notifications: [],

  // 网络状态
  online: getOnlineStatus(),

  // 设备信息
  device: getDeviceInfo(),

  // 当前页面信息
  currentPage: {
    title: '',
    path: '/',
    breadcrumbs: [],
  },

  // 模态框状态管理
  modals: {},

  // 错误状态
  error: {
    hasError: false,
  },
};