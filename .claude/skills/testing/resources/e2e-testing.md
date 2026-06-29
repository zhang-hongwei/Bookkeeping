# 端到端测试

> Playwright 端到端测试最佳实践

## 📋 目录

- [Playwright 设置](#playwright-设置)
- [Page Object 模式](#page-object-模式)
- [用户流程测试](#用户流程测试)
- [可视化测试](#可视化测试)
- [测试数据管理](#测试数据管理)
- [并行测试和隔离](#并行测试和隔离)

## Playwright 设置

### 安装配置

```bash
# 安装 Playwright
pnpm add -D @playwright/test

# 安装浏览器
pnpm exec playwright install
```

### Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试目录
  testDir: './e2e',

  // 超时设置
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // 失败时重试
  retries: process.env.CI ? 2 : 0,

  // 并行worker数量
  workers: process.env.CI ? 1 : undefined,

  // 测试报告
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // 全局设置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3000',

    // 截图设置
    screenshot: 'only-on-failure',

    // 视频录制
    video: 'retain-on-failure',

    // 追踪
    trace: 'retain-on-failure',

    // 浏览器上下文选项
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  },

  // 测试项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 移动端测试
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // 开发服务器
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 全局设置和清理

```typescript
// e2e/global-setup.ts
import { FullConfig } from '@playwright/test';
import { db } from '@/database/clients/db';

async function globalSetup(config: FullConfig) {
  // 设置测试数据库
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

  // 清理并初始化数据库
  await db.execute('TRUNCATE TABLE users CASCADE');
  await db.execute('TRUNCATE TABLE products CASCADE');

  // 插入测试数据
  await db.insert(users).values([
    { email: 'test@example.com', name: '测试用户', passwordHash: 'hashed' },
  ]);

  console.log('全局测试设置完成');
}

export default globalSetup;

// e2e/global-teardown.ts
async function globalTeardown() {
  // 清理测试数据
  await db.execute('TRUNCATE TABLE users CASCADE');

  console.log('全局测试清理完成');
}

export default globalTeardown;
```

### 测试工具和辅助函数

```typescript
// e2e/utils/test-helpers.ts
import { Page } from '@playwright/test';

/**
 * 等待加载完成
 */
export async function waitForLoadComplete(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * 登录辅助函数
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/signin');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await waitForLoadComplete(page);
}

/**
 * 截取全页面截图
 */
export async function takeFullPageScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * 等待并获取元素文本
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = await page.waitForSelector(selector);
  return (await element.textContent()) || '';
}
```

## Page Object 模式

### 基础 Page Object

```typescript
// e2e/pages/base.page.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
    });
  }
}
```

### 登录页面 Page Object

```typescript
// e2e/pages/login.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // 定位器
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page);

    // 初始化定位器
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.forgotPasswordLink = page.locator('text=忘记密码');
    this.rememberMeCheckbox = page.locator('input[name="rememberMe"]');
  }

  /**
   * 前往登录页面
   */
  async goto() {
    await super.goto('/signin');
    await this.waitForPageLoad();
  }

  /**
   * 填写登录表单
   */
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * 提交登录
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * 执行登录
   */
  async login(email: string, password: string, rememberMe = false) {
    await this.fillLoginForm(email, password);

    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }

    await this.submit();
  }

  /**
   * 获取错误消息
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return (await this.errorMessage.textContent()) || '';
  }

  /**
   * 点击忘记密码
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * 检查是否在登录页面
   */
  async isOnLoginPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/signin');
  }
}
```

### 产品页面 Page Object

```typescript
// e2e/pages/product.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;
  readonly addToCartButtons: Locator;
  readonly filterCategory: Locator;
  readonly sortSelect: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = page.locator('input[placeholder*="搜索"]');
    this.searchButton = page.locator('button[aria-label="搜索"]');
    this.productCards = page.locator('[data-testid="product-card"]');
    this.addToCartButtons = page.locator('button:has-text("加入购物车")');
    this.filterCategory = page.locator('select[name="category"]');
    this.sortSelect = page.locator('select[name="sort"]');
    this.cartBadge = page.locator('[data-testid="cart-badge"]');
  }

  async goto() {
    await super.goto('/products');
    await this.waitForPageLoad();
  }

  /**
   * 搜索产品
   */
  async searchProduct(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  /**
   * 获取产品卡片数量
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * 点击第 N 个产品
   */
  async clickProduct(index: number) {
    await this.productCards.nth(index).click();
  }

  /**
   * 添加第 N 个产品到购物车
   */
  async addProductToCart(index: number) {
    await this.addToCartButtons.nth(index).click();
  }

  /**
   * 按类别过滤
   */
  async filterByCategory(category: string) {
    await this.filterCategory.selectOption(category);
    await this.waitForPageLoad();
  }

  /**
   * 排序产品
   */
  async sortProducts(sortBy: string) {
    await this.sortSelect.selectOption(sortBy);
    await this.waitForPageLoad();
  }

  /**
   * 获取购物车商品数量
   */
  async getCartCount(): Promise<number> {
    const text = await this.cartBadge.textContent();
    return parseInt(text || '0', 10);
  }

  /**
   * 前往购物车
   */
  async goToCart() {
    await this.cartBadge.click();
  }
}
```

### 购物车页面 Page Object

```typescript
// e2e/pages/cart.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly quantityInputs: Locator;
  readonly removeButtons: Locator;
  readonly totalPrice: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);

    this.cartItems = page.locator('[data-testid="cart-item"]');
    this.quantityInputs = page.locator('input[name="quantity"]');
    this.removeButtons = page.locator('button[aria-label="移除"]');
    this.totalPrice = page.locator('[data-testid="total-price"]');
    this.checkoutButton = page.locator('button:has-text("去结账")');
    this.emptyCartMessage = page.locator('text=购物车是空的');
    this.continueShoppingButton = page.locator('button:has-text("继续购物")');
  }

  async goto() {
    await super.goto('/cart');
    await this.waitForPageLoad();
  }

  /**
   * 获取购物车商品数量
   */
  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * 更新商品数量
   */
  async updateQuantity(index: number, quantity: number) {
    const input = this.quantityInputs.nth(index);
    await input.fill(quantity.toString());
    await input.press('Enter');
    await this.page.waitForTimeout(500); // 等待价格更新
  }

  /**
   * 移除商品
   */
  async removeItem(index: number) {
    await this.removeButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 获取总价
   */
  async getTotalPrice(): Promise<string> {
    return (await this.totalPrice.textContent()) || '0';
  }

  /**
   * 前往结账
   */
  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  /**
   * 购物车是否为空
   */
  async isEmpty(): Promise<boolean> {
    return await this.emptyCartMessage.isVisible();
  }

  /**
   * 继续购物
   */
  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}
```

## 用户流程测试

### 认证流程测试

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('用户认证', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('应该成功登录', async ({ page }) => {
    await loginPage.login('test@example.com', 'Password123!');

    // 验证跳转到首页
    await expect(page).toHaveURL('/dashboard');

    // 验证用户菜单可见
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('登录失败应该显示错误', async () => {
    await loginPage.login('wrong@example.com', 'wrongpassword');

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('邮箱或密码错误');

    // 仍然在登录页面
    expect(await loginPage.isOnLoginPage()).toBe(true);
  });

  test('应该记住登录状态', async ({ page, context }) => {
    // 勾选"记住我"登录
    await loginPage.login('test@example.com', 'Password123!', true);
    await expect(page).toHaveURL('/dashboard');

    // 关闭页面并重新打开
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');

    // 应该仍然是登录状态
    await expect(newPage.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('应该支持密码重置流程', async ({ page }) => {
    await loginPage.clickForgotPassword();

    // 填写邮箱
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:has-text("发送重置链接")');

    // 验证成功提示
    await expect(page.locator('text=重置链接已发送')).toBeVisible();
  });

  test('应该支持退出登录', async ({ page }) => {
    // 先登录
    await loginPage.login('test@example.com', 'Password123!');
    await expect(page).toHaveURL('/dashboard');

    // 点击退出
    await page.click('[data-testid="user-menu"]');
    await page.click('text=退出登录');

    // 应该返回登录页面
    await expect(page).toHaveURL('/signin');
  });
});
```

### 电商购物流程测试

```typescript
// e2e/shopping.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ProductPage } from './pages/product.page';
import { CartPage } from './pages/cart.page';

test.describe('购物流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test@example.com', 'Password123!');
  });

  test('完整购物流程', async ({ page }) => {
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // 1. 浏览商品
    await productPage.goto();
    const productCount = await productPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);

    // 2. 搜索商品
    await productPage.searchProduct('手机');
    const searchResults = await productPage.getProductCount();
    expect(searchResults).toBeGreaterThan(0);

    // 3. 添加商品到购物车
    await productPage.addProductToCart(0);

    // 4. 验证购物车徽章更新
    const cartCount = await productPage.getCartCount();
    expect(cartCount).toBe(1);

    // 5. 前往购物车
    await productPage.goToCart();
    await expect(page).toHaveURL('/cart');

    // 6. 验证购物车内容
    const itemCount = await cartPage.getItemCount();
    expect(itemCount).toBe(1);

    // 7. 更新商品数量
    await cartPage.updateQuantity(0, 2);
    const totalPrice = await cartPage.getTotalPrice();
    expect(totalPrice).toBeTruthy();

    // 8. 前往结账
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL('/checkout');

    // 9. 填写配送信息
    await page.fill('input[name="name"]', '张三');
    await page.fill('input[name="phone"]', '13800138000');
    await page.fill('input[name="address"]', '北京市朝阳区某某街道');

    // 10. 选择支付方式
    await page.click('label:has-text("微信支付")');

    // 11. 提交订单
    await page.click('button:has-text("提交订单")');

    // 12. 验证订单成功
    await expect(page).toHaveURL(/\/order\/\w+/);
    await expect(page.locator('text=订单创建成功')).toBeVisible();
  });

  test('应该支持购物车操作', async ({ page }) => {
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // 添加多个商品
    await productPage.goto();
    await productPage.addProductToCart(0);
    await productPage.addProductToCart(1);

    // 前往购物车
    await cartPage.goto();
    expect(await cartPage.getItemCount()).toBe(2);

    // 移除一个商品
    await cartPage.removeItem(0);
    expect(await cartPage.getItemCount()).toBe(1);

    // 继续购物
    await cartPage.continueShopping();
    await expect(page).toHaveURL('/products');
  });

  test('应该处理库存不足', async ({ page }) => {
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    await productPage.goto();
    await productPage.addProductToCart(0);
    await cartPage.goto();

    // 尝试输入超过库存的数量
    await cartPage.updateQuantity(0, 9999);

    // 应该显示错误提示
    await expect(page.locator('text=库存不足')).toBeVisible();
  });
});
```

### 表单交互测试

```typescript
// e2e/forms.spec.ts
import { test, expect } from '@playwright/test';

test.describe('表单交互', () => {
  test('应该验证必填字段', async ({ page }) => {
    await page.goto('/contact');

    // 不填写直接提交
    await page.click('button[type="submit"]');

    // 验证错误消息
    await expect(page.locator('text=姓名不能为空')).toBeVisible();
    await expect(page.locator('text=邮箱不能为空')).toBeVisible();
    await expect(page.locator('text=消息不能为空')).toBeVisible();
  });

  test('应该实时验证邮箱格式', async ({ page }) => {
    await page.goto('/contact');

    const emailInput = page.locator('input[name="email"]');

    // 输入无效邮箱
    await emailInput.fill('invalid');
    await emailInput.blur();

    await expect(page.locator('text=邮箱格式不正确')).toBeVisible();

    // 修正邮箱
    await emailInput.fill('valid@example.com');
    await emailInput.blur();

    await expect(page.locator('text=邮箱格式不正确')).not.toBeVisible();
  });

  test('应该支持文件上传', async ({ page }) => {
    await page.goto('/upload');

    // 上传文件
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-files/sample.pdf');

    // 验证文件名显示
    await expect(page.locator('text=sample.pdf')).toBeVisible();

    // 提交表单
    await page.click('button[type="submit"]');

    // 验证上传成功
    await expect(page.locator('text=上传成功')).toBeVisible();
  });

  test('应该支持自动保存草稿', async ({ page }) => {
    await page.goto('/editor');

    // 输入内容
    const editor = page.locator('textarea[name="content"]');
    await editor.fill('这是我的草稿内容');

    // 等待自动保存
    await page.waitForTimeout(2000);
    await expect(page.locator('text=草稿已保存')).toBeVisible();

    // 刷新页面
    await page.reload();

    // 验证内容恢复
    const content = await editor.inputValue();
    expect(content).toBe('这是我的草稿内容');
  });
});
```

## 可视化测试

### 截图对比测试

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('视觉回归测试', () => {
  test('首页截图对比', async ({ page }) => {
    await page.goto('/');

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');

    // 截图对比
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100, // 允许的最大差异像素
    });
  });

  test('按钮样式对比', async ({ page }) => {
    await page.goto('/components');

    const button = page.locator('button.primary');

    // 默认状态
    await expect(button).toHaveScreenshot('button-default.png');

    // Hover 状态
    await button.hover();
    await expect(button).toHaveScreenshot('button-hover.png');

    // Active 状态
    await button.click({ noWaitAfter: true });
    await expect(button).toHaveScreenshot('button-active.png');
  });

  test('响应式布局对比', async ({ page }) => {
    await page.goto('/products');

    // 桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('products-desktop.png');

    // 平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('products-tablet.png');

    // 移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('products-mobile.png');
  });

  test('深色模式对比', async ({ page }) => {
    await page.goto('/');

    // 浅色模式
    await expect(page).toHaveScreenshot('light-mode.png');

    // 切换到深色模式
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);

    // 深色模式
    await expect(page).toHaveScreenshot('dark-mode.png');
  });
});
```

### 动画和过渡测试

```typescript
// e2e/animations.spec.ts
import { test, expect } from '@playwright/test';

test.describe('动画测试', () => {
  test('模态框动画', async ({ page }) => {
    await page.goto('/');

    // 打开模态框
    await page.click('button:has-text("打开对话框")');

    // 验证动画类
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveClass(/animate-fadeIn/);

    // 截图动画开始状态
    await expect(modal).toHaveScreenshot('modal-opening.png');

    // 等待动画完成
    await page.waitForTimeout(300);
    await expect(modal).toHaveScreenshot('modal-opened.png');

    // 关闭模态框
    await page.click('button[aria-label="关闭"]');
    await expect(modal).toHaveClass(/animate-fadeOut/);
  });

  test('页面过渡动画', async ({ page }) => {
    await page.goto('/page1');

    // 记录初始截图
    await expect(page).toHaveScreenshot('page1.png');

    // 导航到另一个页面
    await page.click('a[href="/page2"]');

    // 等待过渡动画
    await page.waitForTimeout(500);

    // 验证新页面
    await expect(page).toHaveScreenshot('page2.png');
  });
});
```

## 测试数据管理

### Fixture 数据

```typescript
// e2e/fixtures/test-data.ts
export const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin123!',
    name: '管理员',
  },
  user: {
    email: 'user@example.com',
    password: 'User123!',
    name: '普通用户',
  },
};

export const testProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 7999,
    category: '手机',
    stock: 100,
  },
  {
    id: '2',
    name: 'MacBook Pro',
    price: 12999,
    category: '电脑',
    stock: 50,
  },
];
```

### 自定义 Fixture

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // 登录普通用户
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'User123!');

    await use(page);
  },

  adminPage: async ({ page }, use) => {
    // 登录管理员
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@example.com', 'Admin123!');

    await use(page);
  },
});

