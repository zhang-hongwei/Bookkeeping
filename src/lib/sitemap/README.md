# Sitemap 模块使用指南

这个模块提供了完整的 sitemap 生成、路由元数据管理和网站全局信息配置功能。

## 文件结构

```
src/lib/sitemap/
├── index.ts                  # 模块导出
├── generator.ts              # Sitemap 生成器
├── config.ts                 # Sitemap 配置（自动从元数据生成）
├── routes-metadata.ts        # 路由元数据配置（重要！）
├── site-metadata.ts          # 网站全局元数据配置（重要！）
├── enhanced-generator.ts     # 增强的 Sitemap 生成器
├── service.ts               # Sitemap 服务
├── types.ts                 # 类型定义
└── README.md                # 使用文档
```

## 核心概念

### 1. 网站全局元数据 (site-metadata.ts)

网站的主要信息和全局配置，包括：
- 网站基本信息（名称、描述、标语）
- 联系方式和社交媒体链接
- SEO 配置
- 技术栈信息
- 功能特性列表
- 目标用户群

这是网站的"身份证"，定义了整个网站的核心信息。

### 2. 路由元数据 (routes-metadata.ts)

每个页面/路由的具体信息，包含了所有路由的描述性信息：

```typescript
interface RouteMetadata {
  path: string;                    // 路由路径
  title: string;                   // 页面标题
  description: string;             // 页面描述
  keywords?: string[];             // SEO 关键词
  category: 'main' | 'auth' | 'admin' | 'public';
  requiresAuth: boolean;           // 是否需要认证
  includeInSitemap: boolean;       // 是否在 sitemap 中显示
  icon?: string;                   // 页面图标
  priorityNote?: string;           // 优先级说明
  updateFrequencyNote?: string;    // 更新频率说明
}
```

### 3. Sitemap 配置 (config.ts)

自动从 `routes-metadata.ts` 生成 sitemap 配置，包括：
- 优先级映射
- 更新频率映射
- 静态路由列表

**不需要手动编辑这个文件！**只需要在 `routes-metadata.ts` 中维护路由信息即可。

## 使用方法

### 使用网站全局元数据

#### 1. 在根布局中设置全局元数据

```typescript
// src/app/layout.tsx
import { generatePageMetadata, getStructuredData } from '@/lib/sitemap';

export const metadata = generatePageMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = getStructuredData();

  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### 2. 获取网站信息

```typescript
import { getSiteMetadata } from '@/lib/sitemap';

const siteInfo = getSiteMetadata();

console.log(siteInfo.name);         // "AI Template"
console.log(siteInfo.description);  // "一个现代化的 Next.js 16 AI 模板..."
console.log(siteInfo.contact.email); // "contact@example.com"
console.log(siteInfo.features);     // ["🚀 基于 Next.js 16...", ...]
```

#### 3. 在页面中使用

```typescript
// src/app/about/page.tsx
import { getSiteMetadata } from '@/lib/sitemap';

