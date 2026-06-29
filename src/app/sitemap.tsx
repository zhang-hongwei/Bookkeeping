import { MetadataRoute } from 'next';
import { SitemapGenerator } from '@/lib/sitemap';

/**
 * 生成网站的 sitemap.xml
 * Next.js 会自动将这个函数的返回值转换为 XML 格式
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generator = new SitemapGenerator();
  return await generator.generate();
}