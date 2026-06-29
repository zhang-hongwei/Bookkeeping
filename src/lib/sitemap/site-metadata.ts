/**
 * 网站全局元数据配置文件
 * 用于存储网站的主要信息和 SEO 配置
 */

export interface SiteMetadata {
  /** 网站名称 */
  name: string;
  /** 网站简称 */
  shortName: string;
  /** 网站标语 */
  tagline: string;
  /** 网站描述 */
  description: string;
  /** 网站长描述 */
  longDescription: string;
  /** 网站关键词 */
  keywords: string[];
  /** 网站所有者/公司名称 */
  owner: string;
  /** 版权信息 */
  copyright: string;
  /** 网站创建年份 */
  establishedYear: number;
  /** 网站 URL */
  url: string;
  /** 网站主域名 */
  domain: string;
  /** 网站语言 */
  language: string;
  /** 备用语言 */
  alternateLanguages: string[];
  /** 网站区域 */
  region: string;
  /** 联系信息 */
  contact: {
    email: string;
    phone?: string;
    address?: string;
    supportEmail?: string;
  };
  /** 社交媒体链接 */
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    instagram?: string;
  };
  /** SEO 配置 */
  seo: {
    /** 默认标题模板 */
    titleTemplate: string;
    /** 默认描述 */
    defaultDescription: string;
    /** 网站图标 */
    favicon: string;
    /** Open Graph 图片 */
    ogImage: string;
    /** Twitter 卡片类型 */
    twitterCard: "summary" | "summary_large_image" | "app" | "player";
    /** Twitter 用户名 */
    twitterUsername?: string;
    /** robots 指令 */
    robots: {
      index: boolean;
      follow: boolean;
    };
    /** 验证码 */
    verification: {
      google?: string;
      bing?: string;
      yandex?: string;
    };
  };
  /** 技术栈信息 */
  techStack: {
    framework: string;
    version: string;
    libraries: string[];
    database?: string;
    hosting?: string;
  };
  /** 功能特性 */
  features: string[];
  /** 目标用户群 */
  targetAudience: string[];
  /** 网站类型 */
  type:
    | "web_application"
    | "website"
    | "blog"
    | "ecommerce"
    | "portfolio"
    | "other";
  /** 网站类别 */
  categories: string[];
}

/**
 * 网站全局元数据
 */
export const siteMetadata: SiteMetadata = {
  // ============ 基本信息 ============
  name: "AI Template",
  shortName: "AI Template",
  tagline: "现代化的 Next.js AI 应用模板",
  description:
    "一个现代化的 Next.js 16 AI 模板，集成 TypeScript、MUI v7、Zustand 状态管理和完整的组件库",
  longDescription:
    "AI Template 是一个功能完整、开箱即用的 Next.js 16 应用模板。" +
    "集成了最新的技术栈，包括 TypeScript、Material-UI v7、Zustand 状态管理、" +
    "React Query 数据获取、Drizzle ORM 数据库访问等。" +
    "提供了完整的认证系统、用户管理、文件管理、数据分析等功能模块，" +
    "帮助开发者快速启动 AI 应用项目。",
  keywords: [
    "Next.js",
    "React",
    "TypeScript",
    "AI",
    "Template",
    "MUI",
    "Material-UI",
    "Zustand",
    "React Query",
    "Drizzle ORM",
    "Web Application",
    "Dashboard",
    "Admin Panel",
    "SaaS",
    "Starter Kit",
  ],

  // ============ 所有者信息 ============
  owner: "Your Company Name",
  copyright: `© ${new Date().getFullYear()} AI Template. All rights reserved.`,
  establishedYear: 2024,

  // ============ URL 信息 ============
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost",
  language: "zh-CN",
  alternateLanguages: ["en-US", "zh-TW"],
  region: "CN",

  // ============ 联系信息 ============
  contact: {
    email: "contact@example.com",
    supportEmail: "support@example.com",
    phone: "+86 123-4567-8900",
    address: "中国 北京市 朝阳区 xxx路 xxx号",
  },

  // ============ 社交媒体 ============
  social: {
    twitter: "https://twitter.com/yourhandle",
    github: "https://github.com/yourusername/yourrepo",
    linkedin: "https://linkedin.com/company/yourcompany",
    // facebook: 'https://facebook.com/yourpage',
    // youtube: 'https://youtube.com/@yourchannel',
    // instagram: 'https://instagram.com/yourhandle',
  },

  // ============ SEO 配置 ============
  seo: {
    titleTemplate: "%s | AI Template",
    defaultDescription:
      "一个现代化的 Next.js 16 AI 模板，集成 TypeScript、MUI v7、Zustand 状态管理和完整的组件库",
    favicon: "/favicon.ico",
    ogImage: "/og-image.png",
    twitterCard: "summary_large_image",
    twitterUsername: "@yourhandle",
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      // google: 'your-google-site-verification-code',
      // bing: 'your-bing-verification-code',
      // yandex: 'your-yandex-verification-code',
    },
  },

  // ============ 技术栈信息 ============
  techStack: {
    framework: "Next.js",
    version: "15.5.2",
    libraries: [
      "React 19",
      "TypeScript 5",
      "Material-UI v7",
      "Zustand",
      "React Query",
      "Drizzle ORM",
      "next-auth v5",
      "React Hook Form",
      "Zod",
      "Tailwind CSS v4",
    ],
    database: "PostgreSQL",
    hosting: "Vercel / Self-hosted",
  },

  // ============ 功能特性 ============
  features: [
    "🚀 基于 Next.js 16 和 React 19",
    "📘 TypeScript 类型安全",
    "🎨 Material-UI v7 组件库",
    "🔐 next-auth v5 认证系统",
    "📊 数据分析与可视化",
    "👥 用户管理系统",
    "📁 文件管理器",
    "🔔 实时通知系统",
    "🌐 国际化支持 (i18n)",
    "🌓 深色模式支持",
    "📱 响应式设计",
    "⚡ 性能优化",
    "🧪 测试覆盖",
    "📝 完整文档",
  ],

  // ============ 目标用户群 ============
  targetAudience: [
    "前端开发者",
    "Full Stack 开发者",
    "创业公司",
    "AI 应用开发团队",
    "SaaS 产品团队",
    "独立开发者",
    "技术爱好者",
  ],

  // ============ 网站类型 ============
  type: "web_application",
  categories: [
    "Web Application",
    "Dashboard",
    "Admin Panel",
    "SaaS Platform",
    "AI Application",
    "Developer Tools",
    "Template",
    "Starter Kit",
  ],
};

