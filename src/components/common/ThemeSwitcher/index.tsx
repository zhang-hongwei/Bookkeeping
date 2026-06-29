"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";

/**
 * 主题切换器组件 - 用于测试和切换颜色模式
 */
export function ThemeSwitcher() {
  const { mode, setMode, systemMode } = useColorScheme();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // 避免服务端渲染不匹配
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        background: theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" gutterBottom>
        🎨 主题模式切换器
      </Typography>

      {/* 当前状态 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>当前模式:</strong> {mode || "加载中..."}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>系统模式:</strong> {systemMode || "未检测到"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>调色板模式:</strong> {theme.palette.mode}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>文本颜色:</strong>{" "}
          <span style={{ color: theme.palette.text.primary }}>
            {theme.palette.text.primary}
          </span>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>背景颜色:</strong>{" "}
          <span
            style={{
              background: theme.palette.background.default,
              padding: "2px 8px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          >
            {theme.palette.background.default}
          </span>
        </Typography>
      </Box>

      {/* 切换按钮 */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          variant={mode === "light" ? "contained" : "outlined"}

          onClick={() => setMode("light")}
          startIcon="☀️"
        >
          亮色模式
        </Button>

        <Button
          variant={mode === "dark" ? "contained" : "outlined"}

          onClick={() => setMode("dark")}
          startIcon="🌙"
        >
          暗色模式
        </Button>

        <Button
          variant={mode === "system" ? "contained" : "outlined"}

          onClick={() => setMode("system")}
          startIcon="💻"
        >
          跟随系统
        </Button>
      </Box>

      {/* 说明文本 */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          background: theme.palette.action.hover,
          borderRadius: 1,
        }}
      >
        <Typography variant="caption" display="block" gutterBottom>
          💡 <strong>提示:</strong>
        </Typography>
        <Typography variant="caption" display="block">
          • 点击按钮切换主题模式
        </Typography>
        <Typography variant="caption" display="block">
          • "跟随系统" 会根据操作系统的主题设置自动切换
        </Typography>
        <Typography variant="caption" display="block">
          • 如果调色板模式与选择的模式不匹配，说明主题配置有问题
        </Typography>
      </Box>
    </Paper>
  );
}

export default ThemeSwitcher;
