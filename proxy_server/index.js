const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { getProxyConfig, validateConfig } = require("./config");
const chalk = require("chalk");

// 清屏并显示启动横幅
console.clear();
console.log(chalk.cyan("═".repeat(70)));
console.log(
  chalk.bgBlue.white.bold(
    "                   🚀 NEXT.JS SAAS PROXY SERVER 🚀                   "
  )
);
console.log(chalk.cyan("═".repeat(70)));
console.log(chalk.yellow("📦 正在初始化代理服务器..."));

const app = express();

// 验证并获取配置
console.log(chalk.cyan("⚙️  验证配置..."));
validateConfig();
const config = getProxyConfig();

const { server, routes, cors: corsConfig } = config;

// 启用 CORS
console.log(chalk.cyan("🔧 配置 CORS 跨域支持..."));
app.use(cors(corsConfig));
console.log(chalk.green("✓ CORS 配置完成"));

// 错误建议函数
const getErrorSuggestion = (err) => {
  const errorCode = err.code || "";
  const errorMessage = err.message || "";

  if (errorCode === "ECONNREFUSED") {
    return "目标服务器拒绝连接，请检查服务器是否启动";
  } else if (errorCode === "ENOTFOUND") {
    return "无法解析目标服务器地址，请检查域名/IP是否正确";
  } else if (errorCode === "ETIMEDOUT") {
    return "连接超时，请检查网络连接或服务器响应";
  } else if (errorCode === "ECONNRESET") {
    return "连接被重置，可能是服务器主动断开连接";
  } else if (errorMessage.includes("Parse Error: Invalid response status")) {
    return "目标服务返回了无效的HTTP状态行，可能服务器返回了HTML错误页面或非标准响应";
  } else if (errorMessage.includes("Parse Error")) {
    return "HTTP响应解析失败，目标服务可能返回了格式错误的响应";
  } else if (errorMessage.includes("socket hang up")) {
    return "连接被异常断开，可能是服务器处理时间过长或网络不稳定";
  } else {
    return "未知错误，请检查网络连接或联系管理员";
  }
};

// 创建通用代理选项工厂
const createProxyOptions = (route) => ({
  target: route.target,
  changeOrigin: true,
  secure: false,
  followRedirects: true,
  logLevel: "silent",
  timeout: server.timeout,
  pathRewrite: route.pathRewrite || {},
  onProxyReq: (proxyReq, req) => {
    const timestamp = new Date().toLocaleTimeString();
    const origin = req.headers.origin || req.headers.referer || req.headers.host
      ? `http://${req.headers.host}`
      : "unknown";

    const sourceUrl = origin !== "unknown"
      ? `${origin}${route.path}${req.url}`
      : `${route.path}${req.url}`;

    console.log(
      chalk.gray(`[${timestamp}]`) +
        " " +
        chalk.cyan("[PROXY]") +
        " " +
        chalk.yellow(req.method) +
        " " +
        chalk.blue(sourceUrl) +
        " " +
        chalk.magenta("→") +
        " " +
        chalk.green(`${route.target}${req.url}`)
    );

    // 添加请求头信息（仅在调试模式下）
    if (process.env.DEBUG_PROXY === "true") {
      console.log(
        chalk.gray("  Headers:"),
        Object.keys(req.headers).join(", ")
      );
    }
  },
  onProxyRes: (proxyRes, req) => {
    const timestamp = new Date().toLocaleTimeString();
    const statusColor =
      proxyRes.statusCode >= 400
        ? chalk.red
        : proxyRes.statusCode >= 300
          ? chalk.yellow
          : chalk.green;

    const backendUrl = `${route.target}${req.url}`;

    console.log(
      chalk.gray(`[${timestamp}]`) +
        " " +
        chalk.cyan("[RESPONSE]") +
        " " +
        statusColor(proxyRes.statusCode) +
        " " +
        chalk.blue(backendUrl) +
        " " +
        chalk.gray(`(${proxyRes.headers["content-type"] || "unknown"})`)
    );

    // 如果状态码异常，显示详细信息
    if (proxyRes.statusCode >= 400) {
      console.error(
        chalk.yellow("  ⚠️  异常响应详情:") +
          "\n" +
          chalk.red("    状态码: ") +
          statusColor(proxyRes.statusCode) +
          "\n" +
          chalk.red("    状态信息: ") +
          chalk.white(proxyRes.statusMessage || "Unknown") +
          "\n" +
          chalk.red("    Content-Type: ") +
          chalk.gray(proxyRes.headers["content-type"] || "unknown")
      );
    }
  },
  onError: (err, req, res) => {
    const timestamp = new Date().toLocaleTimeString();
    console.error(
      chalk.gray(`[${timestamp}]`) +
        " " +
        chalk.bgRed.white(" ERROR ") +
        " " +
        chalk.red(`${route.description} 代理失败`)
    );
    console.error(chalk.red("  ❌ 错误类型:"), err.code || "UNKNOWN");
    console.error(
      chalk.red("  🎯 请求地址:"),
      chalk.blue(`${route.target}${req.url}`)
    );
    console.error(chalk.red("  📝 错误详情:"), err.message);

    // 显示调试信息
    if (err.response) {
      console.error(
        chalk.red("  📊 响应状态:"),
        chalk.yellow(err.response.statusCode || "Unknown")
      );
    }

    // 显示原始错误堆栈（仅调试模式）
    if (process.env.DEBUG_PROXY === "true") {
      console.error(chalk.gray("  🔍 详细堆栈:"), err.stack);
    }

    console.error(chalk.red("  🔧 建议:"), getErrorSuggestion(err));

    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        error: {
          code: err.code || "PROXY_ERROR",
          message: err.message,
          target: `${route.target}${req.url}`,
          timestamp: new Date().toISOString(),
          suggestion: getErrorSuggestion(err),
        },
      });
    }
  },
});

