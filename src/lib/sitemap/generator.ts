import { MetadataRoute } from "next";
import { z } from "zod";
import {
  SITE_URL,
  SitemapRoute,
  staticRoutes,
  dynamicRouteGenerators,
} from "./config";

// 基础 URL 规范化（移除尾斜杠）
const normalizeBaseUrl = (url: string) => url.replace(/\/$/, "");

// 路径规范化：确保以 / 开头，去掉多余空白
const normalizePath = (path: string) => {
  const p = path.trim();
  if (!p.startsWith("/")) return `/${p}`;
  return p;
};

// 使用 Zod 校验路由项，约束 changeFrequency 与 priority 范围
const routeSchema = z.object({
  path: z.string().min(1),
  changeFrequency: z
    .enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"])
    .optional(),
  priority: z.number().min(0).max(1).optional(),
  lastModified: z.union([z.string(), z.date()]).optional(),
});

type ValidRoute = z.infer<typeof routeSchema>;

/**
 * Sitemap 生成器类
 * 负责生成网站的 sitemap.xml
 */
export class SitemapGenerator {
  private baseUrl: string;
  private dynamicEntriesCache?: MetadataRoute.Sitemap;
  private cacheExpiry?: number;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  constructor(baseUrl: string = SITE_URL) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  /**
   * 生成单个 sitemap 条目
   */
  private createSitemapEntry(route: SitemapRoute): MetadataRoute.Sitemap[0] {
    // 规范化 + 校验
    const parsed = routeSchema.safeParse(route);
    if (!parsed.success) {
      // 跳过非法项
      return {
        url: `${this.baseUrl}/`,
      } as MetadataRoute.Sitemap[0];
    }

    const r: ValidRoute = parsed.data;
    const path = normalizePath(r.path);

    // 构造绝对 URL，避免重复斜杠
    const url = `${this.baseUrl}${path}`;

    // lastModified 统一为 ISO，且仅在提供时设置
    const lastModified = r.lastModified
      ? new Date(r.lastModified as any)
      : undefined;

    return {
      url,
      lastModified,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    };
  }

  /**
   * 获取所有静态路由的 sitemap 条目
   */
  private getStaticEntries(): MetadataRoute.Sitemap {
    return staticRoutes.map((route) => this.createSitemapEntry(route));
  }

  /**
   * 获取所有动态路由的 sitemap 条目
   * 带缓存机制，避免频繁调用外部 API
   */
  private async getDynamicEntries(): Promise<MetadataRoute.Sitemap> {
    // 检查缓存
    const now = Date.now();
    if (
      this.dynamicEntriesCache &&
      this.cacheExpiry &&
      now < this.cacheExpiry
    ) {
      return this.dynamicEntriesCache;
    }

    if (dynamicRouteGenerators.length === 0) {
      return [];
    }

    try {
      // 控制并发并隔离错误
      const results: SitemapRoute[][] = [];
      for (const [idx, generator] of dynamicRouteGenerators.entries()) {
        try {
          // 可按需添加超时控制
          const routes = await generator();
          results.push(routes);
        } catch (e) {
          console.error(`[sitemap] dynamic generator #${idx} failed:`, e);
          results.push([]);
        }
      }
      const dynamicRoutes = results.flat();
      const entries = dynamicRoutes.map((route) =>
        this.createSitemapEntry(route)
      );

      // 缓存结果
      this.dynamicEntriesCache = entries;
      this.cacheExpiry = now + SitemapGenerator.CACHE_DURATION;

      return entries;
    } catch (error) {
      console.error("Error generating dynamic sitemap entries:", error);
      // 如果有缓存，返回缓存数据；否则返回空数组
      return this.dynamicEntriesCache || [];
    }
  }

  /**
   * 生成完整的 sitemap
   */
  async generate(): Promise<MetadataRoute.Sitemap> {
    const staticEntries = this.getStaticEntries();
    const dynamicEntries = await this.getDynamicEntries();

    // 合并、去重（按 url），并做稳定排序（url 升序）
    const map = new Map<string, MetadataRoute.Sitemap[0]>();
    for (const item of [...staticEntries, ...dynamicEntries]) {
      if (!item?.url) continue;
      map.set(item.url, item);
    }
    const merged = Array.from(map.values()).sort((a, b) =>
      a.url.localeCompare(b.url)
    );

    return merged;
  }

  /**
   * 获取 sitemap URL（用于 robots.txt）
   */
  getSitemapUrl(): string {
    return `${this.baseUrl}/sitemap.xml`;
  }
}
