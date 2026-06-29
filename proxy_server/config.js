// SaaS 模板代理服务器配置
const DEFAULT_CONFIG = {
  name: "开发代理服务器",
  port: process.env.PROXY_PORT || 6001,
  timeout: 30000,
  description: "Next.js SaaS 模板开发代理服务器",
};

// 代理路由配置 - 支持多个后端服务
const PROXY_ROUTES = [
  // {
  //   // API 路由
  //   path: "/api",
  //   host: process.env.API_HOST || "localhost",
  //   port: process.env.API_PORT || 8088,
  //   target: process.env.API_URL || `http://${process.env.API_HOST || "localhost"}:${process.env.API_PORT || 8088}`,
  //   pathRewrite: {
  //     "^/api": "" // 移除 /api 前缀
  //   },
  //   description: "后端 API 服务"
  // },
  // {
  //   // 文件上传/下载服务
  //   path: "/files",
  //   host: process.env.FILE_HOST || "localhost",
  //   port: process.env.FILE_PORT || 9000,
  //   target: process.env.FILE_SERVER_URL || `http://${process.env.FILE_HOST || "localhost"}:${process.env.FILE_PORT || 9000}`,
  //   pathRewrite: {
  //     "^/files": "" // 移除 /files 前缀
  //   },
  //   description: "文件服务器"
  // }
  // 可以根据需要添加更多路由...
];

// CORS 配置
const CORS_CONFIG = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    // 可以从环境变量添加更多允许的域名
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : []),
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Access-Token",
    "X-Requested-With",
    "Accept",
    "Cache-Control",
  ],
};

// 获取代理配置
const getProxyConfig = () => {
  console.log(`\n🎯 代理服务器: ${DEFAULT_CONFIG.name}`);
  console.log(`📍 监听端口: ${DEFAULT_CONFIG.port}`);
  console.log(`⏱️  超时时间: ${DEFAULT_CONFIG.timeout}ms`);
  console.log(`📝 说明: ${DEFAULT_CONFIG.description}\n`);

  console.log("🔗 路由配置:");
  PROXY_ROUTES.forEach((route, index) => {
    console.log(
      `   ${index + 1}. ${route.path}/* → ${route.target}/* (${
        route.description
      })`
    );
    console.log(`      📍 主机: ${route.host} | 端口: ${route.port}`);
  });
  console.log("");

  return {
    server: DEFAULT_CONFIG,
    routes: PROXY_ROUTES,
    cors: CORS_CONFIG,
  };
};

// 验证配置
const validateConfig = () => {
  // 检查端口是否被占用
  if (!DEFAULT_CONFIG.port || isNaN(DEFAULT_CONFIG.port)) {
    console.error("❌ 无效的端口配置");
    process.exit(1);
  }

  // 检查路由配置 - 如果为空数组，提示用户并退出
  if (!PROXY_ROUTES.length) {
    console.log("");
    console.log("🔧 代理服务器配置检查:");
    console.log("   📋 PROXY_ROUTES 为空数组");
    console.log("   ℹ️  当前不需要代理服务，跳过启动");
    console.log("");
    console.log("💡 如需启动代理服务，请在 proxy_server/config.js 中配置 PROXY_ROUTES");
    console.log("   示例配置:");
    console.log("   {");
    console.log('     path: "/api",');
    console.log('     target: "http://localhost:8088",');
    console.log('     description: "后端 API 服务"');
    console.log("   }");
    console.log("");

    // 优雅退出，不启动代理服务
    process.exit(0);
  }

  // 检查路由冲突
  const paths = PROXY_ROUTES.map((route) => route.path);
  const uniquePaths = [...new Set(paths)];
  if (paths.length !== uniquePaths.length) {
    console.error("❌ 检测到重复的路由路径配置");
    process.exit(1);
  }

  console.log("✅ 配置验证通过");
};

module.exports = {
  DEFAULT_CONFIG,
  PROXY_ROUTES,
  CORS_CONFIG,
  getProxyConfig,
  validateConfig,
};
