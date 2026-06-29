import React from "react"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"

// 优化：使用主题颜色和现代设计
const StyledToolPanel = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  flexGrow: 1,
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  // MUI v7 优化：添加微妙的阴影和边框
  boxShadow: theme.shadows[1],
  borderRight: `1px solid ${theme.palette.divider}`,
}))

const StyledToolPanelTitle = styled("div")(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  // 使用主题背景色
  backgroundColor: theme.palette.grey[50],
  // MUI v7 优化：添加微妙的阴影效果
  boxShadow: `inset 0 -1px 0 ${theme.palette.divider}`,
  // 改进文字样式
  position: "sticky",
  top: 0,
  zIndex: 1,
}))

const StyledToolPanelContent = styled("div")(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  // MUI v7 优化：添加平滑滚动
  scrollBehavior: "smooth",
  // 添加内边距
  padding: theme.spacing(2),
  // 优化滚动条样式
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.action.hover,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.action.disabled,
    borderRadius: 3,
    "&:hover": {
      backgroundColor: theme.palette.action.active,
    },
  },
}))

export const toolPanelId = "theme-tool-panel"

interface ToolPanelProps {
  panelTitle: string
  children: React.ReactNode
}

// 优化：使用 React.memo 包装组件
const ToolPanel = React.memo(function ToolPanel({ panelTitle, children }: ToolPanelProps) {
  return (
    <StyledToolPanel id={toolPanelId}>
      <StyledToolPanelTitle>
        <Typography
          variant="overline"
          // MUI v7 优化：改进文字样式
          sx={{
            fontWeight: (theme) => theme.typography.fontWeightMedium,
            color: (theme) => theme.palette.text.primary,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {panelTitle}
        </Typography>
      </StyledToolPanelTitle>
      <StyledToolPanelContent>{children}</StyledToolPanelContent>
    </StyledToolPanel>
  )
})

export default ToolPanel
