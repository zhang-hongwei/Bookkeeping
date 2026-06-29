/**
 * Material-UI Theme Creator Store
 *
 * Zustand-based state management for the theme creator
 * Migrated from Redux to Zustand
 */

export { useThemeCreatorStore, useThemeCreatorSelector, useThemeCreatorActions } from "./store";
export type {
  ThemeCreatorStore,
  ThemeCreatorState,
  ThemeCreatorActions,
  EditorState,
  EditorStateOptions,
  SavedTheme,
  NewSavedTheme,
  PreviewSize,
} from "./types";
export { themeCreatorInitialState, editorInitialState } from "./initialState";

// ============ Convenience Hooks ============

import { useThemeCreatorStore } from "./store";
import { SavedTheme } from "./types";
import { getByPath } from "@/features/mui-theme-creator/utils";
import { useShallow } from "zustand/react/shallow";

/**
 * 获取编辑器状态
 */
export const useEditorState = () => {
  return useThemeCreatorStore((state) => state.editor);
};

/**
 * 获取当前主题配置
 */
export const useThemeOptions = () => {
  return useThemeCreatorStore((state) => state.themeOptions);
};

/**
 * 获取当前主题对象
 */
export const useThemeObject = () => {
  return useThemeCreatorStore((state) => state.themeObject);
};

/**
 * 获取当前主题ID
 */
export const useCurrentThemeId = () => {
  return useThemeCreatorStore((state) => state.themeId);
};

/**
 * 获取保存的主题列表
 */
export const useSavedThemes = () => {
  return useThemeCreatorStore((state) => state.savedThemes);
};

/**
 * 获取当前主题
 */
export const useCurrentTheme = (): SavedTheme | undefined => {
  return useThemeCreatorStore((state) => state.savedThemes[state.themeId]);
};

/**
 * 获取已加载的字体
 */
export const useLoadedFonts = () => {
  return useThemeCreatorStore((state) => state.loadedFonts);
};

/**
 * 获取当前激活的标签
 */
export const useActiveTab = () => {
  return useThemeCreatorStore((state) => state.activeTab);
};

/**
 * 获取预览尺寸
 */
export const usePreviewSize = () => {
  return useThemeCreatorStore((state) => state.previewSize);
};

/**
 * 获取教程状态
 */
export const useTutorialState = () => {
  return useThemeCreatorStore(
    useShallow((state) => ({
      step: state.tutorialStep,
      isOpen: state.tutorialOpen,
    }))
  );
};

/**
 * 获取 UI 面板状态
 */
export const useUIState = () => {
  return useThemeCreatorStore(
    useShallow((state) => ({
      componentNavOpen: state.componentNavOpen,
      themeConfigOpen: state.themeConfigOpen,
      mobileWarningSeen: state.mobileWarningSeen,
    }))
  );
};

/**
 * 获取是否可以保存
 */
export const useCanSave = () => {
  return useThemeCreatorStore((state) => state.canSave());
};

/**
 * 获取主题指定路径的值以及是否被用户修改
 * @param path - 主题路径，如 "palette.primary.main"
 * @returns { value: any, modifiedByUser: boolean }
 */
export const useThemeValueInfo = (path: string) => {
  return useThemeCreatorStore(
    useShallow((state) => {
      const valFromSaved: any = getByPath(state.themeOptions, path);
      return {
        modifiedByUser: valFromSaved !== undefined,
        value: getByPath(state.themeObject, path),
      };
    })
  );
};

/**
 * 获取主题指定路径的值
 * @param path - 主题路径，如 "palette.primary.main"
 * @returns 主题值
 */
export const useThemeValue = (path: string) => {
  return useThemeValueInfo(path).value;
};

// 默认导出
export default useThemeCreatorStore;