/**
 * 获取网站元数据
 */
export function getSiteMetadata(): SiteMetadata {
  return siteMetadata;
}

/**
 * 获取 JSON-LD 结构化数据（用于 SEO）
 */
export function getStructuredData() {
  const metadata = getSiteMetadata();

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: metadata.name,
    description: metadata.description,
    url: metadata.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: metadata.owner,
      url: metadata.url,
      sameAs: Object.values(metadata.social).filter(Boolean),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "120",
    },
    featureList: metadata.features,
  };
}

/**
 * 获取 Open Graph 元数据
 */
export function getOpenGraphMetadata(
  title?: string,
  description?: string,
  image?: string
) {
  const metadata = getSiteMetadata();

  return {
    title: title || metadata.name,
    description: description || metadata.description,
    url: metadata.url,
    siteName: metadata.name,
    images: [
      {
        url: image || metadata.seo.ogImage,
        width: 1200,
        height: 630,
        alt: metadata.name,
      },
    ],
    locale: metadata.language,
    alternateLocale: metadata.alternateLanguages,
    type: "website",
  };
}

/**
 * 获取 Twitter 卡片元数据
 */
export function getTwitterMetadata(
  title?: string,
  description?: string,
  image?: string
) {
  const metadata = getSiteMetadata();

  return {
    card: metadata.seo.twitterCard,
    title: title || metadata.name,
    description: description || metadata.description,
    images: [image || metadata.seo.ogImage],
    creator: metadata.seo.twitterUsername,
    site: metadata.seo.twitterUsername,
  };
}

/**
 * 生成完整的页面元数据
 */
export function generatePageMetadata(options?: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
}) {
  const metadata = getSiteMetadata();

  return {
    title: options?.title
      ? metadata.seo.titleTemplate.replace("%s", options.title)
      : metadata.name,
    description: options?.description || metadata.description,
    keywords: options?.keywords || metadata.keywords,
    authors: [{ name: metadata.owner }],
    creator: metadata.owner,
    publisher: metadata.owner,
    robots: options?.noindex
      ? { index: false, follow: false }
      : metadata.seo.robots,
    openGraph: getOpenGraphMetadata(
      options?.title,
      options?.description,
      options?.image
    ),
    twitter: getTwitterMetadata(
      options?.title,
      options?.description,
      options?.image
    ),
    icons: {
      icon: metadata.seo.favicon,
    },
    verification: metadata.seo.verification,
  };
}
