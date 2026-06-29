/**
 * Grid Layout Editor - 类型定义
 */

/**
 * Grid 断点尺寸配置
 */
export interface GridSize {
  /** 超小屏 (<600px) */
  xs: number;
  /** 小屏 (≥600px) */
  sm: number;
  /** 中屏 (≥900px) */
  md: number;
  /** 大屏 (≥1200px) */
  lg: number;
}

/**
 * Grid 节点类型
 */
export type GridNodeType = 'container' | 'item';

/**
 * Grid 节点基础属性
 */
export interface GridNodeBase {
  /** 唯一标识 */
  id: string;
  /** 节点类型 */
  type: GridNodeType;
  /** 显示标签 */
  label: string;
  /** 各断点的列跨度 */
  size: GridSize;
  /** 排序顺序 */
  order: number;
}

/**
 * Grid 容器节点（可包含子节点）
 */
export interface GridContainer extends GridNodeBase {
  type: 'container';
  /** 子节点列表 */
  children: GridNode[];
  /** 容器配置 */
  containerConfig: GridContainerConfig;
}

/**
 * Grid 项目节点（叶子节点）
 */
export interface GridItem extends GridNodeBase {
  type: 'item';
  /** 背景颜色 */
  bgcolor: string;
}

/**
 * Grid 节点（容器或项目）
 */
export type GridNode = GridContainer | GridItem;

/**
 * Grid 容器配置
 */
export interface GridContainerConfig {
  /** 列数（概念上的，用于计算） */
  columns: number;
  /** 间距 (0-10) */
  spacing: number;
  /** flex-direction */
  direction: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** flex-wrap */
  wrap: 'wrap' | 'nowrap' | 'wrap-reverse';
  /** align-items */
  alignItems: 'stretch' | 'center' | 'flex-start' | 'flex-end' | 'baseline';
  /** justify-content */
  justifyContent:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
}

/**
 * 导出格式类型
 */
export type ExportFormat = 'jsx' | 'typescript';
