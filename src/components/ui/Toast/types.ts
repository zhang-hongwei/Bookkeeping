/**
 * Toast 组件类型定义
 * 统一导出所有 Toast 相关的 TypeScript 类型
 */

import type { ToasterProps, ExternalToast } from 'sonner';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'custom';
export type ToastOptions = ExternalToast;
export type ToastInstance = string | number;

export interface ToastConfig extends ToasterProps {
    defaultToastOptions?: ToastOptions;
}

export type CustomToastRenderer = (toastId: string | number) => React.ReactElement;

export interface PromiseToastMessages<T = any> {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: any) => string);
}
