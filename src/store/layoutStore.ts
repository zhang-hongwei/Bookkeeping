import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutMode = 'integrate' | 'apparent';

export interface LayoutState {
    // 显示模式
    compact: boolean;
    rtl: boolean;
    contrast: boolean;

    // 颜色主题
    layoutMode: LayoutMode;
    colorMode: LayoutMode;

    // 字体设置
    fontSize: number;

    // Actions
    setCompact: (value: boolean) => void;
    setRtl: (value: boolean) => void;
    setContrast: (value: boolean) => void;
    setLayoutMode: (value: LayoutMode) => void;
    setColorMode: (value: LayoutMode) => void;
    setFontSize: (value: number) => void;

    // 重置所有设置
    resetLayout: () => void;
}

const initialState = {
    compact: false,
    rtl: false,
    contrast: false,
    layoutMode: 'integrate' as LayoutMode,
    colorMode: 'integrate' as LayoutMode,
    fontSize: 15,
};

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            ...initialState,

            setCompact: (value: boolean) => set({ compact: value }),
            setRtl: (value: boolean) => set({ rtl: value }),
            setContrast: (value: boolean) => set({ contrast: value }),
            setLayoutMode: (value: LayoutMode) => set({ layoutMode: value }),
            setColorMode: (value: LayoutMode) => set({ colorMode: value }),
            setFontSize: (value: number) => set({ fontSize: value }),

            resetLayout: () => set(initialState),
        }),
        {
            name: 'layout-store', // localStorage 中的键名
            version: 1,
        }
    )
);
