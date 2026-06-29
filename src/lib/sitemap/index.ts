/**
 * Sitemap 模块导出
 */

export { SitemapGenerator } from './generator';
export { EnhancedSitemapGenerator } from './enhanced-generator';
export { SitemapService } from './service';
export { SITE_URL, staticRoutes, dynamicRouteGenerators } from './config';
export type { SitemapRoute } from './config';
export type { SitemapConfig, SitemapEntry, SitemapType } from './types';

// 导出路由元数据模块
export {
  routesMetadata,
  getRouteMetadata,
  getSitemapRoutes,
  getRoutesByCategory,
  getAuthenticatedRoutes,
  getPublicRoutes,
} from './routes-metadata';
export type { RouteMetadata } from './routes-metadata';

// 导出网站全局元数据模块
export {
  siteMetadata,
  getSiteMetadata,
  getStructuredData,
  getOpenGraphMetadata,
  getTwitterMetadata,
  generatePageMetadata,
} from './site-metadata';
export type { SiteMetadata } from './site-metadata';