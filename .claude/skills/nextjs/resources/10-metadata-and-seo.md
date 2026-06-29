# 元信息与 SEO 优化

## Metadata API 概览

Next.js 16 提供了完整的 Metadata API，无需第三方库（如 `next-seo`）即可实现专业的 SEO 优化。

| 元数据类型 | 定义方式 | 使用场景 |
|-----------|---------|---------|
| **静态元数据** | `export const metadata = {}` | 固定内容，不依赖运行时数据 |
| **动态元数据** | `export async function generateMetadata()` | 依赖 URL 参数或外部数据 |
| **文件元数据** | 特殊文件（icon.png, robots.txt） | 图标、sitemap、robots 等 |

---

## 1. 静态元数据

### 基础元数据对象

```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Website',
  description: 'Welcome to my awesome website',
  keywords: ['Next.js', 'React', 'TypeScript'],
  authors: [{ name: 'John Doe', url: 'https://johndoe.com' }],
  creator: 'John Doe',

  // 视口配置
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },

  // 图标
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};
```

### Title 模板

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'My Website',
    template: '%s | My Website',  // 子页面会使用此模板
  },
  description: 'My website description',
};

// app/blog/page.tsx
export const metadata: Metadata = {
  title: 'Blog',  // 最终显示: "Blog | My Website"
};

// app/about/page.tsx
export const metadata: Metadata = {
  title: {
    absolute: 'About Us',  // 忽略模板，最终显示: "About Us"
  },
};
```

---

## 2. 动态元数据

### generateMetadata 函数

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ✅ Next.js 会等待此函数完成后再流式传输 UI
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 获取文章数据
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],

    // OpenGraph
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      creator: '@johndoe',
    },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return <Article post={post} />;
}
```

### 自动请求去重

```typescript
// ✅ getPostBySlug 在同一请求中只会调用一次
// Next.js 自动缓存 generateMetadata 中的 fetch 请求

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);  // 第 1 次调用

  return {
    title: post.title,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);  // ✅ 从缓存读取，不会重复请求

  return <Article post={post} />;
}
```

---

## 3. OpenGraph 与 Twitter Cards

### OpenGraph 完整配置

```typescript
// app/product/[id]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  return {
    openGraph: {
      type: 'website',  // 'website' | 'article' | 'book' | 'profile'
      url: `https://example.com/product/${id}`,
      title: product.name,
      description: product.description,
      siteName: 'My Store',
      locale: 'zh_CN',
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
          type: 'image/jpeg',
        },
      ],
      // 视频类型（可选）
      videos: [
        {
          url: product.videoUrl,
          width: 1280,
          height: 720,
          type: 'video/mp4',
        },
      ],
    },
  };
}
```

### Twitter Cards 类型

```typescript
export const metadata: Metadata = {
  twitter: {
    card: 'summary_large_image',  // 'summary' | 'summary_large_image' | 'app' | 'player'
    site: '@mysite',
    creator: '@johndoe',
    title: 'Page Title',
    description: 'Page description',
    images: ['https://example.com/og-image.jpg'],
  },
};
```

### 社交媒体卡片最佳实践

```typescript
// ✅ 好 - 为不同平台提供优化的图片尺寸
export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: '/og-image-1200x630.jpg',  // Facebook/LinkedIn
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/twitter-image-1200x675.jpg'],  // Twitter 推荐 2:1
  },
};
```

**推荐尺寸**:
- **Facebook/LinkedIn**: 1200×630 (1.91:1)
- **Twitter Large Card**: 1200×675 (16:9) 或 1200×600 (2:1)
- **Twitter Summary**: 120×120 (1:1)

---

## 4. 文件元数据

### 特殊文件约定

Next.js 支持约定式文件生成元数据：

```
app/
├── icon.png              → <link rel="icon">
├── apple-icon.png        → <link rel="apple-touch-icon">
├── opengraph-image.jpg   → OpenGraph image
├── twitter-image.jpg     → Twitter Card image
├── favicon.ico           → Favicon
├── robots.txt            → Robots file
├── sitemap.xml           → Sitemap
└── manifest.json         → Web App Manifest
```

### 动态 OpenGraph 图片

```typescript
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Blog Post';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #1e3a8a, #3b82f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 'bold' }}>
            {post.title}
          </div>
          <div style={{ fontSize: 40, opacity: 0.8, marginTop: 20 }}>
            {post.author.name}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 2,
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

生成的 `robots.txt`:
```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

User-Agent: Googlebot
Allow: /
Crawl-delay: 2

Sitemap: https://example.com/sitemap.xml
```

### sitemap.xml

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 获取所有文章
  const posts = await getAllPosts();

  const postUrls = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://example.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...postUrls,
  ];
}
```

生成的 `sitemap.xml`:
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>yearly</changefreq>
    <priority>1</priority>
  </url>
  <!-- 更多 URLs... -->
</urlset>
```

---

## 5. 结构化数据（JSON-LD）

### 添加结构化数据

```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // JSON-LD 结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.url,
    },
  };

  return (
    <>
      {/* 添加 JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Article post={post} />
    </>
  );
}
```

### 常见结构化数据类型

```typescript
// 产品页面
const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.image,
  description: product.description,
  sku: product.sku,
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
};

// 面包屑导航
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://example.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://example.com/blog',
    },
  ],
};
```

---

## 6. Canonical URLs

