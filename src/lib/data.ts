import { cache } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  readTime: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  features: string[];
  rating: number;
  reviews: number;
}

const mockBlogPosts: BlogPost[] = [
  {
    slug: "nextjs-metadata",
    title: "Next.js 16+ 元数据最佳实践",
    description:
      "深入了解 Next.js 16+ 中的元数据 API，包括静态和动态元数据生成、OG 图像创建等高级技巧",
    content: `# Next.js 16+ 元数据最佳实践

Next.js 16+ 提供了强大的元数据 API，让我们可以轻松地为页面添加 SEO 友好的元数据...

## 静态元数据

使用 metadata 对象可以为页面添加静态元数据：

\`\`\`typescript
export const metadata: Metadata = {
  title: '页面标题',
  description: '页面描述',
  // 更多元数据...
};
\`\`\`

## 动态元数据

使用 generateMetadata 函数可以根据数据生成动态元数据：

\`\`\`typescript
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.description,
  };
}
\`\`\`

这样我们就可以为每个页面生成独特的元数据，提升 SEO 效果。`,
    publishedAt: "2024-01-15",
    author: {
      name: "张开发",
      avatar: "/avatars/developer.jpg",
    },
    tags: ["Next.js", "SEO", "Metadata", "Web开发"],
    readTime: 8,
  },
];

const mockProducts: Product[] = [
  {
    id: "web-framework",
    name: "Next.js Web Framework",
    description:
      "现代化的 React 全栈框架，支持服务端渲染、静态生成和 API 路由等强大功能",
    price: 0,
    category: "开发框架",
    features: [
      "服务端渲染 (SSR)",
      "静态站点生成 (SSG)",
      "API 路由",
      "自动代码分割",
      "内置优化",
      "TypeScript 支持",
    ],
    rating: 4.9,
    reviews: 128000,
  },
];

export const getBlogPost = cache(
  async (slug: string): Promise<BlogPost | null> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockBlogPosts.find((post) => post.slug === slug) || null;
  }
);

export const getAllBlogPosts = cache(async (): Promise<BlogPost[]> => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockBlogPosts;
});

export const getProduct = cache(async (id: string): Promise<Product | null> => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockProducts.find((product) => product.id === id) || null;
});

export const getAllProducts = cache(async (): Promise<Product[]> => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockProducts;
});
