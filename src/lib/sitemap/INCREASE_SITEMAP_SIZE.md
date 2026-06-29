# 如何增加 Sitemap 的内容数量

如果你发现 sitemap 内容太少（像 LobeChat 那样有很多路由），可以通过以下方式增加：

## 当前状态

默认配置下，sitemap 只包含 **13 个静态路由**：

```
/
/app
/playground
/booking
/product
/product-insights
/blog
/profile
/user-list
/file-manager
/account
/analytics
/invoice
```

## 如何增加到 100+ 个路由

### 方式 1: 启用多语言支持（最快）

如果启用 4 种语言（中文简体、英文、繁体中文、日文），路由数量会翻 4 倍。

#### 步骤：

1. 编辑 `src/lib/sitemap/config.ts`
2. 取消注释多语言生成器：

```typescript
export const dynamicRouteGenerators: Array<() => Promise<SitemapRoute[]>> = [
  // ... 其他生成器

  // 🔥 取消这个注释
  async () => {
    const { generateMultiLanguageRoutes } = await import('./multi-language-config');
    return generateMultiLanguageRoutes();
  },
];
```

**结果：13 × 4 = 52 个路由** ✅

支持的语言在 `multi-language-config.ts` 中配置：
- `zh-CN` (简体中文) - 默认
- `en-US` (English)
- `zh-TW` (繁體中文)
- `ja-JP` (日本語)

生成的路由示例：
```
/                    (中文首页)
/en-US/              (英文首页)
/zh-TW/              (繁体首页)
/ja-JP/              (日文首页)
/app                 (中文应用)
/en-US/app           (英文应用)
/zh-TW/app           (繁体应用)
/ja-JP/app           (日文应用)
...
```

---

### 方式 2: 添加动态博客文章路由

如果你有博客功能，为每篇文章生成路由。

#### 步骤：

1. 编辑 `multi-language-config.ts`
2. 替换 `EXAMPLE_BLOG_POSTS` 为真实数据：

```typescript
// multi-language-config.ts

export async function generateBlogRoutes(): Promise<SitemapRoute[]> {
  // 🔥 替换为真实的数据库查询
  const posts = await db.query('SELECT slug, updated_at FROM posts');

  // 或者从 API 获取
  // const posts = await fetch('/api/posts').then(r => r.json());

  const routes: SitemapRoute[] = [];

  for (const post of posts) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = locale.default
        ? `/blog/${post.slug}`
        : `/${locale.code}/blog/${post.slug}`;

      routes.push({
        path,
        changeFrequency: 'monthly',
        priority: 0.6,
        lastModified: post.updated_at,
      });
    }
  }

  return routes;
}
```

3. 在 `config.ts` 中启用：

```typescript
export const dynamicRouteGenerators: Array<() => Promise<SitemapRoute[]>> = [
  // ... 其他生成器

  // 🔥 取消这个注释
  async () => {
    const { generateBlogRoutes } = await import('./multi-language-config');
    return generateBlogRoutes();
  },
];
```

**假设有 20 篇博客：**
- 不启用多语言：20 个路由
- 启用 4 种语言：20 × 4 = 80 个路由 ✅

---

### 方式 3: 添加产品详情页路由

如果你有产品列表，为每个产品生成路由。

#### 步骤：

同理，编辑 `generateProductRoutes()` 函数并启用它。

**假设有 50 个产品：**
- 不启用多语言：50 个路由
- 启用 4 种语言：50 × 4 = 200 个路由 ✅✅

---

### 方式 4: 添加分类和标签页面

为每个分类和标签创建独立页面。

#### 步骤：

1. 编辑 `multi-language-config.ts`，添加你的分类和标签：

```typescript
export async function generateCategoryRoutes(): Promise<SitemapRoute[]> {
  // 🔥 替换为真实分类
  const categories = await db.query('SELECT slug FROM categories');
  // 或手动配置
  // const categories = ['ai', 'development', 'design', 'business', 'marketing'];

  const routes: SitemapRoute[] = [];

  for (const category of categories) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = locale.default
        ? `/blog/category/${category.slug}`
        : `/${locale.code}/blog/category/${category.slug}`;

      routes.push({
        path,
        changeFrequency: 'weekly',
        priority: 0.5,
        lastModified: new Date().toISOString(),
      });
    }
  }

  return routes;
}
```

2. 在 `config.ts` 中启用：

