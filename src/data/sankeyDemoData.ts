import type { RequirementMappingData } from "@/components/ui/Charts";

// 需求映射拆分示例数据
export const requirementMappingData: RequirementMappingData = {
  nodes: [
    // 第一层：主需求
    {
      id: "main-req",
      name: "用户管理系统",
      value: 100,
      category: 0,
      itemStyle: { color: "#5470c6" },
    },

    // 第二层：子功能模块
    {
      id: "auth-module",
      name: "身份认证模块",
      value: 35,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },
    {
      id: "user-profile",
      name: "用户档案模块",
      value: 25,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },
    {
      id: "permission-module",
      name: "权限管理模块",
      value: 30,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },
    {
      id: "audit-module",
      name: "审计日志模块",
      value: 10,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },

    // 第三层：具体功能点
    {
      id: "login",
      name: "用户登录",
      value: 15,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "register",
      name: "用户注册",
      value: 10,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "password-reset",
      name: "密码重置",
      value: 10,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "profile-edit",
      name: "资料编辑",
      value: 15,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "avatar-upload",
      name: "头像上传",
      value: 10,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "role-assign",
      name: "角色分配",
      value: 15,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "permission-check",
      name: "权限检查",
      value: 15,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "activity-log",
      name: "操作日志",
      value: 10,
      category: 2,
      itemStyle: { color: "#fac858" },
    },

    // 第四层：技术实现任务
    {
      id: "jwt-auth",
      name: "JWT认证",
      value: 8,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "oauth-integration",
      name: "OAuth集成",
      value: 7,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "form-validation",
      name: "表单验证",
      value: 6,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "email-service",
      name: "邮件服务",
      value: 5,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "sms-service",
      name: "短信服务",
      value: 5,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "file-upload-api",
      name: "文件上传API",
      value: 6,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "image-processing",
      name: "图片处理",
      value: 4,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "rbac-database",
      name: "RBAC数据库设计",
      value: 8,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "permission-cache",
      name: "权限缓存",
      value: 7,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "log-database",
      name: "日志数据库",
      value: 5,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "log-analysis",
      name: "日志分析",
      value: 5,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
  ],

  links: [
    // 主需求到子模块的映射
    { source: "main-req", target: "auth-module", value: 35 },
    { source: "main-req", target: "user-profile", value: 25 },
    { source: "main-req", target: "permission-module", value: 30 },
    { source: "main-req", target: "audit-module", value: 10 },

    // 子模块到具体功能的映射
    { source: "auth-module", target: "login", value: 15 },
    { source: "auth-module", target: "register", value: 10 },
    { source: "auth-module", target: "password-reset", value: 10 },

    { source: "user-profile", target: "profile-edit", value: 15 },
    { source: "user-profile", target: "avatar-upload", value: 10 },

    { source: "permission-module", target: "role-assign", value: 15 },
    { source: "permission-module", target: "permission-check", value: 15 },

    { source: "audit-module", target: "activity-log", value: 10 },

    // 具体功能到技术实现的映射
    { source: "login", target: "jwt-auth", value: 8 },
    { source: "login", target: "oauth-integration", value: 7 },

    { source: "register", target: "form-validation", value: 6 },
    { source: "register", target: "email-service", value: 4 },

    { source: "password-reset", target: "email-service", value: 1 },
    { source: "password-reset", target: "sms-service", value: 5 },
    { source: "password-reset", target: "form-validation", value: 4 },

    { source: "profile-edit", target: "form-validation", value: 8 },
    { source: "profile-edit", target: "file-upload-api", value: 7 },

    { source: "avatar-upload", target: "file-upload-api", value: 6 },
    { source: "avatar-upload", target: "image-processing", value: 4 },

    { source: "role-assign", target: "rbac-database", value: 8 },
    { source: "role-assign", target: "permission-cache", value: 7 },

    { source: "permission-check", target: "rbac-database", value: 8 },
    { source: "permission-check", target: "permission-cache", value: 7 },

    { source: "activity-log", target: "log-database", value: 5 },
    { source: "activity-log", target: "log-analysis", value: 5 },
  ],

  categories: [
    { name: "主需求", itemStyle: { color: "#5470c6" } },
    { name: "功能模块", itemStyle: { color: "#91cc75" } },
    { name: "具体功能", itemStyle: { color: "#fac858" } },
    { name: "技术实现", itemStyle: { color: "#ee6666" } },
  ],
};

// 简化版本的需求映射数据
export const simpleRequirementData: RequirementMappingData = {
  nodes: [
    {
      id: "epic-1",
      name: "电商平台",
      value: 100,
      category: 0,
      itemStyle: { color: "#5470c6" },
    },
    {
      id: "feature-1",
      name: "商品管理",
      value: 40,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },
    {
      id: "feature-2",
      name: "订单系统",
      value: 35,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },
    {
      id: "feature-3",
      name: "支付模块",
      value: 25,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },
    {
      id: "story-1",
      name: "商品列表",
      value: 20,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "story-2",
      name: "商品详情",
      value: 20,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "story-3",
      name: "购物车",
      value: 15,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "story-4",
      name: "下单流程",
      value: 20,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "story-5",
      name: "支付接口",
      value: 25,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
  ],

  links: [
    { source: "epic-1", target: "feature-1", value: 40 },
    { source: "epic-1", target: "feature-2", value: 35 },
    { source: "epic-1", target: "feature-3", value: 25 },
    { source: "feature-1", target: "story-1", value: 20 },
    { source: "feature-1", target: "story-2", value: 20 },
    { source: "feature-2", target: "story-3", value: 15 },
    { source: "feature-2", target: "story-4", value: 20 },
    { source: "feature-3", target: "story-5", value: 25 },
  ],

  categories: [
    { name: "Epic", itemStyle: { color: "#5470c6" } },
    { name: "Feature", itemStyle: { color: "#91cc75" } },
    { name: "Story", itemStyle: { color: "#fac858" } },
  ],
};

// 多分支需求映射数据
export const multiBranchData: RequirementMappingData = {
  nodes: [
    // 源头需求
    {
      id: "customer-req",
      name: "客户需求",
      value: 100,
      category: 0,
      itemStyle: { color: "#5470c6" },
    },

    // 产品需求
    {
      id: "product-req-1",
      name: "移动端App",
      value: 45,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },
    {
      id: "product-req-2",
      name: "Web管理后台",
      value: 35,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },
    {
      id: "product-req-3",
      name: "API服务",
      value: 20,
      category: 1,
      itemStyle: { color: "#91cc75" },
    },

    // 开发任务
    {
      id: "mobile-ui",
      name: "移动端UI",
      value: 25,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "mobile-logic",
      name: "移动端逻辑",
      value: 20,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "web-ui",
      name: "Web界面",
      value: 20,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "web-logic",
      name: "Web逻辑",
      value: 15,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "api-design",
      name: "API设计",
      value: 10,
      category: 2,
      itemStyle: { color: "#fac858" },
    },
    {
      id: "api-impl",
      name: "API实现",
      value: 10,
      category: 2,
      itemStyle: { color: "#fac858" },
    },

    // 最终交付物
    {
      id: "ios-app",
      name: "iOS应用",
      value: 22,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "android-app",
      name: "Android应用",
      value: 23,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "admin-panel",
      name: "管理面板",
      value: 35,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
    {
      id: "api-service",
      name: "API服务",
      value: 20,
      category: 3,
      itemStyle: { color: "#ee6666" },
    },
  ],

  links: [
    // 客户需求到产品需求
    { source: "customer-req", target: "product-req-1", value: 45 },
    { source: "customer-req", target: "product-req-2", value: 35 },
    { source: "customer-req", target: "product-req-3", value: 20 },

    // 产品需求到开发任务
    { source: "product-req-1", target: "mobile-ui", value: 25 },
    { source: "product-req-1", target: "mobile-logic", value: 20 },

    { source: "product-req-2", target: "web-ui", value: 20 },
    { source: "product-req-2", target: "web-logic", value: 15 },

    { source: "product-req-3", target: "api-design", value: 10 },
    { source: "product-req-3", target: "api-impl", value: 10 },

    // 开发任务到交付物
    { source: "mobile-ui", target: "ios-app", value: 12 },
    { source: "mobile-ui", target: "android-app", value: 13 },
    { source: "mobile-logic", target: "ios-app", value: 10 },
    { source: "mobile-logic", target: "android-app", value: 10 },

    { source: "web-ui", target: "admin-panel", value: 20 },
    { source: "web-logic", target: "admin-panel", value: 15 },

    { source: "api-design", target: "api-service", value: 10 },
    { source: "api-impl", target: "api-service", value: 10 },
  ],

  categories: [
    { name: "客户需求", itemStyle: { color: "#5470c6" } },
    { name: "产品需求", itemStyle: { color: "#91cc75" } },
    { name: "开发任务", itemStyle: { color: "#fac858" } },
    { name: "交付物", itemStyle: { color: "#ee6666" } },
  ],
};
