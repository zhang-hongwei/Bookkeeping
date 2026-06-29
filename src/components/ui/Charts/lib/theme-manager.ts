import * as echarts from 'echarts';

/**
 * ECharts 主题管理器
 *
 * 职责：
 * 1. 管理 ECharts 主题的注册和注销
 * 2. 避免重复注册主题
 * 3. 提供主题注册状态查询
 * 4. 解决 SSR 环境下的注册问题
 *
 * 使用单例模式确保全局只有一个实例
 */
class EChartsThemeManager {
  private static instance: EChartsThemeManager | null = null;

  // 已注册的主题名称集合
  private registeredThemes = new Set<string>();

  // 私有构造函数，防止外部直接实例化
  private constructor() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 ECharts Theme Manager initialized');
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(): EChartsThemeManager {
    if (!this.instance) {
      this.instance = new EChartsThemeManager();
    }
    return this.instance;
  }

  /**
   * 注册主题
   * @param name 主题名称
   * @param theme 主题配置对象
   * @returns 是否成功注册（false 表示已存在）
   */
  registerTheme(name: string, theme: object): boolean {
    // SSR 环境检查
    if (typeof window === 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Cannot register ECharts theme "${name}" in SSR environment`);
      }
      return false;
    }

    // 检查是否已注册
    if (this.registeredThemes.has(name)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✓ Theme "${name}" already registered, skipping...`);
      }
      return false;
    }

    try {
      // 注册主题
      echarts.registerTheme(name, theme);
      this.registeredThemes.add(name);

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ECharts theme registered: ${name}`);
        console.log(`📊 Total registered themes: ${this.registeredThemes.size}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to register theme "${name}":`, error);
      return false;
    }
  }

  /**
   * 批量注册主题
   * @param themes 主题配置对象 { themeName: themeConfig }
   * @returns 成功注册的主题名称数组
   */
  registerThemes(themes: Record<string, object>): string[] {
    const registered: string[] = [];

    Object.entries(themes).forEach(([name, theme]) => {
      if (this.registerTheme(name, theme)) {
        registered.push(name);
      }
    });

    return registered;
  }

  /**
   * 标记主题为未注册状态（ECharts 不支持真正的注销）
   * @param name 主题名称
   */
  unregisterTheme(name: string): void {
    if (this.registeredThemes.has(name)) {
      this.registeredThemes.delete(name);

      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Theme "${name}" marked as unregistered`);
      }
    }
  }

  /**
   * 检查主题是否已注册
   * @param name 主题名称
   */
  isThemeRegistered(name: string): boolean {
    return this.registeredThemes.has(name);
  }

  /**
   * 获取所有已注册的主题名称
   */
  getRegisteredThemes(): string[] {
    return Array.from(this.registeredThemes);
  }

  /**
   * 清空所有注册记录（用于测试或重置）
   */
  clearRegistry(): void {
    this.registeredThemes.clear();

    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Theme registry cleared');
    }
  }

  /**
   * 获取注册统计信息
   */
  getStats(): {
    totalRegistered: number;
    themes: string[];
    isSSR: boolean;
  } {
    return {
      totalRegistered: this.registeredThemes.size,
      themes: this.getRegisteredThemes(),
      isSSR: typeof window === 'undefined',
    };
  }
}

// 导出单例实例
export const themeManager = EChartsThemeManager.getInstance();

// 导出类型（用于测试或扩展）
export type { EChartsThemeManager };
