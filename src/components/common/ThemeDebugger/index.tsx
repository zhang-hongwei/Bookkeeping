"use client";

import { useColorScheme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";

/**
 * 主题调试组件
 * 显示当前的颜色模式和主题配置信息
 */
export default function ThemeDebugger() {
  const { mode, systemMode } = useColorScheme();
  const theme = useTheme();

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 9999,
        fontFamily: "monospace",
      }}
    >
      <div>
        <strong>Theme Debug Info:</strong>
      </div>
      <div>Mode: {mode || "undefined"}</div>
      <div>System Mode: {systemMode || "undefined"}</div>
      <div>
        Palette Mode: {theme.palette.mode}
      </div>
      <div>
        Text Primary:{" "}
        <span style={{ color: theme.palette.text.primary }}>
          {theme.palette.text.primary}
        </span>
      </div>
      <div>
        Background Default:{" "}
        <span
          style={{
            background: theme.palette.background.default,
            padding: "2px 4px",
          }}
        >
          {theme.palette.background.default}
        </span>
      </div>
    </div>
  );
}
