import { SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'ripple';
export type LoadingSize = 'small' | 'medium' | 'large' | number;
export type LoadingPosition = 'center' | 'top' | 'bottom';
export type BackgroundMode = 'overlay' | 'transparent' | 'blur' | 'none';

export interface LoadingPropsType {
    /** 是否显示加载状态 */
    loading: boolean;
    /** 子组件 */
    children?: ReactNode;
    /** 加载动画类型 */
    variant?: LoadingVariant;
    /** 加载器大小 */
    size?: LoadingSize;
    /** 加载器颜色 */
    color?: string;
    /** 加载文本 */
    text?: string;
    /** 文本位置 */
    textPosition?: 'bottom' | 'top' | 'right' | 'left';
    /** 加载器位置 */
    position?: LoadingPosition;
    /** 背景模式 */
    backgroundMode?: BackgroundMode;
    /** 是否全屏加载 */
    fullscreen?: boolean;
    /** 最小高度 */
    minHeight?: number | string;
    /** 延迟显示时间(ms) */
    delay?: number;
    /** 自定义样式 */
    sx?: SxProps<Theme>;
    /** 加载器容器样式 */
    loaderSx?: SxProps<Theme>;
    /** 背景样式 */
    backgroundSx?: SxProps<Theme>;
    /** 自定义加载器组件 */
    customLoader?: ReactNode;
}