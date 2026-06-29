// ============================================
// 对外暴露的主组件类型
// ============================================

export interface PopoverPropsType {
  onOpenChange?: (params: any) => void;
  open?: boolean;
  content: React.ReactNode;
  children: React.ReactNode;
  trigger?: string;
  borderRadius?: number | string; // 支持数字或字符串类型
  placement?: string;
  boxShadow?: string;
}

// ============================================
// 内部组件类型
// ============================================

export interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  trigger?: string;
}

export interface PopoverOptions {
  initialOpen?: boolean;
  placement?: Placement;
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: string;
}
