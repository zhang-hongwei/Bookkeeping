"use client";

import type { ReactNode } from "react";
import {
  PaletteOutlined,
  Contrast,
  AutoAwesomeOutlined,
  ImageOutlined,
  Gradient,
  TextFieldsOutlined,
  BorderColorOutlined,
  LayersOutlined,
  LensBlurOutlined,
  BoltOutlined,
  CropOriginal,
  PatternOutlined,
  TuneOutlined,
  RoundedCorner,
  GridViewOutlined,
  ViewQuilt,
  DevicesOutlined,
  StraightenOutlined,
  SmartButton,
  ToggleOn,
  TextFields,
  Tab,
  ChatOutlined,
} from "@mui/icons-material";

/** A single design tool shown in the tools showcase grid. */
export type ShowcaseTool = {
  title: string;
  path: string;
  desc: string;
  icon: ReactNode;
};

/** A category grouping several design tools. */
export type ToolCategory = {
  key: string;
  label: string;
  icon: ReactNode;
  tools: ShowcaseTool[];
};

/**
 * Curated design-tool showcase, grouped by domain.
 * Paths map to the existing (tools) routes (route groups are URL-transparent).
 */
export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    key: "ai",
    label: "AI 助手",
    icon: <ChatOutlined />,
    tools: [
      {
        title: "沌联 Chat",
        path: "/chat",
        desc: "多模式 AI 对话，配色 / 设计随问随答",
        icon: <ChatOutlined />,
      },
    ],
  },
  {
    key: "color",
    label: "配色系统",
    icon: <PaletteOutlined />,
    tools: [
      {
        title: "Colors",
        path: "/colors",
        desc: "从文字描述生成完整调色板",
        icon: <PaletteOutlined />,
      },
      {
        title: "Contrast",
        path: "/contrast",
        desc: "WCAG 色彩对比度检测",
        icon: <Contrast />,
      },
      {
        title: "Color Harmonies",
        path: "/color-harmonies",
        desc: "生成和谐的配色方案",
        icon: <PaletteOutlined />,
      },
      {
        title: "Image Extract",
        path: "/image-extract",
        desc: "从图片提取配色与设计 token",
        icon: <ImageOutlined />,
      },
      {
        title: "Emotional Palette",
        path: "/emotional-palette",
        desc: "由情绪关键词生成氛围",
        icon: <AutoAwesomeOutlined />,
      },
    ],
  },
  {
    key: "gradient",
    label: "渐变",
    icon: <Gradient />,
    tools: [
      {
        title: "Gradients",
        path: "/gradients",
        desc: "AI 文本生成渐变",
        icon: <Gradient />,
      },
      {
        title: "Gradient Editor",
        path: "/gradientEditor",
        desc: "可视化 CSS 渐变编辑器",
        icon: <Gradient />,
      },
      {
        title: "Gradient Collection",
        path: "/gradient-collection",
        desc: "精选渐变合集",
        icon: <Gradient />,
      },
      {
        title: "Gradient Text",
        path: "/gradient-text",
        desc: "渐变文字效果生成",
        icon: <TextFieldsOutlined />,
      },
      {
        title: "Gradient Border",
        path: "/gradient-border",
        desc: "可视化渐变边框编辑器",
        icon: <BorderColorOutlined />,
      },
    ],
  },
  {
    key: "effect",
    label: "视觉效果",
    icon: <LensBlurOutlined />,
    tools: [
      {
        title: "Box Shadow",
        path: "/boxShadow",
        desc: "生成与定制 CSS 阴影",
        icon: <LayersOutlined />,
      },
      {
        title: "Glass Effect",
        path: "/glassmorphism",
        desc: "玻璃拟态 / 拟物风生成器",
        icon: <LensBlurOutlined />,
      },
      {
        title: "Border Beam",
        path: "/border-beam",
        desc: "边框光束动画生成器",
        icon: <BoltOutlined />,
      },
      {
        title: "Clip Path",
        path: "/clipPath",
        desc: "可拖拽 clip-path 生成器",
        icon: <CropOriginal />,
      },
      {
        title: "Patterns",
        path: "/patterns",
        desc: "SVG 背景图案生成",
        icon: <PatternOutlined />,
      },
      {
        title: "Filters",
        path: "/filter",
        desc: "CSS 滤镜效果生成器",
        icon: <TuneOutlined />,
      },
      {
        title: "Border Radius",
        path: "/borderRadius",
        desc: "可视化圆角编辑器",
        icon: <RoundedCorner />,
      },
    ],
  },
  {
    key: "layout",
    label: "布局",
    icon: <GridViewOutlined />,
    tools: [
      {
        title: "Grid",
        path: "/grid",
        desc: "CSS Grid 布局编辑器",
        icon: <GridViewOutlined />,
      },
      {
        title: "Flexbox",
        path: "/flexbox",
        desc: "Flexbox 布局演练场",
        icon: <ViewQuilt />,
      },
      {
        title: "Breakpoints",
        path: "/breakpoints",
        desc: "响应式断点可视化",
        icon: <DevicesOutlined />,
      },
      {
        title: "Spacing Scale",
        path: "/spacing-scale",
        desc: "按比例生成间距体系",
        icon: <StraightenOutlined />,
      },
    ],
  },
  {
    key: "mui",
    label: "MUI 主题设计器",
    icon: <SmartButton />,
    tools: [
      {
        title: "MUI Button",
        path: "/muiButton",
        desc: "Button 组件主题设计器",
        icon: <SmartButton />,
      },
      {
        title: "MUI Switch",
        path: "/muiSwitch",
        desc: "Switch 组件主题设计器",
        icon: <ToggleOn />,
      },
      {
        title: "MUI Tabs",
        path: "/muiTabs",
        desc: "Tabs 组件主题设计器",
        icon: <Tab />,
      },
      {
        title: "MUI TextField",
        path: "/muiTextField",
        desc: "TextField 组件主题设计器",
        icon: <TextFields />,
      },
    ],
  },
];
