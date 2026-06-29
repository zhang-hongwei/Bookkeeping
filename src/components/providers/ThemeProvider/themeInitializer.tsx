"use client";

import { useEffect } from "react";
import { useColorScheme } from "@mui/material/styles";

/**
 * ThemeInitializer - 强制初始化主题模式为 light
 *
 * 这个组件会在客户端挂载时检查当前主题模式，
 * 如果没有用户保存的偏好设置，则强制设置为 light 模式
 */
export function ThemeInitializer() {
  const { mode, setMode } = useColorScheme();

  useEffect(() => {
    // 检查 localStorage 是否有用户保存的模式
    const savedMode = localStorage.getItem("mui-mode");

    // 如果没有保存的模式，且当前不是 light 模式，则强制设置为 light
    if (!savedMode && mode !== "light") {
      console.log("[ThemeInitializer] No saved mode found, forcing light mode");
      setMode("light");
    }
  }, [mode, setMode]);

  return null;
}
