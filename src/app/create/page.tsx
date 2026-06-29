"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useRouter } from "next/navigation";

// 导入主题创建器组件
import { MuiThemeCreator } from "@/features/mui-theme-creator/components/MuiThemeCreator";

const PageContainer = styled(Stack)({
  height: "100vh",
  overflow: "hidden",
});

const EditorContainer = styled(Box)({
  flexGrow: 1,
  overflow: "hidden",
  position: "relative",
});

export default function ThemeCreatePage() {
  return (
    <PageContainer>
      {/* Editor */}
      <EditorContainer>
        <MuiThemeCreator />
      </EditorContainer>
    </PageContainer>
  );
}
