import React, { useState } from "react"

import { styled } from "@mui/material/styles"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import PaletteTools from "./PaletteTools/PaletteTools"

import TypographyTools from "./TypographyTools/TypographyTools"

import PaletteIcon from "@mui/icons-material/Palette"
import FontIcon from "@mui/icons-material/FontDownload"
import TypographyIcon from "@mui/icons-material/TextFields"
import SnippetsIcon from "@mui/icons-material/PlaylistAdd"
import ToolPanel from "./ToolPanel"
import FontTools from "./FontTools/FontTools"
import SnippetTools from "./SnippetTools"

const ThemeToolsRoot = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "auto",
})

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.divider}`,
  width: "calc(100% - 1px)", // to prevent scroll bar
  // MUI v7 优化：使用新的过渡效果
  transition: theme.transitions.create(["border-color", "background-color"], {
    duration: theme.transitions.duration.shorter,
  }),
  // 添加微妙的阴影效果
  boxShadow: theme.shadows[1],
}))

const StyledBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({
  // 优化：改进文本和图标的颜色过渡
  "& .MuiBottomNavigationAction-label, & .MuiSvgIcon-root": {
    color: theme.palette.text.disabled,
    transition: theme.transitions.create("color", {
      duration: theme.transitions.duration.shorter,
    }),
  },
  "&.Mui-selected": {
    // 使用主题色彩而不是硬编码颜色
    backgroundColor: theme.palette.primary.main,
    transition: theme.transitions.create(["background-color", "transform"], {
      duration: theme.transitions.duration.shorter,
    }),
    // 添加微妙的缩放效果
    transform: "scale(1.02)",
    "& .MuiBottomNavigationAction-label, & .MuiSvgIcon-root": {
      color: theme.palette.primary.contrastText,
      fontWeight: theme.typography.fontWeightMedium,
    },
    // 悬停效果
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      transform: "scale(1.05)",
    },
  },
  // 悬停效果（非选中状态）
  "&:hover:not(.Mui-selected)": {
    backgroundColor: theme.palette.action.hover,
    "& .MuiBottomNavigationAction-label, & .MuiSvgIcon-root": {
      color: theme.palette.text.primary,
    },
  },
}))

export const paletteToolsId = "palette-tools-nav"
export const fontToolsId = "font-tools-nav"
export const typographyToolsId = "typography-tools-nav"
export const snippetToolsId = "snippet-tools-nav"

const toolPanels: Array<{
  label: string
  icon: React.ReactNode
  tools: any
  id: string
}> = [
  {
    label: "Palette",
    icon: <PaletteIcon />,
    tools: PaletteTools,
    id: paletteToolsId,
  },
  {
    label: "Fonts",
    icon: <FontIcon />,
    tools: FontTools,
    id: fontToolsId,
  },
  {
    label: "Typography",
    icon: <TypographyIcon />,
    tools: TypographyTools,
    id: typographyToolsId,
  },
  {
    label: "Snippets",
    icon: <SnippetsIcon />,
    tools: SnippetTools,
    id: snippetToolsId,
  },
]

export default function ThemeTools() {
  const [bottomNavIndex, setBottomNavIndex] = useState(0)

  const currentTool = toolPanels[bottomNavIndex]

  return (
    <ThemeToolsRoot>
      <ToolPanel panelTitle={currentTool.label}>
        <currentTool.tools />
      </ToolPanel>

      <StyledBottomNavigation
        value={bottomNavIndex}
        showLabels
        onChange={(event, newValue) => setBottomNavIndex(newValue)}
      >
        {toolPanels.map((panel, index) => (
          <StyledBottomNavigationAction
            key={`${index}-${panel.label}`}
            id={panel.id}
            label={panel.label}
            value={index}
            icon={panel.icon}
          />
        ))}
      </StyledBottomNavigation>
    </ThemeToolsRoot>
  )
}
