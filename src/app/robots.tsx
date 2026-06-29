import { MetadataRoute } from 'next';
import { SitemapGenerator } from '@/lib/sitemap';
import { SITE_URL } from '@/lib/sitemap/config';

/**
 * 生成 robots.txt 文件
 * 告诉搜索引擎爬虫哪些页面可以访问，哪些不能访问
 */
export default function robots(): MetadataRoute.Robots {
  const generator = new SitemapGenerator();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
        ],
      },
    ],
    sitemap: [
      generator.getSitemapUrl(), // 保留原有的单一 sitemap
      `${SITE_URL}/sitemap-index.xml`, // 新增 sitemap index
    ],
  };
}