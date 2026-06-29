import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware - 路由拦截
 *
 * 只允许访问 (tools) 路由组下的页面，其他页面返回 404。
 * 新增工具时需要在此处添加路径。
 *
 * TODO: Next.js 完全支持 proxy.ts 后，重命名为 proxy.ts 并改导出名
 */

// (tools) 路由组下的允许路径
const allowedToolPaths = new Set([
  "/",
  "/chat",
  "/animations",
  "/backgrounds",
  "/border-beam",
  "/borderRadius",
  "/boxShadow",
  "/breakpoints",
  "/card-generator",
  "/chartEditor",
  "/clipPath",
  "/color-harmonies",
  "/colors",
  "/contrast",
  "/copy",
  "/easing",
  "/emotional-palette",
  "/filter",
  "/flexbox",
  "/glassmorphism",
  "/gradient-border",
  "/gradient-collection",
  "/gradient-text",
  "/gradientEditor",
  "/gradients",
  "/grid",
  "/hdr-gradient",
  "/image-extract",
  "/muiButton",
  "/patterns",
  "/roast-generator",
  "/spacing-scale",
  "/textShadow",
  "/muiSwitch",
  "/muiSlider"
]);

function isToolsPath(pathname: string): boolean {
  if (pathname === "/") return true;
  const firstSegment = "/" + pathname.split("/").filter(Boolean)[0];
  return allowedToolPaths.has(firstSegment);
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // OPTIONS 预检请求
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200 });
  }

  // 路由拦截：仅允许 tools 页面和 API/embed/sdk 路由
  if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/embed") &&
    !pathname.startsWith("/sdk") &&
    !isToolsPath(pathname)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
