import type { Theme, SxProps, Breakpoint } from "@mui/material/styles";
import type { NavItem } from "../nav-config";

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export type NavDesktopProps = NavContentProps & {
  layoutQuery?: Breakpoint;
};

export type NavItemComponentProps = {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  isChildActive: boolean;
  onToggleExpand: (path: string) => void;
};

export type NavItemChildProps = {
  item: NavItem;
  isActive: boolean;
};