### 防止重复内容

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const canonicalUrl = `https://example.com/blog/${slug}`;

  return {
    title: 'Blog Post',
    // ✅ 设置规范 URL
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
```

### 多语言站点的 Canonical

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://example.com/en/blog/post',
    languages: {
      'en-US': 'https://example.com/en/blog/post',
      'zh-CN': 'https://example.com/zh-cn/blog/post',
      'ja-JP': 'https://example.com/ja/blog/post',
    },
  },
};
```

---

## 7. 验证标签

### Google Search Console

```typescript
export const metadata: Metadata = {
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
};
```

生成的 HTML:
```html
<meta name="google-site-verification" content="google-site-verification-code" />
<meta name="yandex-verification" content="yandex-verification-code" />
<meta name="y_key" content="yahoo-verification-code" />
```

---

## 8. SEO 最佳实践

### ✅ 必做项

**1. 每个页面都有唯一的 title 和 description**

```typescript
// ❌ 错误 - 所有页面使用相同的 title
export const metadata: Metadata = {
  title: 'My Website',
};

// ✅ 正确 - 每个页面都有描述性的 title
export const metadata: Metadata = {
  title: 'Blog - Latest Articles on Web Development',
  description: 'Read our latest articles on React, Next.js, and TypeScript',
};
```

**2. Title 长度控制在 50-60 字符**

```typescript
// ❌ 太长 - 会被截断
title: 'This is a very long title that will definitely be truncated in search results and not look good'

// ✅ 合适长度
title: 'Next.js SEO Guide - Best Practices for 2025'
```

**3. Description 长度控制在 150-160 字符**

```typescript
// ✅ 好的 description
description: 'Learn how to optimize your Next.js app for search engines with our comprehensive guide. Covers metadata, OpenGraph, structured data, and more.'
```

**4. 使用语义化 HTML**

```typescript
// ✅ 使用语义化标签
<article>
  <header>
    <h1>Article Title</h1>
    <time dateTime={post.publishedAt}>January 15, 2025</time>
  </header>
  <section>
    <p>Content...</p>
  </section>
  <footer>
    <address>Author: John Doe</address>
  </footer>
</article>
```

**5. 优化图片 alt 文本**

```typescript
import Image from 'next/image';

// ❌ 不好
<Image src="/product.jpg" alt="image" />

// ✅ 好
<Image src="/product.jpg" alt="Wireless Bluetooth Headphones - Noise Cancelling" />
```

**6. 设置正确的 OpenGraph 图片**

```typescript
// ✅ 测试工具
// Facebook: https://developers.facebook.com/tools/debug/
// Twitter: https://cards-dev.twitter.com/validator
// LinkedIn: https://www.linkedin.com/post-inspector/

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Descriptive alt text',
      },
    ],
  },
};
```

**7. 生成 sitemap.xml 和 robots.txt**

```bash
# 确保这些 URL 可访问
https://example.com/sitemap.xml
https://example.com/robots.txt
```

---

## 9. 性能优化 SEO

### Core Web Vitals

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        {/* 监控 Web Vitals */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

### 关键指标

| 指标 | 目标 | 影响 |
|------|------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 加载性能 |
| **FID** (First Input Delay) | < 100ms | 交互性 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 视觉稳定性 |
| **FCP** (First Contentful Paint) | < 1.8s | 感知加载速度 |
| **TTFB** (Time to First Byte) | < 600ms | 服务器响应 |

---

## 10. 移动优化

### Viewport 配置

```typescript
export const metadata: Metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,  // 允许用户缩放
    userScalable: true,
  },

  // 主题颜色
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};
```

### PWA Manifest

```typescript
// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My Next.js App',
    short_name: 'MyApp',
    description: 'An awesome Next.js Progressive Web App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

---

## 常见陷阱

### ❌ 错误 1：忘记设置动态路由的元数据

```typescript
// ❌ 错误 - 动态页面没有元数据
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <Article post={post} />;
}

// ✅ 正确 - 使用 generateMetadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

### ❌ 错误 2：OpenGraph 图片路径错误

```typescript
// ❌ 错误 - 相对路径
openGraph: {
  images: ['/og-image.jpg'],  // 可能无法解析
}

// ✅ 正确 - 绝对 URL
openGraph: {
  images: ['https://example.com/og-image.jpg'],
}
```

### ❌ 错误 3：Title 模板冲突

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | My Site',
  },
};

// app/page.tsx
export const metadata: Metadata = {
  // ❌ 错误 - 没有 title，会显示 " | My Site"
};

// ✅ 正确
export const metadata: Metadata = {
  title: 'Home',  // 显示 "Home | My Site"
};
```

---

## 快速参考

```typescript
// 静态元数据
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    images: ['https://example.com/og.jpg'],
  },
};

// 动态元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchData(slug);

  return {
    title: data.title,
    description: data.description,
  };
}

// 文件元数据
app/icon.png              // 图标
app/opengraph-image.tsx   // 动态 OG 图片
app/robots.ts             // Robots.txt
app/sitemap.ts            // Sitemap.xml

// JSON-LD 结构化数据
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

---

## 下一步

- [性能优化](./07-performance-optimization.md) - Web Vitals 优化
- [部署与构建](./12-deployment-and-ci.md) - 生产环境 SEO 配置
- [配置与环境](./11-configuration-and-env.md) - 环境变量配置

---

**相关资源**
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org)
- [Open Graph Protocol](https://ogp.me)