// 创建代理中间件
console.log(chalk.cyan("🔀 创建代理中间件..."));
const proxyMiddlewares = routes.map(route => ({
  path: route.path,
  middleware: createProxyMiddleware(createProxyOptions(route)),
  description: route.description
}));

console.log("");
proxyMiddlewares.forEach(proxy => {
  const route = routes.find(r => r.path === proxy.path);
  console.log(
    chalk.bgBlue.white(" HPM ") +
      " " +
      chalk.green("Proxy created:") +
      " " +
      chalk.cyan(proxy.path) +
      " " +
      chalk.yellow("→") +
      " " +
      chalk.blue(route.target) +
      " " +
      chalk.gray(`(${proxy.description})`)
  );

  if (route.pathRewrite && Object.keys(route.pathRewrite).length > 0) {
    Object.entries(route.pathRewrite).forEach(([from, to]) => {
      console.log(
        chalk.bgBlue.white(" HPM ") +
          " " +
          chalk.magenta("Rewrite rule:") +
          " " +
          chalk.yellow(`"${from}"`) +
          " " +
          chalk.cyan("~>") +
          " " +
          chalk.green(`"${to}"`)
      );
    });
  }
});
console.log("");

// 注册代理路由
console.log(chalk.cyan("🛣️  注册代理路由..."));
proxyMiddlewares.forEach(proxy => {
  app.use(proxy.path, proxy.middleware);
});
console.log(chalk.green("✓ 代理路由注册完成"));

// 健康检查端点
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    server: {
      name: server.name,
      description: server.description,
      port: server.port,
      timeout: server.timeout,
    },
    routes: routes.map(route => ({
      path: route.path,
      host: route.host,
      port: route.port,
      target: route.target,
      description: route.description,
      pathRewrite: route.pathRewrite
    })),
    timestamp: new Date().toISOString(),
  });
});

// 启动服务器
app.listen(server.port, () => {
  console.log("");
  console.log(chalk.cyan("═".repeat(70)));
  console.log(
    chalk.bgGreen.white.bold(
      "                        ✅ 服务器启动成功！                        "
    )
  );
  console.log(chalk.cyan("═".repeat(70)));
  console.log("");

  console.log(
    chalk.cyan("📡 监听端口: ") + chalk.bold.yellow(`http://localhost:${server.port}`)
  );
  console.log(
    chalk.magenta("🎯 服务名称: ") + chalk.bold.green(server.name)
  );

  console.log("");
  console.log(chalk.bold.blue("🔗 代理路由:"));
  routes.forEach(route => {
    console.log(
      "   " +
        chalk.cyan(`${route.path}/*`) +
        " " +
        chalk.yellow("→") +
        " " +
        chalk.green(`${route.target}/*`) +
        " " +
        chalk.magenta(`(${route.description})`)
    );
  });

  console.log("");
  console.log(
    chalk.yellow("✨ 健康检查: ") +
      chalk.bold.blue(`http://localhost:${server.port}/health`)
  );
  console.log(
    chalk.cyan("🔍 开启详细调试: ") +
      chalk.yellow("DEBUG_PROXY=true pnpm dev") +
      " " +
      chalk.magenta("(显示请求头信息)")
  );

  console.log("");
  console.log(chalk.cyan("═".repeat(70)));
  console.log(chalk.green("🎉 代理服务器已就绪，等待请求中..."));
  console.log(chalk.cyan("═".repeat(70)));
  console.log("");
});

// 错误处理
process.on("uncaughtException", (err) => {
  console.error(chalk.red("❌ Uncaught Exception:"), err);
});

process.on("unhandledRejection", (reason) => {
  console.error(chalk.red("❌ Unhandled Promise Rejection:"), reason);
});