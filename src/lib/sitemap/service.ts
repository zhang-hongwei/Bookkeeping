import { MetadataRoute } from 'next';
import { EnhancedSitemapGenerator } from './enhanced-generator';
import { SitemapRoute, SitemapType } from './types';
import { SITE_URL } from './config';

/**
 * Sitemap 服务类
 * 负责管理和协调不同类型的 sitemap 生成
 */
export class SitemapService {
  private generator: EnhancedSitemapGenerator;

  constructor() {
    this.generator = new EnhancedSitemapGenerator({
      baseUrl: SITE_URL,
      locales: ['en', 'zh-CN'], // 根据实际需求配置
      defaultLocale: 'en',
      itemsPerPage: 100,
      revalidate: 86400, // 24小时
    });
  }

  /**
   * 生成 sitemap IDs（用于 generateSitemaps）
   */
  async generateSitemapIds(): Promise<Array<{ id: string }>> {
    const ids: Array<{ id: string }> = [
      { id: SitemapType.Pages },
    ];

    // 获取动态内容的页数
    const blogPageCount = await this.getBlogPageCount();
    const productPageCount = await this.getProductPageCount();

    // 生成分页 IDs
    for (let i = 1; i <= blogPageCount; i++) {
      ids.push({ id: `${SitemapType.Blog}-${i}` });
    }

    for (let i = 1; i <= productPageCount; i++) {
      ids.push({ id: `${SitemapType.Products}-${i}` });
    }

    return ids;
  }

  /**
   * 根据 ID 生成对应的 sitemap
   */
  async generateSitemapById(id: string): Promise<MetadataRoute.Sitemap> {
    // 解析 ID
    const [type, pageStr] = id.split('-');
    const page = pageStr ? parseInt(pageStr, 10) : undefined;

    switch (type as SitemapType) {
      case SitemapType.Pages:
        return this.generatePagesSitemap();

      case SitemapType.Blog:
        return this.generateBlogSitemap(page);

      case SitemapType.Products:
        return this.generateProductsSitemap(page);

      default:
        return [];
    }
  }

  /**
   * 生成静态页面 sitemap
   */
  private async generatePagesSitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: SitemapRoute[] = [
      {
        path: '/',
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        path: '/about',
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        path: '/contact',
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      // 添加更多静态页面
    ];

    return this.generator.generateBatch(staticRoutes);
  }

  /**
   * 生成博客 sitemap（分页）
   */
  private async generateBlogSitemap(page?: number): Promise<MetadataRoute.Sitemap> {
    // 模拟从数据库获取博客文章
    const blogPosts = await this.fetchBlogPosts();

    const routes: SitemapRoute[] = blogPosts.map(post => ({
      path: `/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    if (page) {
      return this.generator.generatePaginated(routes, page);
    }

    return this.generator.generateBatch(routes);
  }

  /**
   * 生成产品 sitemap（分页）
   */
  private async generateProductsSitemap(page?: number): Promise<MetadataRoute.Sitemap> {
    // 模拟从数据库获取产品
    const products = await this.fetchProducts();

    const routes: SitemapRoute[] = products.map(product => ({
      path: `/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    if (page) {
      return this.generator.generatePaginated(routes, page);
    }

    return this.generator.generateBatch(routes);
  }

  /**
   * 获取博客总页数
   */
  private async getBlogPageCount(): Promise<number> {
    const posts = await this.fetchBlogPosts();
    return this.generator.getPageCount(posts.length);
  }

  /**
   * 获取产品总页数
   */
  private async getProductPageCount(): Promise<number> {
    const products = await this.fetchProducts();
    return this.generator.getPageCount(products.length);
  }

  /**
   * 模拟获取博客文章
   */
  private async fetchBlogPosts(): Promise<Array<{ slug: string; updatedAt: Date }>> {
    // TODO: 实际实现应从数据库获取
    return [
      { slug: 'post-1', updatedAt: new Date('2024-01-01') },
      { slug: 'post-2', updatedAt: new Date('2024-01-02') },
      // ...
    ];
  }

  /**
   * 模拟获取产品
   */
  private async fetchProducts(): Promise<Array<{ id: string; updatedAt: Date }>> {
    // TODO: 实际实现应从数据库获取
    return [
      { id: 'product-1', updatedAt: new Date('2024-01-01') },
      { id: 'product-2', updatedAt: new Date('2024-01-02') },
      // ...
    ];
  }

  /**
   * 生成 sitemap index
   */
  async generateSitemapIndex(): Promise<string> {
    const ids = await this.generateSitemapIds();
    const baseUrl = SITE_URL;

    const sitemapUrls = ids.map(({ id }) =>
      `${baseUrl}/sitemap/${id}.xml`
    );

    return this.generator.generateSitemapIndex(sitemapUrls);
  }

  /**
   * 获取缓存配置
   */
  getCacheConfig() {
    return this.generator.getCacheConfig();
  }
}