/**
 * 多语言 Sitemap 配置
 * 用于生成支持多语言的 sitemap
 */

import { getSitemapRoutes } from "./routes-metadata";
import { SitemapRoute } from "./config";

/**
 * 支持的语言列表
 */
export const SUPPORTED_LOCALES = [
  { code: "zh-CN", name: "简体中文", default: true },
  { code: "en-US", name: "English" },
  { code: "zh-TW", name: "繁體中文" },
  { code: "ja-JP", name: "日本語" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

/**
 * 获取默认语言
 */
export function getDefaultLocale(): LocaleCode {
  return SUPPORTED_LOCALES.find((locale) => locale.default)?.code || "zh-CN";
}

/**
 * 为所有支持的语言生成路由
 * 例如: / -> /zh-CN/, /en-US/, /zh-TW/, /ja-JP/
 */
export function generateMultiLanguageRoutes(): SitemapRoute[] {
  const routes = getSitemapRoutes();
  const multiLangRoutes: SitemapRoute[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const route of routes) {
      // 为每个语言生成路由
      const localizedPath =
        locale.default && route.path === "/"
          ? "/" // 默认语言的首页保持为 /
          : locale.default
            ? route.path // 默认语言的其他页面保持原路径
            : `/${locale.code}${route.path}`; // 非默认语言添加语言前缀

      multiLangRoutes.push({
        path: localizedPath,
        changeFrequency: "weekly",
        priority: route.path === "/" ? 1.0 : 0.7,
        lastModified: new Date().toISOString(),
      });

      // 如果不是默认语言，也为非默认语言生成根路径
      if (!locale.default && route.path === "/") {
        multiLangRoutes.push({
          path: `/${locale.code}`,
          changeFrequency: "weekly",
          priority: 0.9,
          lastModified: new Date().toISOString(),
        });
      }
    }
  }

  return multiLangRoutes;
}

/**
 * 为特定路径生成所有语言版本
 */
export function generatePathInAllLanguages(path: string): SitemapRoute[] {
  return SUPPORTED_LOCALES.map((locale) => {
    const localizedPath = locale.default ? path : `/${locale.code}${path}`;

    return {
      path: localizedPath,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1.0 : 0.7,
      lastModified: new Date().toISOString(),
    };
  });
}

/**
 * 博客文章示例数据（实际应从数据库获取）
 * 参考主流技术博客的内容分类
 */
const EXAMPLE_BLOG_POSTS = [
  // AI 相关
  {
    slug: "introduction-to-chatgpt",
    title: "ChatGPT 入门指南",
    updatedAt: "2024-12-20",
    category: "ai",
  },
  {
    slug: "building-ai-applications",
    title: "构建 AI 应用的最佳实践",
    updatedAt: "2024-12-18",
    category: "ai",
  },
  {
    slug: "prompt-engineering-guide",
    title: "Prompt 工程完全指南",
    updatedAt: "2024-12-15",
    category: "ai",
  },
  {
    slug: "ai-agents-overview",
    title: "AI Agents 技术概览",
    updatedAt: "2024-12-10",
    category: "ai",
  },
  {
    slug: "langchain-tutorial",
    title: "LangChain 快速上手",
    updatedAt: "2024-12-05",
    category: "ai",
  },

  // Next.js 相关
  {
    slug: "nextjs-15-new-features",
    title: "Next.js 16 新特性详解",
    updatedAt: "2024-12-22",
    category: "nextjs",
  },
  {
    slug: "nextjs-server-actions",
    title: "Server Actions 实战指南",
    updatedAt: "2024-12-19",
    category: "nextjs",
  },
  {
    slug: "nextjs-app-router",
    title: "App Router 最佳实践",
    updatedAt: "2024-12-16",
    category: "nextjs",
  },
  {
    slug: "nextjs-performance-optimization",
    title: "Next.js 性能优化指南",
    updatedAt: "2024-12-12",
    category: "nextjs",
  },
  {
    slug: "nextjs-authentication",
    title: "Next.js 认证方案对比",
    updatedAt: "2024-12-08",
    category: "nextjs",
  },

  // React 相关
  {
    slug: "react-19-features",
    title: "React 19 新特性一览",
    updatedAt: "2024-12-21",
    category: "react",
  },
  {
    slug: "react-hooks-patterns",
    title: "React Hooks 常用模式",
    updatedAt: "2024-12-17",
    category: "react",
  },
  {
    slug: "react-state-management",
    title: "React 状态管理方案对比",
    updatedAt: "2024-12-14",
    category: "react",
  },
  {
    slug: "react-performance-tips",
    title: "React 性能优化技巧",
    updatedAt: "2024-12-11",
    category: "react",
  },
  {
    slug: "react-testing-best-practices",
    title: "React 测试最佳实践",
    updatedAt: "2024-12-07",
    category: "react",
  },

  // TypeScript 相关
  {
    slug: "typescript-5-features",
    title: "TypeScript 5 新特性",
    updatedAt: "2024-12-13",
    category: "typescript",
  },
  {
    slug: "typescript-utility-types",
    title: "TypeScript 工具类型详解",
    updatedAt: "2024-12-09",
    category: "typescript",
  },
  {
    slug: "typescript-generics-guide",
    title: "TypeScript 泛型完全指南",
    updatedAt: "2024-12-06",
    category: "typescript",
  },
  {
    slug: "typescript-design-patterns",
    title: "TypeScript 设计模式",
    updatedAt: "2024-12-03",
    category: "typescript",
  },
  {
    slug: "typescript-advanced-types",
    title: "TypeScript 高级类型技巧",
    updatedAt: "2024-11-30",
    category: "typescript",
  },

  // 开发工具
  {
    slug: "vscode-extensions-2024",
    title: "2024 必备 VSCode 插件",
    updatedAt: "2024-12-04",
    category: "tools",
  },
  {
    slug: "git-workflow-guide",
    title: "Git 工作流最佳实践",
    updatedAt: "2024-12-02",
    category: "tools",
  },
  {
    slug: "docker-for-developers",
    title: "Docker 开发者指南",
    updatedAt: "2024-11-29",
    category: "tools",
  },
  {
    slug: "api-testing-tools",
    title: "API 测试工具对比",
    updatedAt: "2024-11-26",
    category: "tools",
  },
  {
    slug: "cli-tools-productivity",
    title: "提升效率的命令行工具",
    updatedAt: "2024-11-23",
    category: "tools",
  },

  // 架构设计
  {
    slug: "microservices-architecture",
    title: "微服务架构设计",
    updatedAt: "2024-11-28",
    category: "architecture",
  },
  {
    slug: "clean-architecture-guide",
    title: "整洁架构实践指南",
    updatedAt: "2024-11-25",
    category: "architecture",
  },
  {
    slug: "api-design-principles",
    title: "API 设计原则",
    updatedAt: "2024-11-22",
    category: "architecture",
  },
  {
    slug: "database-design-best-practices",
    title: "数据库设计最佳实践",
    updatedAt: "2024-11-19",
    category: "architecture",
  },
  {
    slug: "scalability-patterns",
    title: "系统可扩展性模式",
    updatedAt: "2024-11-16",
    category: "architecture",
  },

  // 更多内容...
  {
    slug: "web-security-fundamentals",
    title: "Web 安全基础",
    updatedAt: "2024-11-20",
    category: "security",
  },
  {
    slug: "oauth2-implementation",
    title: "OAuth2 实现指南",
    updatedAt: "2024-11-17",
    category: "security",
  },
  {
    slug: "jwt-best-practices",
    title: "JWT 最佳实践",
    updatedAt: "2024-11-14",
    category: "security",
  },
  {
    slug: "monitoring-and-logging",
    title: "系统监控与日志",
    updatedAt: "2024-11-13",
    category: "devops",
  },
  {
    slug: "ci-cd-pipeline-setup",
    title: "CI/CD 流水线搭建",
    updatedAt: "2024-11-10",
    category: "devops",
  },
  {
    slug: "kubernetes-basics",
    title: "Kubernetes 入门",
    updatedAt: "2024-11-08",
    category: "devops",
  },
];

/**
 * 产品/功能示例数据（实际应从数据库获取）
 * 参考主流 SaaS 产品的功能模块
 */
const EXAMPLE_PRODUCTS = [
  // AI 工具
  {
    slug: "ai-chatbot",
    title: "AI 聊天机器人",
    updatedAt: "2024-12-22",
    category: "ai-tools",
  },
  {
    slug: "ai-content-generator",
    title: "AI 内容生成器",
    updatedAt: "2024-12-21",
    category: "ai-tools",
  },
  {
    slug: "ai-image-generator",
    title: "AI 图片生成器",
    updatedAt: "2024-12-20",
    category: "ai-tools",
  },
  {
    slug: "ai-code-assistant",
    title: "AI 代码助手",
    updatedAt: "2024-12-19",
    category: "ai-tools",
  },
  {
    slug: "ai-translation",
    title: "AI 翻译工具",
    updatedAt: "2024-12-18",
    category: "ai-tools",
  },

  // 数据分析
  {
    slug: "data-visualization",
    title: "数据可视化平台",
    updatedAt: "2024-12-17",
    category: "analytics",
  },
  {
    slug: "business-intelligence",
    title: "商业智能分析",
    updatedAt: "2024-12-16",
    category: "analytics",
  },
  {
    slug: "user-behavior-analytics",
    title: "用户行为分析",
    updatedAt: "2024-12-15",
    category: "analytics",
  },
  {
    slug: "real-time-dashboard",
    title: "实时数据看板",
    updatedAt: "2024-12-14",
    category: "analytics",
  },
  {
    slug: "custom-reports",
    title: "自定义报表",
    updatedAt: "2024-12-13",
    category: "analytics",
  },

  // 协作工具
  {
    slug: "team-collaboration",
    title: "团队协作平台",
    updatedAt: "2024-12-12",
    category: "collaboration",
  },
  {
    slug: "project-management",
    title: "项目管理系统",
    updatedAt: "2024-12-11",
    category: "collaboration",
  },
  {
    slug: "document-sharing",
    title: "文档共享系统",
    updatedAt: "2024-12-10",
    category: "collaboration",
  },
  {
    slug: "video-conferencing",
    title: "视频会议工具",
    updatedAt: "2024-12-09",
    category: "collaboration",
  },
  {
    slug: "task-management",
    title: "任务管理工具",
    updatedAt: "2024-12-08",
    category: "collaboration",
  },

  // 开发工具
  {
    slug: "api-management",
    title: "API 管理平台",
    updatedAt: "2024-12-07",
    category: "developer-tools",
  },
  {
    slug: "code-review",
    title: "代码审查工具",
    updatedAt: "2024-12-06",
    category: "developer-tools",
  },
  {
    slug: "database-client",
    title: "数据库客户端",
    updatedAt: "2024-12-05",
    category: "developer-tools",
  },
  {
    slug: "rest-api-tester",
    title: "REST API 测试器",
    updatedAt: "2024-12-04",
    category: "developer-tools",
  },
  {
    slug: "graphql-playground",
    title: "GraphQL 调试工具",
    updatedAt: "2024-12-03",
    category: "developer-tools",
  },

  // 更多产品...
  {
    slug: "email-marketing",
    title: "邮件营销工具",
    updatedAt: "2024-12-02",
    category: "marketing",
  },
  {
    slug: "seo-optimizer",
    title: "SEO 优化工具",
    updatedAt: "2024-12-01",
    category: "marketing",
  },
  {
    slug: "social-media-manager",
    title: "社交媒体管理",
    updatedAt: "2024-11-30",
    category: "marketing",
  },
  {
    slug: "crm-system",
    title: "CRM 系统",
    updatedAt: "2024-11-29",
    category: "business",
  },
  {
    slug: "invoice-generator",
    title: "发票生成器",
    updatedAt: "2024-11-28",
    category: "business",
  },
];

/**
 * 生成博客文章的动态路由（所有语言）
 */
export async function generateBlogRoutes(): Promise<SitemapRoute[]> {
  // TODO: 替换为实际的数据库查询
  // const posts = await db.query('SELECT slug, updated_at FROM posts');

  const posts = EXAMPLE_BLOG_POSTS;
  const routes: SitemapRoute[] = [];

  for (const post of posts) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = locale.default
        ? `/blog/${post.slug}`
        : `/${locale.code}/blog/${post.slug}`;

      routes.push({
        path,
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: post.updatedAt,
      });
    }
  }

  return routes;
}

