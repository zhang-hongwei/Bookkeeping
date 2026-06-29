'use client';

import { useRef, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
} from '@mui/material';
import DemoSection from '@/app/components/demos/DemoSection';
import DemoNavigation from '@/app/components/demos/DemoNavigation';

interface DemoMeta {
  title: string;
  description: string;
}

interface ComponentDemoProps {
  componentId: string;
}

/**
 * Component Demo 组件
 * 使用堆叠布局显示多个演示，右侧导航支持快速跳转
 */
const ComponentDemo = ({ componentId }: ComponentDemoProps) => {
  // 尝试加载多演示模式
  let demoModule: any;
  let isMultiDemo = false;

  try {
    // 动态导入组件目录的 index
    // 使用映射表处理命名差异
    const componentDirMap: Record<string, string> = {
      // 原有组件
      'autocomplete': 'autocomplete',
      'buttons': 'buttons',
      'textfield': 'text-fields',
      'checkbox': 'checkboxes',
      'radio-button': 'radio-buttons',
      'tabs': 'tabs',
      'stepper': 'steppers',
      'breadcrumbs': 'breadcrumbs',
      'drawer': 'drawers',
      'menu': 'menus',
      'dialog': 'dialogs',
      'snackbar': 'snackbars',
      'progress': 'progress',
      'alert': 'alert',
      'tooltip': 'tooltips',
      'table': 'table',
      'list': 'lists',
      'chip': 'chips',
      'avatar': 'avatars',
      'badge': 'badges',
      'slider': 'slider',
      'rating': 'rating',
      'pagination': 'pagination',
      'popover': 'popover',
      'accordion': 'accordion',
      'transfer-list': 'transfer-list',

      // 新增高优先级组件
      'select': 'selects',
      'switch': 'switches',
      'card': 'cards',
      'app-bar': 'app-bar',
      'grid': 'grid',
      'stack': 'stack',
      'box': 'box',
      'paper': 'paper',
      'container': 'container',
      'divider': 'dividers',

      // 新增中优先级组件
      'skeleton': 'skeleton',
      'button-group': 'button-group',
      'toggle-button': 'toggle-button',
      'modal': 'modal',
      'backdrop': 'backdrop',
      'typography': 'typography',
      'link': 'links',
      'image-list': 'image-list',
      'floating-action-button': 'floating-action-button',

      // 新增导航组件
      'bottom-navigation': 'bottom-navigation',
      'speed-dial': 'speed-dial',

      // MUI X 组件
      'timeline': 'timeline',

      // MuiComponentSamples 组件映射
      'Accordion': 'accordion',
      'Appbar': 'app-bar',
      'Avatar': 'avatars',
      'Badge': 'badges',
      'BottomNavigation': 'bottom-navigation',
      'Buttons': 'buttons',
      'Card': 'cards',
      'Checkboxes': 'checkboxes',
      'Chip': 'chips',
      'Dialog': 'dialogs',
      'FloatingActionButton': 'floating-action-button',
      'Icon': 'icons', // 如果有 icons 目录
      'List': 'lists',
      'Menu': 'menus',
      'Progress': 'progress',
      'Radio': 'radio-buttons',
      'Select': 'selects',
      'Slider': 'slider',
      'Snackbar': 'snackbars',
      'Stepper': 'steppers',
      'Switch': 'switches',
      'Table': 'table',
      'Tabs': 'tabs',
      'TextField': 'text-fields',
      'Tooltip': 'tooltips',
      'Typography': 'typography',
    };

    const demoDir = componentDirMap[componentId];
    if (demoDir) {
      demoModule = require(`@/app/components/demos/mui/${demoDir}`);
      isMultiDemo = true;
    } else {
      isMultiDemo = false;
    }
  } catch (e) {
    console.error('Failed to load demo module:', e);
    isMultiDemo = false;
  }

  // 多演示模式 - 堆叠布局
  if (isMultiDemo && demoModule) {
    const { demoMeta } = demoModule;
    const demoKeys = Object.keys(demoMeta);

    // 准备导航数据
    const navItems = demoKeys.map((key) => ({
      id: `demo-${key}`,
      title: demoMeta[key].title,
    }));

    return (
      <Box sx={{ maxWidth: '1000px', mr: '320px' }}>
        {/* 演示内容区域（堆叠显示） */}
        {demoKeys.map((key) => {
          const DemoComponent = demoModule[key];
          return (
            <DemoSection
              key={key}
              id={`demo-${key}`}
              title={demoMeta[key].title}
              description={demoMeta[key].description}
            >
              {DemoComponent && <DemoComponent />}
            </DemoSection>
          );
        })}

        {/* 固定在视口右侧的导航 */}
        <DemoNavigation items={navItems} />
      </Box>
    );
  }

  // 单演示模式（旧组件的回退）
  try {
    const { componentDemos } = require('@/app/components/demos/index');
    const DemoComponent = componentDemos[componentId as keyof typeof componentDemos];

    if (DemoComponent) {
      return <DemoComponent />;
    }
  } catch (e) {
    console.error('Failed to load single demo:', e);
  }

  // 默认回退
  return (
    <Paper
      sx={{
        p: 6,
        borderRadius: 2,
        border: `1px solid`,
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" color="text.secondary">
        Demo for this component is coming soon...
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
        Component ID: {componentId}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
        Please check back later or refer to the official MUI documentation.
      </Typography>
    </Paper>
  );
};

export default ComponentDemo;