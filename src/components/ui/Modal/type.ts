import type { ReactNode } from 'react';
import type React from 'react';
import type { ModalProps } from '@mui/material';

// ModalComponent Header
export interface ModalHeaderProps {
  onClose?: () => void;
  sx?: object;
  title?: string;
}

// ModalComponent Footer
export interface ModalFooterProps {
  onClose?: (type?: string) => void;
  sx?: object;
  onOk?: () => void;
  showOk?: boolean;
  okText?: string;
  isSubmitting?: boolean;
}

// ModalComponent Content
export interface ModalContentProps {
  sx?: object;
  children?: ReactNode;
}

// ModalComponent slotProps
export interface CustomizedModalSlotProps {
  header?: Partial<ModalHeaderProps>;
  footer?: Partial<ModalFooterProps>;
  content?: Partial<ModalContentProps>;
}

// ModalComponent 主组件 props
export interface CustomizedModalProps extends Omit<ModalProps, 'children' | 'onClose'> {
  open: boolean;
  onClose?: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown' | string) => void;
  title?: string;
  onOk?: () => void | Promise<void>;
  okText?: string;
  children?: ReactNode;
  footer?: ReactNode;
  showOk?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
  sx?: object;
  onOpen?: () => void;
  customSlotProps?: CustomizedModalSlotProps;
}

// modalInstance 相关类型
export interface ConfirmContentProps {
  content: ReactNode;
  mode?: 'light' | 'dark';
  icon?: ReactNode;
}

export interface ModalInstanceContentProps {
  content: ReactNode;
}

export interface ModalInstanceFooterProps {
  onOk?: () => void;
  onClose?: () => void;
  loading?: boolean;
  okText?: string;
  cancelText?: string;
  mode?: 'light' | 'dark';
  sx?: object;
}

export interface ModalInstanceProps {
  content: ReactNode;
  onOk?: () => void | Promise<void>;
  mode?: 'light' | 'dark';
  type?: 'confirm' | 'success' | string;
  icon?: ReactNode;
  okText?: string;
  cancelText?: string;
  footerProps?: Partial<ModalInstanceFooterProps>;
  confirmContentProps?: Partial<ConfirmContentProps>;
  sx?: object;
  className?: string;
}

// Modal 组件的完整类型定义
export type ModalType = React.FC<CustomizedModalProps> & {
  confirm: (params: ModalInstanceProps) => void;
  success: (params: ModalInstanceProps) => void;
};