/**
 * 生成产品的动态路由（所有语言）
 */
export async function generateProductRoutes(): Promise<SitemapRoute[]> {
  // TODO: 替换为实际的数据库查询
  // const products = await db.query('SELECT slug, updated_at FROM products');

  const products = EXAMPLE_PRODUCTS;
  const routes: SitemapRoute[] = [];

  for (const product of products) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = locale.default
        ? `/product/${product.slug}`
        : `/${locale.code}/product/${product.slug}`;

      routes.push({
        path,
        changeFrequency: "weekly",
        priority: 0.7,
        lastModified: product.updatedAt,
      });
    }
  }

  return routes;
}

/**
 * 生成分类页面的动态路由
 */
export async function generateCategoryRoutes(): Promise<SitemapRoute[]> {
  // 主流技术博客分类
  const categories = [
    "ai", // AI/人工智能
    "nextjs", // Next.js
    "react", // React
    "typescript", // TypeScript
    "nodejs", // Node.js
    "database", // 数据库
    "devops", // DevOps
    "architecture", // 架构设计
    "security", // 安全
    "tools", // 开发工具
    "frontend", // 前端开发
    "backend", // 后端开发
    "mobile", // 移动开发
    "cloud", // 云计算
    "testing", // 测试
  ];

  const routes: SitemapRoute[] = [];

  for (const category of categories) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = locale.default
        ? `/blog/category/${category}`
        : `/${locale.code}/blog/category/${category}`;

      routes.push({
        path,
        changeFrequency: "weekly",
        priority: 0.5,
        lastModified: new Date().toISOString(),
      });
    }
  }

  return routes;
}