// 使用示例
test('普通用户功能测试', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  // 测试代码...
});

test('管理员功能测试', async ({ adminPage }) => {
  await adminPage.goto('/admin');
  // 测试代码...
});
```

## 并行测试和隔离

### 测试隔离

```typescript
// e2e/isolation.spec.ts
import { test } from '@playwright/test';

test.describe('测试隔离', () => {
  // 每个测试使用独立的浏览器上下文
  test.use({ storageState: undefined });

  test('测试 1', async ({ page }) => {
    // 这个测试有独立的 cookies 和 localStorage
    await page.goto('/');
  });

  test('测试 2', async ({ page }) => {
    // 这个测试不会受到测试 1 的影响
    await page.goto('/');
  });
});
```

### 并行执行优化

```typescript
// e2e/parallel.spec.ts
import { test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe('并行测试', () => {
  test('快速测试 1', async ({ page }) => {
    // 这些测试会并行执行
    await page.goto('/page1');
  });

  test('快速测试 2', async ({ page }) => {
    await page.goto('/page2');
  });

  test('快速测试 3', async ({ page }) => {
    await page.goto('/page3');
  });
});

// 串行执行
test.describe.serial('串行测试', () => {
  test('步骤 1', async ({ page }) => {
    // 这些测试会按顺序执行
    await page.goto('/step1');
  });

  test('步骤 2', async ({ page }) => {
    // 依赖步骤 1 的结果
    await page.goto('/step2');
  });
});
```

### 条件跳过和重试

```typescript
// e2e/conditional.spec.ts
import { test, expect } from '@playwright/test';

test.describe('条件测试', () => {
  test('仅在 Chrome 中运行', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', '此测试仅支持 Chrome');

    await page.goto('/chrome-only-feature');
    // 测试代码...
  });

  test('不稳定的测试', async ({ page }) => {
    // 失败时自动重试
    test.slow(); // 标记为慢速测试

    await page.goto('/flaky-page');
    // 测试代码...
  });

  test.fixme('已知问题', async ({ page }) => {
    // 标记为已知问题，跳过执行
    await page.goto('/broken-feature');
  });
});
```
