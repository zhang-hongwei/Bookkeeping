import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { ThemeCreatorStore } from "./types";
import { themeCreatorInitialState, initialFonts } from "./initialState";
import { createThemeCreatorActions } from "./actions";

/**
 * Material-UI Theme Creator Store
 *
 * 功能：
 * - 主题编辑和管理
 * - Monaco 代码编辑器状态
 * - 保存的主题管理
 * - 字体加载管理
 * - UI 状态管理（标签、教程、预览尺寸等）
 *
 * 持久化：
 * - themeId, themeOptions, savedThemes 会被持久化
 * - 在生产环境中，mobileWarningSeen 也会被持久化
 */
export const useThemeCreatorStore = create<ThemeCreatorStore>()(
  devtools(
    persist(
      (set, get, api) => {
        const store = {
          ...themeCreatorInitialState,
          ...createThemeCreatorActions()(set, get, api),
        };

        // 在初始化时加载默认字体（仅在客户端）
        if (typeof window !== 'undefined' && !store.loadedFonts.size) {
          const fontsToLoad = initialFonts.filter(
            (x) => !store.loadedFonts.has(x)
          );
          if (fontsToLoad.length > 0) {
            store.loadFonts(fontsToLoad).then((success) => {
              if (success) {
                const loadedFonts = new Set(
                  [...store.loadedFonts, ...fontsToLoad].sort()
                );
                set({ loadedFonts });
              }
            });
          }
        }

        return store;
      },
      {
        name: "theme-creator-store",

        // 只持久化需要保存的状态
        partialize: (state) => {
          const persisted: any = {
            themeId: state.themeId,
            themeOptions: state.themeOptions,
            savedThemes: state.savedThemes,
          };

          // 在生产环境持久化 mobileWarningSeen
          if (process.env.NODE_ENV === "production") {
            persisted.mobileWarningSeen = state.mobileWarningSeen;
          }

          return persisted;
        },

        // 版本控制
        version: 1,

        // 数据迁移函数
        migrate: (persistedState: any, version: number) => {
          if (version < 1) {
            // 添加数据迁移逻辑
            return {
              ...themeCreatorInitialState,
              ...persistedState,
            };
          }
          return persistedState;
        },

        // 合并持久化状态
        merge: (persistedState: any, currentState) => {
          // 特殊处理 Set 类型
          if (persistedState.loadedFonts) {
            persistedState.loadedFonts = new Set(persistedState.loadedFonts);
          }

          // 合并状态
          return {
            ...currentState,
            ...persistedState,
          };
        },
      }
    ),
    {
      name: "theme-creator-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

/**
 * 选择器 Hook
 *
 * 使用示例：
 * ```tsx
 * const themeOptions = useThemeCreatorSelector(state => state.themeOptions);
 * const canSave = useThemeCreatorSelector(state => state.canSave());
 * ```
 */
export const useThemeCreatorSelector = <T>(
  selector: (state: ThemeCreatorStore) => T
): T => {
  return useThemeCreatorStore(selector);
};

// 定义静态的 actions selector 避免重复创建
const actionsSelector = (state: ThemeCreatorStore) => ({
  // Editor Actions
  saveEditorToTheme: state.saveEditorToTheme,
  updateEditorState: state.updateEditorState,
  updateVersionStates: state.updateVersionStates,

  // Theme Management
  setThemeOption: state.setThemeOption,
  setThemeOptions: state.setThemeOptions,
  removeThemeOption: state.removeThemeOption,
  removeThemeOptions: state.removeThemeOptions,
  updateTheme: state.updateTheme,

  // Saved Themes
  addNewSavedTheme: state.addNewSavedTheme,
  addNewDefaultTheme: state.addNewDefaultTheme,
  loadSavedTheme: state.loadSavedTheme,
  removeSavedTheme: state.removeSavedTheme,
  renameSavedTheme: state.renameSavedTheme,

  // Font Management
  loadFonts: state.loadFonts,
  addFonts: state.addFonts,

  // Component Theme Config
  setComponentThemeConfig: state.setComponentThemeConfig,
  clearComponentThemeConfig: state.clearComponentThemeConfig,

  // UI State
  setActiveTab: state.setActiveTab,
  setSelectedComponentId: state.setSelectedComponentId,
  setPreviewSize: state.setPreviewSize,
  incrementTutorialStep: state.incrementTutorialStep,
  decrementTutorialStep: state.decrementTutorialStep,
  resetTutorialStep: state.resetTutorialStep,
  toggleTutorial: state.toggleTutorial,
  toggleComponentNav: state.toggleComponentNav,
  toggleThemeConfig: state.toggleThemeConfig,
  setMobileWarningSeen: state.setMobileWarningSeen,

  // Utility
  reset: state.reset,
  resetSiteData: state.resetSiteData,

  // Selectors
  canSave: state.canSave,
});

/**
 * 操作方法 Hook
 *
 * 使用示例：
 * ```tsx
 * const { setThemeOption, loadSavedTheme } = useThemeCreatorActions();
 * ```
 */
export const useThemeCreatorActions = () => {
  return useThemeCreatorStore(useShallow(actionsSelector));
};

// 默认导出
export default useThemeCreatorStore;
