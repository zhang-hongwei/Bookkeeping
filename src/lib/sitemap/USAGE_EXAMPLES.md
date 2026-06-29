# Sitemap 模块使用示例

完整的使用示例，展示如何使用网站元数据和路由元数据。

## 目录

1. [根布局配置](#1-根布局配置)
2. [页面元数据配置](#2-页面元数据配置)
3. [关于页面](#3-关于页面)
4. [站点地图页面](#4-站点地图页面)
5. [导航菜单](#5-导航菜单)
6. [页脚组件](#6-页脚组件)
7. [SEO 组件](#7-seo-组件)

---

## 1. 根布局配置

```typescript
// src/app/layout.tsx
import { generatePageMetadata, getStructuredData, getSiteMetadata } from '@/lib/sitemap';
import type { Metadata } from 'next';

// 生成全局元数据
export const metadata: Metadata = generatePageMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = getStructuredData();
  const site = getSiteMetadata();

  return (
    <html lang={site.language}>
      <head>
        {/* JSON-LD 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

## 2. 页面元数据配置

```typescript
// src/app/blog/page.tsx
import { generatePageMetadata, getRouteMetadata } from '@/lib/sitemap';
import type { Metadata } from 'next';

// 为特定页面生成元数据
export async function generateMetadata(): Promise<Metadata> {
  const routeMeta = getRouteMetadata('/blog');

  return generatePageMetadata({
    title: routeMeta?.title,
    description: routeMeta?.description,
    keywords: routeMeta?.keywords,
    image: '/images/blog-og.png',
  });
}

export default function BlogPage() {
  return (
    <div>
      <h1>博客</h1>
      {/* 页面内容 */}
    </div>
  );
}
```

---

## 3. 关于页面

完整展示网站信息的关于页面：

```typescript
// src/app/about/page.tsx
import { getSiteMetadata, generatePageMetadata } from '@/lib/sitemap';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title: '关于我们',
  description: '了解我们的团队、技术栈和产品愿景',
});

export default function AboutPage() {
  const site = getSiteMetadata();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 网站介绍 */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">关于 {site.name}</h1>
        <p className="text-xl text-gray-600 mb-4">{site.tagline}</p>
        <p className="text-lg leading-relaxed">{site.longDescription}</p>
      </section>

      {/* 主要特性 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">主要特性</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {site.features.map((feature, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow">
              <p className="text-lg">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 技术栈 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">技术栈</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-lg mb-4">
            <strong>框架:</strong> {site.techStack.framework} {site.techStack.version}
          </p>
          <p className="text-lg mb-4">
            <strong>数据库:</strong> {site.techStack.database}
          </p>
          <p className="text-lg mb-4">
            <strong>托管:</strong> {site.techStack.hosting}
          </p>
          <div>
            <strong className="text-lg">核心技术:</strong>
            <ul className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {site.techStack.libraries.map((lib, index) => (
                <li key={index} className="text-gray-700">
                  • {lib}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 目标用户 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">适合谁使用</h2>
        <div className="flex flex-wrap gap-3">
          {site.targetAudience.map((audience, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full"
            >
              {audience}
            </span>
          ))}
        </div>
      </section>

      {/* 联系方式 */}
      <section>
        <h2 className="text-3xl font-bold mb-6">联系我们</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="mb-2">
            <strong>邮箱:</strong>{' '}
            <a href={`mailto:${site.contact.email}`} className="text-blue-600">
              {site.contact.email}
            </a>
          </p>
          {site.contact.phone && (
            <p className="mb-2">
              <strong>电话:</strong> {site.contact.phone}
            </p>
          )}
          {site.contact.address && (
            <p className="mb-4">
              <strong>地址:</strong> {site.contact.address}
            </p>
          )}

          <div className="flex gap-4 mt-4">
            {site.social.github && (
              <a
                href={site.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                GitHub
              </a>
            )}
            {site.social.twitter && (
              <a
                href={site.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Twitter
              </a>
            )}
            {site.social.linkedin && (
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## 4. 站点地图页面

展示所有可用路由的人类可读站点地图：

```typescript
// src/app/sitemap-page/page.tsx (不是 sitemap.xml)
import { routesMetadata, getRoutesByCategory, getSiteMetadata } from '@/lib/sitemap';

export default function SitemapPage() {
  const site = getSiteMetadata();
  const mainRoutes = getRoutesByCategory('main');
  const authRoutes = getRoutesByCategory('auth');
  const publicRoutes = getRoutesByCategory('public');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">网站地图</h1>

      {/* 公开页面 */}
      {publicRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">公开页面</h2>
          <ul className="space-y-3">
            {publicRoutes.map((route) => (
              <li key={route.path}>
                <a
                  href={route.path}
                  className="text-blue-600 hover:underline text-lg"
                >
                  {route.title}
                </a>
                <p className="text-gray-600 ml-4">{route.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 主要功能 */}
      {mainRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">主要功能</h2>
          <ul className="space-y-3">
            {mainRoutes.map((route) => (
              <li key={route.path}>
                <a
                  href={route.path}
                  className="text-blue-600 hover:underline text-lg"
                >
                  {route.title}
                </a>
                <p className="text-gray-600 ml-4">{route.description}</p>
                {route.keywords && route.keywords.length > 0 && (
                  <div className="ml-4 mt-1">
                    {route.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded mr-2"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 认证页面 */}
      {authRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">账户管理</h2>
          <ul className="space-y-3">
            {authRoutes.map((route) => (
              <li key={route.path}>
                <a
                  href={route.path}
                  className="text-blue-600 hover:underline text-lg"
                >
                  {route.title}
                </a>
                <p className="text-gray-600 ml-4">{route.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 统计信息 */}
      <section className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-bold mb-4">网站统计</h3>
        <p>总页面数: {routesMetadata.length}</p>
        <p>公开页面: {publicRoutes.length}</p>
        <p>需要认证: {mainRoutes.filter(r => r.requiresAuth).length}</p>
      </section>
    </div>
  );
}
```

---

## 5. 导航菜单

根据路由元数据生成导航菜单：

```typescript
// src/components/Navigation.tsx
import { getPublicRoutes, getAuthenticatedRoutes } from '@/lib/sitemap';
import { useSession } from 'next-auth/react';

export function Navigation() {
  const { data: session } = useSession();
  const publicRoutes = getPublicRoutes();
  const authenticatedRoutes = getAuthenticatedRoutes();

  // 根据用户认证状态显示不同的路由
  const visibleRoutes = session ? authenticatedRoutes : publicRoutes;

  // 只显示应包含在 sitemap 中的路由（通常是主要导航项）
  const navRoutes = visibleRoutes.filter(
    (route) => route.includeInSitemap && route.category === 'main'
  );

  return (
    <nav>
      <ul className="flex gap-6">
        {navRoutes.map((route) => (
          <li key={route.path}>
            <a
              href={route.path}
              className="hover:text-blue-600"
              title={route.description}
            >
              {route.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

---

## 6. 页脚组件

使用网站元数据的页脚：

```typescript
// src/components/Footer.tsx
import { getSiteMetadata } from '@/lib/sitemap';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

export function Footer() {
  const site = getSiteMetadata();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 网站信息 */}
          <div className="col-span-2">
            <h3 className="text-2xl font-bold mb-4">{site.name}</h3>
            <p className="text-gray-400 mb-4">{site.description}</p>
            <p className="text-sm text-gray-500">{site.copyright}</p>
          </div>

          {/* 快速链接 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-400 hover:text-white">
                  关于我们
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-400 hover:text-white">
                  博客
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white">
                  联系我们
                </a>
              </li>
            </ul>
          </div>

          {/* 联系和社交 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">联系我们</h4>
            <p className="text-gray-400 mb-2">
              <a href={`mailto:${site.contact.email}`} className="hover:text-white">
                {site.contact.email}
              </a>
            </p>
            {site.contact.supportEmail && (
              <p className="text-gray-400 mb-4">
                支持: <a href={`mailto:${site.contact.supportEmail}`}>{site.contact.supportEmail}</a>
              </p>
            )}

            {/* 社交媒体 */}
            <div className="flex gap-4 mt-4">
              {site.social.github && (
                <a
                  href={site.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                  aria-label="GitHub"
                >
                  <FaGithub size={24} />
                </a>
              )}
              {site.social.twitter && (
                <a
                  href={site.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                  aria-label="Twitter"
                >
                  <FaTwitter size={24} />
                </a>
              )}
              {site.social.linkedin && (
                <a
                  href={site.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## 7. SEO 组件

动态生成 SEO 标签的组件：

```typescript
// src/components/SEO.tsx
import { generatePageMetadata, getRouteMetadata } from '@/lib/sitemap';
import Head from 'next/head';

interface SEOProps {
  path: string;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
}

export function SEO({
  path,
  customTitle,
  customDescription,
  customImage,
}: SEOProps) {
  const routeMeta = getRouteMetadata(path);

  const metadata = generatePageMetadata({
    title: customTitle || routeMeta?.title,
    description: customDescription || routeMeta?.description,
    keywords: routeMeta?.keywords,
    image: customImage,
  });

  return (
    <Head>
      <title>{metadata.title as string}</title>
      <meta name="description" content={metadata.description as string} />
      {metadata.keywords && (
        <meta name="keywords" content={(metadata.keywords as string[]).join(', ')} />
      )}
      {/* 添加更多 meta 标签 */}
    </Head>
  );
}

// 使用示例
export default function ProductPage() {
  return (
    <>
      <SEO path="/product" />
      <div>产品内容</div>
    </>
  );
}
```

---

## 总结

通过这些示例，你可以看到：

1. **网站元数据 (`site-metadata.ts`)** - 管理网站的全局信息
2. **路由元数据 (`routes-metadata.ts`)** - 管理每个页面的具体信息
3. **自动化** - 元数据在多个地方重用，保持一致性
4. **类型安全** - 使用 TypeScript 确保数据正确性
5. **SEO 优化** - 自动生成 SEO 标签和结构化数据

这样的架构让你只需要维护两个配置文件，就能在整个应用中使用一致的元数据！
