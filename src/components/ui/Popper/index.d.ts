import type { PopperPlacementType } from "@mui/material/Popper";

// ============================================
// 对外暴露的主组件类型
// ============================================

export interface PopperPropsType {
  /** 是否打开 */
  open: boolean;
  /** 打开/关闭回调 */
  onClose?: () => void;
  /** 内容区域 */
  content: React.ReactNode;
  /** 触发器（子元素） */
  children: React.ReactNode;
  /** 位置 */
  placement?: PopperPlacementType;
  /** 是否禁用 Portal */
  disablePortal?: boolean;
  /** 是否启用过渡动画 */
  transition?: boolean;
  /** 偏移量 [horizontal, vertical] */
  offset?: [number, number];
  /** Popper modifiers */
  modifiers?: Array<{
    name: string;
    options?: any;
  }>;
  /** Transition 组件 */
  TransitionComponent?: React.ComponentType<any>;
  /** 过渡持续时间 */
  transitionDuration?: number;
  /** Paper elevation */
  elevation?: number;
  /** 自定义样式 */
  sx?: any;
}

// ============================================
// 内部组件类型
// ============================================

export interface PopperContentProps {
  children: React.ReactNode;
  transition?: boolean;
  disablePortal?: boolean;
  placement?: PopperPlacementType;
  offset?: [number, number];
  modifiers?: Array<{
    name: string;
    options?: any;
  }>;
  TransitionComponent?: React.ComponentType<any>;
  transitionDuration?: number;
  elevation?: number;
  sx?: any;
}