/**
 * 生成标签页面的动态路由
 */
export async function generateTagRoutes(): Promise<SitemapRoute[]> {
  // 主流技术标签
  const tags = [
    // AI 相关
    "chatgpt",
    "gpt-4",
    "langchain",
    "prompt-engineering",
    "ai-agents",
    "machine-learning",

    // 前端框架
    "nextjs",
    "react",
    "vue",
    "angular",
    "svelte",

    // 编程语言
    "typescript",
    "javascript",
    "python",
    "go",
    "rust",

    // 后端技术
    "nodejs",
    "express",
    "nestjs",
    "fastapi",
    "django",

    // 数据库
    "postgresql",
    "mongodb",
    "redis",
    "mysql",
    "prisma",
    "drizzle",

    // 工具和平台
    "docker",
    "kubernetes",
    "aws",
    "vercel",
    "github-actions",

    // 设计和 UI
    "tailwindcss",
    "material-ui",
    "figma",
    "ui-ux",

    // 开发实践
    "best-practices",
    "tutorial",
    "guide",
    "tips",
    "performance",
    "security",
    "testing",
  ];

  const routes: SitemapRoute[] = [];

  for (const tag of tags) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = locale.default
        ? `/blog/tag/${tag}`
        : `/${locale.code}/blog/tag/${tag}`;

      routes.push({
        path,
        changeFrequency: "weekly",
        priority: 0.4,
        lastModified: new Date().toISOString(),
      });
    }
  }

  return routes;
}

