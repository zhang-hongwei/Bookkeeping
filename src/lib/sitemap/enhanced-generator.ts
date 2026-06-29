import { MetadataRoute } from 'next';
import { SitemapConfig, SitemapEntry, SitemapRoute, SitemapType } from './types';

/**
 * 增强版 Sitemap 生成器
 * 支持多语言、分页、sitemap index
 */
export class EnhancedSitemapGenerator {
  private config: Required<SitemapConfig>;
  private static readonly DEFAULT_ITEMS_PER_PAGE = 100;
  private static readonly DEFAULT_REVALIDATE = 86400; // 24小时

  constructor(config: SitemapConfig) {
    this.config = {
      baseUrl: this.normalizeUrl(config.baseUrl),
      locales: config.locales || [],
      defaultLocale: config.defaultLocale || 'en',
      itemsPerPage: config.itemsPerPage || EnhancedSitemapGenerator.DEFAULT_ITEMS_PER_PAGE,
      revalidate: config.revalidate || EnhancedSitemapGenerator.DEFAULT_REVALIDATE,
    };
  }

  /**
   * 规范化 URL
   */
  private normalizeUrl(url: string): string {
    return url.replace(/\/$/, '');
  }

  /**
   * 规范化路径
   */
  private normalizePath(path: string): string {
    const trimmed = path.trim();
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  /**
   * 生成多语言备选链接
   */
  private generateAlternates(path: string): Record<string, string> | undefined {
    if (!this.config.locales.length) return undefined;

    const alternates: Record<string, string> = {};
    for (const locale of this.config.locales) {
      if (locale === this.config.defaultLocale) {
        alternates[locale] = `${this.config.baseUrl}${path}`;
      } else {
        alternates[locale] = `${this.config.baseUrl}/${locale}${path}`;
      }
    }
    return alternates;
  }

  /**
   * 创建单个 sitemap 条目
   */
  private createEntry(route: SitemapRoute, includeAlternates = true): SitemapEntry {
    const path = this.normalizePath(route.path);
    const url = `${this.config.baseUrl}${path}`;

    const entry: SitemapEntry = {
      url,
      lastModified: route.lastModified ? new Date(route.lastModified) : new Date(),
      changeFrequency: route.changeFrequency || 'monthly',
      priority: route.priority ?? 0.5,
    };

    // 添加多语言支持
    if (includeAlternates && this.config.locales.length > 0) {
      const languages = route.alternates?.languages || this.generateAlternates(path);
      if (languages) {
        entry.alternates = { languages };
      }
    }

    return entry;
  }

  /**
   * 分页处理
   */
  private paginate<T>(items: T[], page: number): T[] {
    const start = (page - 1) * this.config.itemsPerPage;
    const end = start + this.config.itemsPerPage;
    return items.slice(start, end);
  }

  /**
   * 获取总页数
   */
  getPageCount(totalItems: number): number {
    return Math.ceil(totalItems / this.config.itemsPerPage);
  }

  /**
   * 生成分页的 sitemap
   */
  async generatePaginated(
    routes: SitemapRoute[],
    page: number
  ): Promise<MetadataRoute.Sitemap> {
    const paginatedRoutes = this.paginate(routes, page);
    return paginatedRoutes.map(route => this.createEntry(route));
  }

  /**
   * 生成 sitemap index
   */
  generateSitemapIndex(sitemapUrls: string[]): string {
    const lastModified = new Date().toISOString();
    const sitemaps = sitemapUrls.map(url =>
      `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${lastModified}</lastmod>
  </sitemap>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
  }

  /**
   * 批量生成 sitemap 条目
   */
  generateBatch(routes: SitemapRoute[]): MetadataRoute.Sitemap {
    return routes.map(route => this.createEntry(route));
  }

  /**
   * 生成带缓存的 sitemap
   */
  private cache: Map<string, { data: MetadataRoute.Sitemap; expiry: number }> = new Map();

  async generateWithCache(
    key: string,
    generator: () => Promise<SitemapRoute[]>
  ): Promise<MetadataRoute.Sitemap> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now < cached.expiry) {
      return cached.data;
    }

    try {
      const routes = await generator();
      const sitemap = this.generateBatch(routes);

      this.cache.set(key, {
        data: sitemap,
        expiry: now + this.config.revalidate * 1000,
      });

      return sitemap;
    } catch (error) {
      console.error(`Error generating sitemap for ${key}:`, error);
      return cached?.data || [];
    }
  }

  /**
   * 获取缓存配置
   */
  getCacheConfig() {
    return {
      revalidate: this.config.revalidate,
      dynamic: 'force-static' as const,
    };
  }
}