export default function AboutPage() {
  const site = getSiteMetadata();

  return (
    <div>
      <h1>关于 {site.name}</h1>
      <p>{site.longDescription}</p>

      <h2>主要特性</h2>
      <ul>
        {site.features.map((feature, i) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>

      <h2>技术栈</h2>
      <p>框架: {site.techStack.framework} {site.techStack.version}</p>
      <ul>
        {site.techStack.libraries.map((lib, i) => (
          <li key={i}>{lib}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### 4. 在组件中使用（如页脚）

```typescript
// src/components/Footer.tsx
import { getSiteMetadata } from '@/lib/sitemap';

export function Footer() {
  const site = getSiteMetadata();

  return (
    <footer>
      <p>{site.copyright}</p>
      <div>
        <a href={`mailto:${site.contact.email}`}>联系我们</a>
        {site.social.github && (
          <a href={site.social.github}>GitHub</a>
        )}
        {site.social.twitter && (
          <a href={site.social.twitter}>Twitter</a>
        )}
      </div>
    </footer>
  );
}
```

### 使用路由元数据

### 添加新路由

当你在项目中添加新页面时，只需在 `routes-metadata.ts` 中添加对应的元数据：

```typescript
export const routesMetadata: RouteMetadata[] = [
  // ... 其他路由
  {
    path: '/new-feature',
    title: '新功能',
    description: '这是一个新功能页面',
    keywords: ['新功能', 'feature'],
    category: 'main',
    requiresAuth: true,
    includeInSitemap: true,
    priorityNote: '中等优先级 - 新增功能',
    updateFrequencyNote: '每周更新',
  },
];
```

然后在 `config.ts` 中的映射表中添加对应的优先级和更新频率：

```typescript
const priorityMap: Record<string, number> = {
  // ... 其他路由
  '/new-feature': 0.7,
};

const changeFrequencyMap: Record<string, MetadataRoute.Sitemap[0]['changeFrequency']> = {
  // ... 其他路由
  '/new-feature': 'weekly',
};
```

### 获取路由元数据

```typescript
import {
  getRouteMetadata,
  getSitemapRoutes,
  getRoutesByCategory,
  getAuthenticatedRoutes,
  getPublicRoutes,
} from '@/lib/sitemap';

// 获取单个路由的元数据
const metadata = getRouteMetadata('/app');
console.log(metadata?.title); // "应用中心"
console.log(metadata?.description); // "应用主界面，查看和管理所有功能模块"

// 获取所有应包含在 sitemap 中的路由
const sitemapRoutes = getSitemapRoutes();

// 获取特定分类的路由
const mainRoutes = getRoutesByCategory('main');
const authRoutes = getRoutesByCategory('auth');

// 获取需要认证的路由
const authenticatedRoutes = getAuthenticatedRoutes();

// 获取公开访问的路由
const publicRoutes = getPublicRoutes();
```

### 在页面中使用元数据

你可以在 Next.js 的 `metadata` 中使用这些元数据：

```typescript
// src/app/some-page/page.tsx
import { getRouteMetadata } from '@/lib/sitemap';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const routeMeta = getRouteMetadata('/some-page');

  return {
    title: routeMeta?.title,
    description: routeMeta?.description,
    keywords: routeMeta?.keywords,
  };
}

export default function SomePage() {
  return <div>Page content</div>;
}
```

### 生成 Sitemap

sitemap 会自动生成，你不需要做任何事情。访问 `/sitemap.xml` 即可看到生成的 sitemap。

```typescript
// src/app/sitemap.tsx (已配置)
import { MetadataRoute } from 'next';
import { SitemapGenerator } from '@/lib/sitemap';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generator = new SitemapGenerator();
  return await generator.generate();
}
```

## 常见场景

### 1. 控制页面是否出现在 sitemap 中

在 `routes-metadata.ts` 中设置 `includeInSitemap`:

```typescript
{
  path: '/admin',
  // ... 其他配置
  includeInSitemap: false, // 不在 sitemap 中显示
}
```

### 2. 添加动态路由（如博客文章）

在 `config.ts` 的 `dynamicRouteGenerators` 中添加生成器：

```typescript
export const dynamicRouteGenerators: Array<() => Promise<SitemapRoute[]>> = [
  async () => {
    // 从数据库或 API 获取博客文章
    const posts = await fetchBlogPosts();
    return posts.map(post => ({
      path: `/blog/${post.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      lastModified: post.updatedAt,
    }));
  },
];
```

### 3. 自定义优先级和更新频率

在 `config.ts` 中的映射表中调整：

```typescript
const priorityMap: Record<string, number> = {
  '/important-page': 0.9,  // 高优先级
  '/less-important': 0.3,  // 低优先级
};

const changeFrequencyMap = {
  '/frequently-updated': 'daily',    // 频繁更新
  '/rarely-updated': 'yearly',       // 很少更新
};
```

## 优先级参考

- `1.0`: 首页
- `0.9`: 主要应用入口
- `0.8`: 核心业务功能、内容页面
- `0.7`: 重要功能页面
- `0.6`: 一般功能页面
- `0.5` 及以下: 次要页面

## 更新频率参考

- `always`: 实时变化的内容
- `hourly`: 每小时更新
- `daily`: 每日更新（如博客、数据分析）
- `weekly`: 每周更新（如产品、功能页面）
- `monthly`: 每月更新（如个人资料、设置）
- `yearly`: 很少更新（如政策页面）
- `never`: 归档内容

## 最佳实践

1. **单一数据源**: 只维护 `routes-metadata.ts`，让其他配置自动生成
2. **语义化描述**: 在元数据中提供清晰的页面描述和关键词
3. **合理分类**: 使用 category 字段对路由进行分类管理
4. **认证标记**: 正确标记 `requiresAuth`，便于权限管理
5. **SEO 优化**: 为公开页面提供完整的 SEO 信息
6. **文档化**: 使用 `priorityNote` 和 `updateFrequencyNote` 记录决策原因

## 注意事项

1. **路由组**: Next.js 的路由组（如 `(main)`, `(auth)`）不会出现在 URL 中
2. **认证页面**: 通常不将登录、注册等认证页面添加到 sitemap
3. **测试页面**: 开发测试页面应设置 `includeInSitemap: false`
4. **动态路由**: 确保动态路由生成器有错误处理机制
5. **缓存**: sitemap 有 5 分钟缓存，避免频繁调用外部 API

## 示例：完整的路由添加流程

假设你要添加一个 `/settings` 页面：

### 步骤 1: 在 routes-metadata.ts 中添加元数据

```typescript
{
  path: '/settings',
  title: '系统设置',
  description: '配置系统的各项设置和参数',
  keywords: ['设置', 'system', 'configuration'],
  category: 'main',
  requiresAuth: true,
  includeInSitemap: true,
  icon: 'settings',
  priorityNote: '中等优先级 - 配置功能',
  updateFrequencyNote: '每月更新 - 设置项不常变化',
}
```

### 步骤 2: 在 config.ts 中添加映射

```typescript
const priorityMap: Record<string, number> = {
  // ...
  '/settings': 0.6,
};

const changeFrequencyMap = {
  // ...
  '/settings': 'monthly',
};
```

### 步骤 3: 使用元数据

```typescript
// src/app/settings/page.tsx
import { getRouteMetadata } from '@/lib/sitemap';

export async function generateMetadata() {
  const meta = getRouteMetadata('/settings');
  return {
    title: meta?.title,
    description: meta?.description,
  };
}
```

完成！现在 `/settings` 会自动出现在 sitemap 中。
