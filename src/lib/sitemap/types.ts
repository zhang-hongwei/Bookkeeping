import { MetadataRoute } from 'next';

/**
 * Sitemap 类型定义
 */

// Sitemap 路由配置
export interface SitemapRoute {
  path: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}

// Sitemap 类型枚举
export enum SitemapType {
  Pages = 'pages',
  Blog = 'blog',
  Products = 'products',
  // 根据实际需求添加更多类型
}

// Sitemap 生成器配置
export interface SitemapConfig {
  baseUrl: string;
  locales?: string[];
  defaultLocale?: string;
  itemsPerPage?: number;
  revalidate?: number;
}

// Sitemap 条目
export type SitemapEntry = MetadataRoute.Sitemap[0];