```typescript
// 分类页面路由
async () => {
  const { generateCategoryRoutes } = await import('./multi-language-config');
  return generateCategoryRoutes();
},

// 标签页面路由
async () => {
  const { generateTagRoutes } = await import('./multi-language-config');
  return generateTagRoutes();
},
```

**假设有 10 个分类 + 20 个标签：**
- 不启用多语言：30 个路由
- 启用 4 种语言：30 × 4 = 120 个路由 ✅

---

### 方式 5: 添加用户公开资料页

如果你的应用有用户公开资料功能。

```typescript
export async function generateUserProfileRoutes(): Promise<SitemapRoute[]> {
  const users = await db.query('SELECT username FROM users WHERE is_public = true');

  return users.map(user => ({
    path: `/user/${user.username}`,
    changeFrequency: 'monthly',
    priority: 0.3,
    lastModified: new Date().toISOString(),
  }));
}
```

---

## 完整示例计算

假设你启用了所有功能：

| 类型 | 数量 | 语言 | 总计 |
|------|------|------|------|
| 静态页面 | 13 | × 4 | 52 |
| 博客文章 | 20 | × 4 | 80 |
| 产品页面 | 50 | × 4 | 200 |
| 分类页面 | 10 | × 4 | 40 |
| 标签页面 | 20 | × 4 | 80 |
| 用户资料 | 100 | × 1 | 100 |
| **总计** | | | **552 个路由** ✅✅✅

---

## 启用所有功能的完整配置

编辑 `src/lib/sitemap/config.ts`：

```typescript
export const dynamicRouteGenerators: Array<() => Promise<SitemapRoute[]>> = [
  // 多语言静态路由
  async () => {
    const { generateMultiLanguageRoutes } = await import('./multi-language-config');
    return generateMultiLanguageRoutes();
  },

  // 博客文章
  async () => {
    const { generateBlogRoutes } = await import('./multi-language-config');
    return generateBlogRoutes();
  },

  // 产品页面
  async () => {
    const { generateProductRoutes } = await import('./multi-language-config');
    return generateProductRoutes();
  },

  // 分类页面
  async () => {
    const { generateCategoryRoutes } = await import('./multi-language-config');
    return generateCategoryRoutes();
  },

  // 标签页面
  async () => {
    const { generateTagRoutes } = await import('./multi-language-config');
    return generateTagRoutes();
  },

  // 用户资料
  async () => {
    const { generateUserProfileRoutes } = await import('./multi-language-config');
    return generateUserProfileRoutes();
  },
];
```

---

## 性能优化建议

### 1. 使用缓存

sitemap 生成器已经内置了 5 分钟缓存：

```typescript
// generator.ts (已实现)
private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
```

### 2. 分批生成

如果路由数量超过 5000，考虑使用 sitemap 索引：

```typescript
// src/app/sitemap.xml/route.ts
export async function GET() {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-blog.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-products.xml</loc>
  </sitemap>
</sitemapindex>`, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
```

### 3. 增量更新

只在内容变化时重新生成 sitemap，而不是每次请求都生成：

```typescript
// 使用 revalidate
export const revalidate = 3600; // 每小时重新验证
```

---

## 验证

启用后，访问 `/sitemap.xml` 应该能看到大量路由。

你也可以使用以下工具验证：
- Google Search Console
- Bing Webmaster Tools
- 在线 Sitemap 验证器

---

## 常见问题

### Q: 为什么 LobeChat 有那么多路由？

A: LobeChat 使用了：
1. **多语言** - 支持 10+ 种语言
2. **动态内容** - 插件市场、AI agents、发现页面等
3. **分类和标签** - 每个分类和标签都有独立页面
4. **用户内容** - 公开的用户分享内容

### Q: 我需要这么多路由吗？

A: 取决于你的需求：
- **SEO 优化** - 更多独立页面有助于 SEO
- **用户体验** - 每个内容都有独立 URL
- **社交分享** - 独立页面便于分享

如果你的应用内容较少，不需要强制增加路由数量。

### Q: 启用多语言会影响性能吗？

A: 不会，因为：
1. Sitemap 生成有缓存机制
2. 只在构建时或首次访问时生成
3. Next.js 会自动优化

---

## 总结

通过以上方式，你可以将 sitemap 从 13 个路由增加到 500+ 个路由，与 LobeChat 类似！

**推荐顺序：**
1. 首先启用多语言（如果需要）
2. 然后添加动态博客/产品路由
3. 最后添加分类、标签等辅助页面
