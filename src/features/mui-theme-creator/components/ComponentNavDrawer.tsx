import React from "react";
import { styled } from "@mui/material/styles";
import componentSamples from "@/features/mui-theme-creator/components/MuiComponentSamples/Samples";
import {
  Drawer,
  List,
  ListSubheader,
  ListItemButton,
  ListItemText,
  Link,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  useThemeCreatorStore,
  useThemeCreatorActions,
} from "@/store/mui-theme-creator";

const drawerWidth: React.CSSProperties["width"] = 200;

const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
  },
});

const StyledList = styled(List)(({ theme }) => ({
  // gives background to the sticky header
  backgroundColor: theme.palette.background.paper,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
}));

// 为 ListSubheader 添加可点击样式
const ClickableListSubheader = styled(ListSubheader)(({ theme }) => ({
  cursor: "pointer",
  transition: theme.transitions.create(["background-color", "color"], {
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.active": {
    color: theme.palette.primary.main,
    fontWeight: "bold",
    backgroundColor: theme.palette.action.selected,
  },
}));

export const componentNavDrawerId = "component-nav-drawer";

const ComponentNavDrawer = () => {
  const theme = useTheme();
  const permanent = useMediaQuery(theme.breakpoints.up("md"));
  const open = useThemeCreatorStore((state) => state.componentNavOpen);
  const activeTab = useThemeCreatorStore((state) => state.activeTab);
  const selectedComponentId = useThemeCreatorStore((state) => state.selectedComponentId);

  const { toggleComponentNav, setActiveTab, setSelectedComponentId } = useThemeCreatorActions();

  // 处理 Create Component 点击
  const handleCreateComponentClick = React.useCallback(() => {
    setActiveTab("create");
    if (!permanent) {
      toggleComponentNav();
    }
  }, [setActiveTab, toggleComponentNav, permanent]);

  // 处理 Pages 点击
  const handlePagesClick = React.useCallback(() => {
    setActiveTab("pages");
    if (!permanent) {
      toggleComponentNav();
    }
  }, [setActiveTab, toggleComponentNav, permanent]);

  const handleClick = React.useCallback(() => {
    setActiveTab("components");
    setSelectedComponentId(null); // 清除选中的组件ID，显示所有组件
    if (!permanent) {
      toggleComponentNav();
    }
  }, [setActiveTab, setSelectedComponentId, toggleComponentNav, permanent]);

  // 处理 All Components 点击
  const handleAllComponentsClick = React.useCallback(() => {
    setActiveTab("all-components");
    setSelectedComponentId(null); // 清除选中的组件ID
    if (!permanent) {
      toggleComponentNav();
    }
  }, [setActiveTab, setSelectedComponentId, toggleComponentNav, permanent]);

  // 处理具体组件点击
  const handleComponentClick = React.useCallback((componentId: string) => {
    setActiveTab("components");
    setSelectedComponentId(componentId);
    if (!permanent) {
      toggleComponentNav();
    }
  }, [setActiveTab, setSelectedComponentId, toggleComponentNav, permanent]);

  // 处理 Saved Themes 点击
  const handleSavedThemesClick = React.useCallback(() => {
    setActiveTab("saved");
    if (!permanent) {
      toggleComponentNav();
    }
  }, [setActiveTab, toggleComponentNav, permanent]);

  const NavLink = React.forwardRef<HTMLAnchorElement, any>((linkProps, ref) => {
    // Filter out props that shouldn't be passed to DOM
    const { button, dense, ...otherProps } = linkProps;
    return <Link ref={ref} {...otherProps} color="textPrimary" />;
  });
  NavLink.displayName = "NavLink";

  return (
    <StyledDrawer
      id={componentNavDrawerId}
      variant={permanent ? "permanent" : "temporary"}
      open={open}
      anchor="left"
      onClose={() => toggleComponentNav()}
    >
      <StyledList dense>
        {/* // 点击显示创建组件的页面 */}
        <ClickableListSubheader
          onClick={handleCreateComponentClick}
          className={activeTab === "create" ? "active" : ""}
        >
          Create Component
        </ClickableListSubheader>
      </StyledList>

      <StyledList dense>
        {/* pages， 预览模版  点击显示对应的 preview页面  */}
        <ClickableListSubheader
          onClick={handlePagesClick}
          className={activeTab === "pages" ? "active" : ""}
        >
          Pages
        </ClickableListSubheader>
      </StyledList>

      <StyledList dense>
        {/* components  */}
        <ClickableListSubheader
          onClick={handleClick}
          className={activeTab === "components" ? "active" : ""}
        >
          Components
        </ClickableListSubheader>
        <ListItemButton
          onClick={handleAllComponentsClick}
          sx={{
            backgroundColor: activeTab === "all-components" ?
              theme.palette.action.selected : "transparent",
            color: activeTab === "all-components" ?
              theme.palette.primary.main : "inherit",
            fontWeight: activeTab === "all-components" ? "bold" : "normal",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <StyledListItemText
            primary="All Components"
            slotProps={{
              primary: {
                variant: "body2",
              },
            }}
          />
        </ListItemButton>
        {componentSamples.map(({ id, title }) => (
          <ListItemButton
            key={id}
            onClick={() => handleComponentClick(id)}
            sx={{
              backgroundColor: activeTab === "components" && selectedComponentId === id ?
                theme.palette.action.selected : "transparent",
              color: activeTab === "components" && selectedComponentId === id ?
                theme.palette.primary.main : "inherit",
              fontWeight: activeTab === "components" && selectedComponentId === id ? "bold" : "normal",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <StyledListItemText
              primary={title}
              slotProps={{
                primary: {
                  variant: "body2",
                },
              }}
            />
          </ListItemButton>
        ))}
      </StyledList>

      <StyledList dense>
        {/* Saved Themes  */}
        <ClickableListSubheader
          onClick={handleSavedThemesClick}
          className={activeTab === "saved" ? "active" : ""}
        >
          Saved Themes
        </ClickableListSubheader>
      </StyledList>
    </StyledDrawer>
  );
};

export default ComponentNavDrawer;
