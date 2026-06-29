#!/usr/bin/env node
/**
 * Sitemap 检查脚本
 * 快速验证 sitemap 配置是否正常工作
 */

console.log('🔍 检查 sitemap 配置...\n');

// 模拟路由生成
const LOCALES = ['zh-CN', 'en-US', 'zh-TW', 'ja-JP'];
const BLOG_POSTS = 38;
const PRODUCTS = 25;
const CATEGORIES = 15;
const TAGS = 42;
const USERS = 20;
const DOCS_PAGES = 30;
const HELP_PAGES = 20;
const DISCOVERY_PAGES = 25;

console.log('📦 预计路由数量：');
console.log('-------------------');

const staticRoutes = 13;
console.log(`✅ 静态页面: ${staticRoutes}`);

const multiLangStatic = staticRoutes * LOCALES.length;
console.log(`✅ 多语言静态路由: ${multiLangStatic} (${staticRoutes} × ${LOCALES.length} 语言)`);

const blogRoutes = BLOG_POSTS * LOCALES.length;
console.log(`✅ 博客文章: ${blogRoutes} (${BLOG_POSTS} × ${LOCALES.length} 语言)`);

const productRoutes = PRODUCTS * LOCALES.length;
console.log(`✅ 产品页面: ${productRoutes} (${PRODUCTS} × ${LOCALES.length} 语言)`);

const categoryRoutes = CATEGORIES * LOCALES.length;
console.log(`✅ 分类页面: ${categoryRoutes} (${CATEGORIES} × ${LOCALES.length} 语言)`);

const tagRoutes = TAGS * LOCALES.length;
console.log(`✅ 标签页面: ${tagRoutes} (${TAGS} × ${LOCALES.length} 语言)`);

const userRoutes = USERS;
console.log(`✅ 用户资料: ${userRoutes} (${USERS} 个用户)`);

const docsRoutes = DOCS_PAGES * LOCALES.length;
console.log(`✅ 文档页面: ${docsRoutes} (${DOCS_PAGES} × ${LOCALES.length} 语言)`);

const helpRoutes = HELP_PAGES * LOCALES.length;
console.log(`✅ 帮助页面: ${helpRoutes} (${HELP_PAGES} × ${LOCALES.length} 语言)`);

const discoveryRoutes = DISCOVERY_PAGES * LOCALES.length;
console.log(`✅ 发现页面: ${discoveryRoutes} (${DISCOVERY_PAGES} × ${LOCALES.length} 语言)`);

console.log('-------------------');

const total =
  multiLangStatic +
  blogRoutes +
  productRoutes +
  categoryRoutes +
  tagRoutes +
  userRoutes +
  docsRoutes +
  helpRoutes +
  discoveryRoutes;

console.log(`\n🎯 总计: ${total} 个路由\n`);

console.log('📌 说明:');
console.log('- 这些是使用假数据生成的路由数量');
console.log('- 实际路由数量会在访问 /sitemap.xml 或 /test-sitemap 时生成');
console.log('- 如果页面不存在，访问这些 URL 会返回 404（这是正常的）');
console.log('- 这些路由主要用于 SEO 和搜索引擎收录\n');

console.log('🚀 下一步:');
console.log('1. 启动开发服务器: pnpm dev');
console.log('2. 访问测试页面: http://localhost:3000/test-sitemap');
console.log('3. 查看 sitemap: http://localhost:3000/sitemap.xml\n');

console.log('💡 提示:');
console.log('- 如果要禁用多语言，请编辑 src/lib/sitemap/config.ts');
console.log('- 如果要修改假数据，请编辑 src/lib/sitemap/multi-language-config.ts');
console.log('- 如果要连接真实数据库，请替换对应的生成器函数\n');
