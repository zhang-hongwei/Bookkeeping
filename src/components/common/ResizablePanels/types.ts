// 定义每个面板的配置类型
export interface PanelConfig {
    /** 面板的默认大小（百分比） */
    defaultSize?: number;
    /** 面板的最小大小（百分比） */
    minSize?: number;
    /** 面板的最大大小（百分比） */
    maxSize?: number;
}

// 定义 slotProps 的类型
export interface SlotProps {
    /** 左侧面板配置 */
    left?: PanelConfig;
    /** 中间面板配置 */
    center?: PanelConfig;
    /** 右侧面板配置 */
    right?: PanelConfig;
}

// 定义 ResizeablePanels 组件的 props 类型
export interface ResizeablePanelsProps {
    /** 左侧面板内容 */
    left: React.ReactNode;
    /** 右侧面板内容 */
    right: React.ReactNode;
    /** 中间面板内容 */
    center: React.ReactNode;
    /** 各面板的配置选项 */
    slotProps?: SlotProps;
} 