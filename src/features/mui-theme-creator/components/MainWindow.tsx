import React from "react";
import { styled } from "@mui/material/styles";
import ThemeWrapper from "@/features/mui-theme-creator/components/ThemeWrapper";
import {
  Box,
  AppBar,
  IconButton,
} from "@mui/material";
import MuiComponentSamples from "@/features/mui-theme-creator/components/MuiComponentSamples";
import ComponentDemo from "@/features/mui-theme-creator/components/ComponentDemo";
import PreviewWindow from "@/features/mui-theme-creator/components/PreviewWindow";
import SavedThemes from "@/features/mui-theme-creator/components/SavedThemes/SavedThemes";
import CreateComponent from "@/features/mui-theme-creator/components/CreateComponent";
import {
  useThemeCreatorStore,
  useThemeCreatorActions,
} from "@/store/mui-theme-creator";
import MaterialUiIcon from "mdi-material-ui/MaterialUi";
import BrushIcon from "@mui/icons-material/Brush";

const MainWindowContainer = styled(Box)(({ theme }) => ({
  overflowY: "auto",
  height: "100%",
  // MUI v7 优化：添加平滑滚动
  scrollBehavior: "smooth",
  // 添加微妙的背景渐变
  background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  justifyContent: "space-between",
  flexDirection: "row",
  // MUI v7 优化：添加微妙的阴影和过渡效果
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(["box-shadow", "background-color"], {
    duration: theme.transitions.duration.shorter,
  }),
  // 改进响应式设计
  padding: theme.spacing(0, 1),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(0, 2),
  },
}));

const ComponentsTabRoot = styled(Box)(({ theme }) => ({
  // 使用主题颜色而不是硬编码白色
  backgroundColor: theme.palette.background.paper,
  // 添加微妙的内边距和圆角
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(1),
  // MUI v7 优化：添加卡片阴影效果
  boxShadow: theme.shadows[1],
  minHeight: "calc(100vh - 200px)", // 确保有足够的高度
}));

export const previewTabId = "preview-tab";
export const componentsTabId = "components-tab";
export const savedThemesTabId = "saved-themes-tab";

interface MainWindowProps {}

const MainWindow: React.FC<MainWindowProps> = () => {
  const activeTab = useThemeCreatorStore((state) => state.activeTab);
  const selectedComponentId = useThemeCreatorStore(
    (state) => state.selectedComponentId
  );
  const { toggleComponentNav, toggleThemeConfig } = useThemeCreatorActions();

  return (
    <>
      <StyledAppBar position="sticky" color="default">
        <IconButton
          sx={{
            display: { xs: "flex", lg: "none" },
            // MUI v7 优化：添加悬停效果
            transition: (theme) =>
              theme.transitions.create(["background-color", "transform"], {
                duration: theme.transitions.duration.shorter,
              }),
            "&:hover": {
              transform: "scale(1.1)",
              backgroundColor: (theme) => theme.palette.action.hover,
            },
          }}
          onClick={() => toggleComponentNav()}
        >
          <MaterialUiIcon />
        </IconButton>

        <IconButton
          sx={{
            display: { xs: "flex", sm: "none" },
            // MUI v7 优化：添加悬停效果
            transition: (theme) =>
              theme.transitions.create(["background-color", "transform"], {
                duration: theme.transitions.duration.shorter,
              }),
            "&:hover": {
              transform: "scale(1.1)",
              backgroundColor: (theme) => theme.palette.action.hover,
            },
          }}
          onClick={() => toggleThemeConfig()}
        >
          <BrushIcon />
        </IconButton>
      </StyledAppBar>
      <MainWindowContainer>
        {/* Create Component 视图 */}
        {activeTab === "create" && <CreateComponent />}

        {/* Pages 预览模板视图 */}
        {activeTab === "pages" && <PreviewWindow />}

        {/* Components 组件列表视图 */}
        {activeTab === "all-components" && (
          <ComponentsTabRoot>
            <ThemeWrapper>
              {/* // 全部组件展示 */}
              <MuiComponentSamples />
            </ThemeWrapper>
          </ComponentsTabRoot>
        )}

        {/* Components 组件展示视图 */}
        {activeTab === "components" && (
          <ComponentsTabRoot>
            <ThemeWrapper>
              {selectedComponentId ? (
                <ComponentDemo componentId={selectedComponentId} />
              ) : (
                <MuiComponentSamples />
              )}
            </ThemeWrapper>
          </ComponentsTabRoot>
        )}

        {/* Saved Themes 保存的主题视图 */}
        {activeTab === "saved" && <SavedThemes />}
      </MainWindowContainer>
    </>
  );
};

export default MainWindow;