/**
 * 生成用户公开资料页面（如果有的话）
 */
export async function generateUserProfileRoutes(): Promise<SitemapRoute[]> {
  // 模拟公开用户资料数据
  const publicUsers = [
    { username: "john-doe", updatedAt: "2024-12-15" },
    { username: "jane-smith", updatedAt: "2024-12-14" },
    { username: "dev-master", updatedAt: "2024-12-13" },
    { username: "ai-enthusiast", updatedAt: "2024-12-12" },
    { username: "fullstack-hero", updatedAt: "2024-12-11" },
    { username: "frontend-ninja", updatedAt: "2024-12-10" },
    { username: "backend-expert", updatedAt: "2024-12-09" },
    { username: "devops-guru", updatedAt: "2024-12-08" },
    { username: "data-scientist", updatedAt: "2024-12-07" },
    { username: "ml-engineer", updatedAt: "2024-12-06" },
    { username: "web-designer", updatedAt: "2024-12-05" },
    { username: "mobile-developer", updatedAt: "2024-12-04" },
    { username: "security-specialist", updatedAt: "2024-12-03" },
    { username: "cloud-architect", updatedAt: "2024-12-02" },
    { username: "product-manager", updatedAt: "2024-12-01" },
    { username: "ux-researcher", updatedAt: "2024-11-30" },
    { username: "qa-engineer", updatedAt: "2024-11-29" },
    { username: "tech-writer", updatedAt: "2024-11-28" },
    { username: "open-source-contributor", updatedAt: "2024-11-27" },
    { username: "startup-founder", updatedAt: "2024-11-26" },
  ];

  const routes: SitemapRoute[] = [];

  for (const user of publicUsers) {
    routes.push({
      path: `/user/${user.username}`,
      changeFrequency: "monthly",
      priority: 0.3,
      lastModified: user.updatedAt,
    });
  }

  return routes;
}

