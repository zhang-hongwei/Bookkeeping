export type ComponentType = 'layout' | 'form' | 'data-display' | 'feedback' | 'navigation' | 'surface';

export interface ComponentInfo {
  id: string;
  name: string;
  description?: string;
  category: 'mui' | 'mui-x';
  type: ComponentType;
  badge?: string;
  nestable?: boolean; // 是否可以嵌套其他组件
}

// All component data - single source of truth
export const allComponents: ComponentInfo[] = [
  // Form Components
  { id: 'autocomplete', name: 'Autocomplete', description: 'Autocompletes provide suggestions as users type.', category: 'mui', type: 'form' },
  { id: 'buttons', name: 'Button', description: 'Buttons allow users to perform actions.', category: 'mui', type: 'form' },
  { id: 'button-group', name: 'Button Group', description: 'Button Group displays a series of related buttons.', category: 'mui', type: 'form' },
  { id: 'checkbox', name: 'Checkbox', description: 'Checkboxes allow users to select multiple options.', category: 'mui', type: 'form' },
  { id: 'floating-action-button', name: 'Floating Action Button', description: 'A floating action button performs the primary action on a screen.', category: 'mui', type: 'form' },
  { id: 'radio-button', name: 'Radio button', description: 'Radio buttons allow users to select one option from a set.', category: 'mui', type: 'form' },
  { id: 'rating', name: 'Rating', description: 'Ratings allow users to provide feedback or review.', category: 'mui', type: 'form' },
  { id: 'select', name: 'Select', description: 'Select components allow users to choose from a list.', category: 'mui', type: 'form' },
  { id: 'slider', name: 'Slider', description: 'Sliders allow users to select values from a range.', category: 'mui', type: 'form' },
  { id: 'switch', name: 'Switch', description: 'Switches toggle the state of a single setting.', category: 'mui', type: 'form' },
  { id: 'textfield', name: 'Text Field', description: 'Text fields let users enter and edit text.', category: 'mui', type: 'form' },
  { id: 'toggle-button', name: 'Toggle Button', description: 'Toggle buttons group related options.', category: 'mui', type: 'form' },
  { id: 'transfer-list', name: 'Transfer List', description: 'Transfer lists allow users to move items between lists.', category: 'mui', type: 'form' },

  // Data Display Components
  { id: 'avatar', name: 'Avatar', description: 'Avatars represent people or objects.', category: 'mui', type: 'data-display' },
  { id: 'badge', name: 'Badge', description: 'Badges add small notifications to elements.', category: 'mui', type: 'data-display' },
  { id: 'card', name: 'Card', description: 'Cards contain content and actions about a single subject.', category: 'mui', type: 'data-display', nestable: true },
  { id: 'chip', name: 'Chip', description: 'Chips are compact elements that represent input, attribute, or action.', category: 'mui', type: 'data-display' },
  { id: 'divider', name: 'Divider', description: 'Dividers separate content into clear groups.', category: 'mui', type: 'data-display' },
  { id: 'image-list', name: 'Image List', description: 'Image lists display a collection of images.', category: 'mui', type: 'data-display' },
  { id: 'link', name: 'Link', description: 'Links allow users to navigate to a different location.', category: 'mui', type: 'data-display' },
  { id: 'list', name: 'List', description: 'Lists present content in a continuous, vertical format.', category: 'mui', type: 'data-display', nestable: true },
  { id: 'skeleton', name: 'Skeleton', description: 'Skeleton screens provide a preview of content.', category: 'mui', type: 'data-display' },
  { id: 'table', name: 'Table', description: 'Tables display sets of data in rows and columns.', category: 'mui', type: 'data-display' },
  { id: 'typography', name: 'Typography', description: 'Typography components for text display.', category: 'mui', type: 'data-display' },

  // Feedback Components
  { id: 'alert', name: 'Alert', description: 'Alerts display brief messages that are important for the user to see.', category: 'mui', type: 'feedback' },
  { id: 'backdrop', name: 'Backdrop', description: 'Backdrop provides emphasis on a particular element.', category: 'mui', type: 'feedback' },
  { id: 'dialog', name: 'Dialog', description: 'Dialogs inform users about a task and can contain critical information or require decisions.', category: 'mui', type: 'feedback' },
  { id: 'progress', name: 'Progress', description: 'Progress indicators show the completion status of a task.', category: 'mui', type: 'feedback' },
  { id: 'snackbar', name: 'Snackbar', description: 'Snackbars provide brief messages about app processes.', category: 'mui', type: 'feedback' },
  { id: 'tooltip', name: 'Tooltip', description: 'Tooltips display informative text when users hover over, focus on, or tap an element.', category: 'mui', type: 'feedback' },

  // Surface Components
  { id: 'accordion', name: 'Accordion', description: 'Accordions allow users to expand and collapse sections of content.', category: 'mui', type: 'surface', nestable: true },
  { id: 'app-bar', name: 'App Bar', description: 'App bars display information and actions for the current screen.', category: 'mui', type: 'surface', nestable: true },
  { id: 'paper', name: 'Paper', description: 'Paper provides a surface for content.', category: 'mui', type: 'surface', nestable: true },

  // Navigation Components
  { id: 'bottom-navigation', name: 'Bottom Navigation', description: 'Bottom navigation bars allow movement between primary destinations.', category: 'mui', type: 'navigation' },
  { id: 'breadcrumbs', name: 'Breadcrumbs', description: 'Breadcrumbs help users understand their location in a hierarchy.', category: 'mui', type: 'navigation' },
  { id: 'drawer', name: 'Drawer', description: 'Drawers provide access to destinations in your app.', category: 'mui', type: 'navigation', nestable: true },
  { id: 'menu', name: 'Menu', description: 'Menus display a list of choices on temporary surfaces.', category: 'mui', type: 'navigation' },
  { id: 'pagination', name: 'Pagination', description: 'Pagination allows users to navigate through multiple pages of content.', category: 'mui', type: 'navigation' },
  { id: 'speed-dial', name: 'Speed Dial', description: 'Speed dials display a floating action button with related actions.', category: 'mui', type: 'navigation' },
  { id: 'stepper', name: 'Stepper', description: 'Steppers guide users through a multi-step process.', category: 'mui', type: 'navigation' },
  { id: 'tabs', name: 'Tabs', description: 'Tabs organize content across different screens.', category: 'mui', type: 'navigation' },

  // Layout Components (can nest other components)
  { id: 'box', name: 'Box', description: 'Box is a wrapper component for styling and layout.', category: 'mui', type: 'layout', nestable: true },
  { id: 'container', name: 'Container', description: 'Containers center your content horizontally.', category: 'mui', type: 'layout', nestable: true },
  { id: 'grid', name: 'Grid', description: 'Grid creates visual consistency between layouts.', category: 'mui', type: 'layout', nestable: true },
  { id: 'stack', name: 'Stack', description: 'Stack manages layout of immediate children along vertical or horizontal axis.', category: 'mui', type: 'layout', nestable: true },

  // Utils
  { id: 'modal', name: 'Modal', description: 'Modal provides a solid foundation for creating dialogs and overlays.', category: 'mui', type: 'feedback' },
  { id: 'popover', name: 'Popover', description: 'Popovers display content in a temporary popup anchored to another element.', category: 'mui', type: 'feedback' },

  // MUI X Components
  { id: 'data-grid', name: 'Data Grid', description: 'Advanced data tables with sorting, filtering, and pagination.', category: 'mui-x', type: 'data-display', badge: 'MUI X' },
  { id: 'date-pickers', name: 'Date Pickers', description: 'Date and time picker components.', category: 'mui-x', type: 'form', badge: 'MUI X' },
  { id: 'timeline', name: 'Timeline', description: 'Timelines display a list of events in chronological order.', category: 'mui-x', type: 'data-display', badge: 'MUI X' },
  { id: 'tree-view', name: 'Tree View', description: 'Hierarchical data display with expand/collapse functionality.', category: 'mui-x', type: 'data-display', badge: 'MUI X' },
];

// Create a map for quick lookup by ID
export const componentDataMap = allComponents.reduce((acc, component) => {
  acc[component.id] = component;
  return acc;
}, {} as Record<string, ComponentInfo>);

// Helper function to get component by ID
export const getComponentById = (id: string): ComponentInfo | undefined => {
  return componentDataMap[id];
};

// Get components by category
export const getComponentsByCategory = (category: 'mui' | 'mui-x'): ComponentInfo[] => {
  return allComponents.filter(c => c.category === category);
};

// Get components by type
export const getComponentsByType = (type: ComponentType): ComponentInfo[] => {
  return allComponents.filter(c => c.type === type);
};

// Get nestable components
export const getNestableComponents = (): ComponentInfo[] => {
  return allComponents.filter(c => c.nestable === true);
};

// Component type labels
export const componentTypeLabels: Record<ComponentType, string> = {
  layout: '布局组件',
  form: '表单组件',
  'data-display': '数据展示',
  feedback: '反馈组件',
  navigation: '导航组件',
  surface: '表面组件',
};
