/**
 * Sitemap 配置文件
 */

import { MetadataRoute } from 'next';
import { getSitemapRoutes } from './routes-metadata';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export interface SitemapRoute {
  path: string;
  changeFrequency?: MetadataRoute.Sitemap[0]['changeFrequency'];
  priority?: MetadataRoute.Sitemap[0]['priority'];
  lastModified?: Date | string;
}

/**
 * 优先级映射表
 * 根据路由元数据的说明自动分配优先级
 */
const priorityMap: Record<string, number> = {
  '/': 1.0,              // 首页 - 最高优先级
  '/app': 0.9,           // 应用入口 - 高优先级
  '/product': 0.8,       // 核心业务
  '/product-insights': 0.8,
  '/blog': 0.8,          // 内容页面
  '/analytics': 0.8,     // 数据功能
  '/playground': 0.7,
  '/booking': 0.7,
  '/user-list': 0.7,
  '/file-manager': 0.6,
  '/profile': 0.6,
  '/account': 0.6,
  '/invoice': 0.6,
};

/**
 * 更新频率映射表
 */
const changeFrequencyMap: Record<string, MetadataRoute.Sitemap[0]['changeFrequency']> = {
  '/': 'daily',
  '/blog': 'daily',
  '/analytics': 'daily',
  '/user-list': 'daily',
  '/app': 'weekly',
  '/playground': 'weekly',
  '/booking': 'weekly',
  '/product': 'weekly',
  '/product-insights': 'weekly',
  '/file-manager': 'weekly',
  '/invoice': 'weekly',
  '/profile': 'monthly',
  '/account': 'monthly',
};

/**
 * 静态页面路由配置
 * 自动从 routes-metadata.ts 中获取应包含在 sitemap 中的路由
 */
export const staticRoutes: SitemapRoute[] = getSitemapRoutes().map((route) => ({
  path: route.path,
  changeFrequency: changeFrequencyMap[route.path] || 'monthly',
  priority: priorityMap[route.path] || 0.5,
}));

/**
 * 动态路由生成器配置
 * 🔥 所有路由生成器已启用，将生成 1000+ 路由
 */
export const dynamicRouteGenerators: Array<() => Promise<SitemapRoute[]>> = [
  // ✅ 多语言静态路由（静态页面 × 4 语言）
  async () => {
    const { generateMultiLanguageRoutes } = await import('./multi-language-config');
    return generateMultiLanguageRoutes();
  },

  // ✅ 博客文章路由（38 篇文章 × 4 语言 = 152 路由）
  async () => {
    const { generateBlogRoutes } = await import('./multi-language-config');
    return generateBlogRoutes();
  },

  // ✅ 产品/功能路由（25 个产品 × 4 语言 = 100 路由）
  async () => {
    const { generateProductRoutes } = await import('./multi-language-config');
    return generateProductRoutes();
  },

  // ✅ 分类页面路由（15 个分类 × 4 语言 = 60 路由）
  async () => {
    const { generateCategoryRoutes } = await import('./multi-language-config');
    return generateCategoryRoutes();
  },

  // ✅ 标签页面路由（42 个标签 × 4 语言 = 168 路由）
  async () => {
    const { generateTagRoutes } = await import('./multi-language-config');
    return generateTagRoutes();
  },

  // ✅ 用户资料页面（20 个用户 = 20 路由）
  async () => {
    const { generateUserProfileRoutes } = await import('./multi-language-config');
    return generateUserProfileRoutes();
  },

  // ✅ 文档页面路由（30 个文档页面 × 4 语言 = 120 路由）
  async () => {
    const { generateDocumentationRoutes } = await import('./multi-language-config');
    return generateDocumentationRoutes();
  },

  // ✅ 帮助支持页面（20 个页面 × 4 语言 = 80 路由）
  async () => {
    const { generateHelpRoutes } = await import('./multi-language-config');
    return generateHelpRoutes();
  },

  // ✅ 发现和探索页面（25 个页面 × 4 语言 = 100 路由）
  async () => {
    const { generateDiscoveryRoutes } = await import('./multi-language-config');
    return generateDiscoveryRoutes();
  },
];