/**
 * 生成文档页面路由（类似 LobeChat 的文档）
 */
export async function generateDocumentationRoutes(): Promise<SitemapRoute[]> {
  const docsPages = [
    // Getting Started
    "getting-started/introduction",
    "getting-started/installation",
    "getting-started/quick-start",
    "getting-started/configuration",

    // Core Features
    "features/chat",
    "features/ai-models",
    "features/plugins",
    "features/agents",
    "features/marketplace",

    // Development
    "development/environment-setup",
    "development/api-reference",
    "development/plugin-development",
    "development/custom-themes",
    "development/deployment",

    // Integration
    "integration/overview",
    "integration/rest-api",
    "integration/webhooks",
    "integration/sdks",

    // Advanced
    "advanced/performance",
    "advanced/security",
    "advanced/monitoring",
    "advanced/backup",
    "advanced/migration",

    // Community
    "community/contributing",
    "community/roadmap",
    "community/faq",
    "community/support",
    "community/changelog",
  ];

  const routes: SitemapRoute[] = [];

  for (const page of docsPages) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = locale.default
        ? `/docs/${page}`
        : `/${locale.code}/docs/${page}`;

      routes.push({
        path,
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: new Date().toISOString(),
      });
    }
  }

  return routes;
}

/**
 * 生成帮助和支持页面路由
 */
export async function generateHelpRoutes(): Promise<SitemapRoute[]> {
  const helpPages = [
    // 帮助中心
    "help/overview",
    "help/user-guide",
    "help/common-issues",
    "help/troubleshooting",
    "help/contact-support",

    // FAQ
    "faq/general",
    "faq/technical",
    "faq/billing",
    "faq/security",
    "faq/integration",

    // 教程
    "tutorials/basic-chat",
    "tutorials/using-plugins",
    "tutorials/custom-agents",
    "tutorials/team-management",
    "tutorials/data-export",

    // 政策和条款
    "privacy-policy",
    "terms-of-service",
    "acceptable-use",
    "data-protection",
    "cookie-policy",
  ];

  const routes: SitemapRoute[] = [];

  for (const page of helpPages) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = locale.default ? `/${page}` : `/${locale.code}/${page}`;

      routes.push({
        path,
        changeFrequency: "monthly",
        priority: 0.4,
        lastModified: new Date().toISOString(),
      });
    }
  }

  return routes;
}

/**
 * 生成发现和探索页面路由
 */
export async function generateDiscoveryRoutes(): Promise<SitemapRoute[]> {
  const discoveryPages = [
    // 发现页面
    "discover/agents",
    "discover/prompts",
    "discover/workflows",
    "discover/templates",
    "discover/collections",

    // 分类浏览
    "discover/ai-chat",
    "discover/code-generation",
    "discover/writing-assistant",
    "discover/image-creation",
    "discover/data-analysis",
    "discover/language-learning",

    // 排行榜
    "leaderboard/trending-agents",
    "leaderboard/popular-prompts",
    "leaderboard/top-contributors",
    "leaderboard/new-creations",
    "leaderboard/most-used",

    // 社区内容
    "community/showcase",
    "community/tutorials",
    "community/case-studies",
    "community/best-practices",
    "community/user-stories",
  ];

  const routes: SitemapRoute[] = [];

  for (const page of discoveryPages) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = locale.default ? `/${page}` : `/${locale.code}/${page}`;

      routes.push({
        path,
        changeFrequency: "daily",
        priority: 0.7,
        lastModified: new Date().toISOString(),
      });
    }
  }

  return routes;
}
