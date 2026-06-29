/**
 * 路由元数据配置文件
 * 用于存储每个页面的描述性信息，便于 SEO 和文档管理
 */

export interface RouteMetadata {
  /** 路由路径 */
  path: string;
  /** 页面标题 */
  title: string;
  /** 页面描述 */
  description: string;
  /** 关键词 */
  keywords?: string[];
  /** 页面类型 */
  category: "main" | "auth" | "admin" | "public";
  /** 是否需要认证 */
  requiresAuth: boolean;
  /** 是否在 sitemap 中显示 */
  includeInSitemap: boolean;
  /** 页面图标或图片 */
  icon?: string;
  /** 页面的优先级说明 */
  priorityNote?: string;
  /** 更新频率说明 */
  updateFrequencyNote?: string;
}

/**
 * 所有路由的元数据配置
 */
export const routesMetadata: RouteMetadata[] = [
  // ============ 主要应用页面 (main) ============
  {
    path: "/",
    title: "AI Template - 首页",
    description:
      "一个现代化的 Next.js 16 AI 模板，集成 TypeScript、MUI v7、Zustand 状态管理和完整的组件库",
    keywords: ["Next.js", "AI", "Template", "TypeScript", "MUI"],
    category: "public",
    requiresAuth: false,
    includeInSitemap: true,
    priorityNote: "最高优先级 - 网站首页",
    updateFrequencyNote: "每日更新 - 首页内容经常变化",
  },
  {
    path: "/app",
    title: "应用中心",
    description: "应用主界面，查看和管理所有功能模块",
    keywords: ["应用", "仪表盘", "管理"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "高优先级 - 主要应用入口",
    updateFrequencyNote: "每周更新",
  },
  {
    path: "/playground",
    title: "实验室",
    description: "功能测试和实验区域，尝试新功能和组件",
    keywords: ["实验", "测试", "playground"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "中等优先级 - 实验性功能",
    updateFrequencyNote: "每周更新 - 功能频繁更新",
  },
  {
    path: "/booking",
    title: "预约管理",
    description: "管理和查看所有预约信息",
    keywords: ["预约", "日程", "管理"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "中等优先级 - 业务功能",
    updateFrequencyNote: "每周更新",
  },
  {
    path: "/product",
    title: "产品管理",
    description: "查看和管理产品信息，包括产品列表、详情和编辑",
    keywords: ["产品", "管理", "库存"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "高优先级 - 核心业务功能",
    updateFrequencyNote: "每周更新 - 产品信息频繁变化",
  },
  {
    path: "/product-insights",
    title: "产品洞察",
    description: "产品数据分析和洞察，查看产品表现和趋势",
    keywords: ["产品", "分析", "洞察", "数据"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "高优先级 - 数据分析功能",
    updateFrequencyNote: "每周更新",
  },
  {
    path: "/blog",
    title: "博客",
    description: "阅读最新的技术文章和更新日志",
    keywords: ["博客", "文章", "技术"],
    category: "main",
    requiresAuth: false,
    includeInSitemap: true,
    priorityNote: "高优先级 - 内容页面",
    updateFrequencyNote: "每日更新 - 内容频繁发布",
  },
  {
    path: "/profile",
    title: "个人资料",
    description: "查看和编辑个人资料信息",
    keywords: ["个人资料", "用户", "设置"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "中等优先级 - 用户功能",
    updateFrequencyNote: "每月更新 - 个人信息不常变化",
  },
  {
    path: "/user-list",
    title: "用户列表",
    description: "管理系统用户，查看用户信息和权限",
    keywords: ["用户", "管理", "列表"],
    category: "admin",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "中等优先级 - 管理功能",
    updateFrequencyNote: "每日更新 - 用户数据变化",
  },
  {
    path: "/file-manager",
    title: "文件管理器",
    description: "管理和组织文件，支持上传、下载和分享",
    keywords: ["文件", "管理", "存储"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "中等优先级 - 工具功能",
    updateFrequencyNote: "每周更新",
  },
  {
    path: "/account",
    title: "账户设置",
    description: "管理账户设置和偏好",
    keywords: ["账户", "设置", "偏好"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "中等优先级 - 用户功能",
    updateFrequencyNote: "每月更新 - 设置不常变化",
  },
  {
    path: "/analytics",
    title: "数据分析",
    description: "查看应用数据分析和统计报告",
    keywords: ["分析", "数据", "统计", "报告"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "高优先级 - 数据功能",
    updateFrequencyNote: "每日更新 - 数据实时变化",
  },
  {
    path: "/invoice",
    title: "发票管理",
    description: "管理和查看发票信息",
    keywords: ["发票", "财务", "管理"],
    category: "main",
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: "中等优先级 - 业务功能",
    updateFrequencyNote: "每周更新",
  },

  // ============ 认证页面 (auth) ============
  {
    path: "/login",
    title: "登录",
    description: "用户登录页面",
    keywords: ["登录", "认证"],
    category: "auth",
    requiresAuth: false,
    includeInSitemap: false,
    priorityNote: "低优先级 - 认证页面通常不收录",
    updateFrequencyNote: "很少更新",
  },
  {
    path: "/signup",
    title: "注册",
    description: "用户注册页面",
    keywords: ["注册", "账户创建"],
    category: "auth",
    requiresAuth: false,
    includeInSitemap: false,
    priorityNote: "低优先级 - 认证页面通常不收录",
    updateFrequencyNote: "很少更新",
  },
  {
    path: "/reset-password",
    title: "重置密码",
    description: "重置账户密码",
    keywords: ["密码", "重置", "找回"],
    category: "auth",
    requiresAuth: false,
    includeInSitemap: false,
    priorityNote: "低优先级 - 认证页面通常不收录",
    updateFrequencyNote: "很少更新",
  },

  // ============ 测试页面 ============
  {
    path: "/test",
    title: "测试页面",
    description: "开发测试页面",
    keywords: ["测试", "开发"],
    category: "main",
    requiresAuth: false,
    includeInSitemap: false,
    priorityNote: "不收录 - 仅用于开发",
    updateFrequencyNote: "不适用",
  },
];

/**
 * 根据路径获取路由元数据
 */
export function getRouteMetadata(path: string): RouteMetadata | undefined {
  return routesMetadata.find((route) => route.path === path);
}

/**
 * 获取所有应包含在 sitemap 中的路由
 */
export function getSitemapRoutes(): RouteMetadata[] {
  return routesMetadata.filter((route) => route.includeInSitemap);
}

/**
 * 根据分类获取路由
 */
export function getRoutesByCategory(
  category: RouteMetadata["category"]
): RouteMetadata[] {
  return routesMetadata.filter((route) => route.category === category);
}

/**
 * 获取需要认证的路由
 */
export function getAuthenticatedRoutes(): RouteMetadata[] {
  return routesMetadata.filter((route) => route.requiresAuth);
}

/**
 * 获取公开访问的路由
 */
export function getPublicRoutes(): RouteMetadata[] {
  return routesMetadata.filter((route) => !route.requiresAuth);
}
