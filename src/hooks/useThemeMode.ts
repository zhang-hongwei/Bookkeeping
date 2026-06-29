"use client";

import { useColorScheme } from "@mui/material/styles";

/**
 * 获取和控制主题模式的 Hook
 * @returns {Object} 包含当前模式、系统模式和切换函数
 */
export function useThemeMode() {
  const { mode, systemMode, setMode } = useColorScheme();

  return {
    /** 当前激活的颜色模式 ('light' | 'dark' | 'system') */
    mode,
    /** 系统的颜色模式 ('light' | 'dark') */
    systemMode,
    /** 实际应用的颜色模式 */
    actualMode: mode === "system" ? systemMode : mode,
    /** 是否为亮色模式 */
    isLight: (mode === "system" ? systemMode : mode) === "light",
    /** 是否为暗色模式 */
    isDark: (mode === "system" ? systemMode : mode) === "dark",
    /** 切换到指定模式 */
    setMode,
    /** 切换亮色/暗色模式 */
    toggleMode: () => {
      const currentMode = mode === "system" ? systemMode : mode;
      setMode(currentMode === "light" ? "dark" : "light");
    },
  };
}
