/**
 * 映射项目组件 ID 到 MUI 官方目录名
 * 用于从 MUI 官方仓库复制演示代码
 */
export const componentIdToMuiDir: Record<string, string> = {
  // 完全匹配的
  'accordion': 'accordion',
  'alert': 'alert',
  'autocomplete': 'autocomplete',
  'breadcrumbs': 'breadcrumbs',
  'buttons': 'buttons',
  'pagination': 'pagination',
  'popover': 'popover',
  'progress': 'progress',
  'rating': 'rating',
  'slider': 'slider',
  'table': 'table',
  'tabs': 'tabs',
  'transfer-list': 'transfer-list',
  'box': 'box',
  'container': 'container',
  'grid': 'grid',
  'modal': 'modal',
  'paper': 'paper',
  'stack': 'stack',
  'backdrop': 'backdrop',
  'skeleton': 'skeleton',
  'typography': 'typography',
  'bottom-navigation': 'bottom-navigation',
  'speed-dial': 'speed-dial',
  'timeline': 'timeline',

  // 需要复数的
  'avatar': 'avatars',
  'badge': 'badges',
  'checkbox': 'checkboxes',
  'chip': 'chips',
  'dialog': 'dialogs',
  'drawer': 'drawers',
  'list': 'lists',
  'menu': 'menus',
  'radio-button': 'radio-buttons',
  'snackbar': 'snackbars',
  'stepper': 'steppers',
  'tooltip': 'tooltips',
  'card': 'cards',
  'divider': 'dividers',
  'link': 'links',
  'switch': 'switches',

  // 特殊命名
  'textfield': 'text-fields',
  'app-bar': 'app-bar',
  'button-group': 'button-group',
  'toggle-button': 'toggle-button',
  'image-list': 'image-list',
  'floating-action-button': 'floating-action-button',
  'select': 'selects',
};

/**
 * 反向映射：MUI 目录名 -> 项目组件 ID
 */
export const muiDirToComponentId = Object.entries(componentIdToMuiDir).reduce(
  (acc, [id, dir]) => {
    acc[dir] = id;
    return acc;
  },
  {} as Record<string, string>
);
