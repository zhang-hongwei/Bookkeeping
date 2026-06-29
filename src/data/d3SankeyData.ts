import type { SankeyNode, SankeyLink } from '@/components/D3Sankey/EditableD3Sankey';

// D3桑基图数据
export const d3SankeyNodes: SankeyNode[] = [
  // Epic层
  {
    id: 'epic-1',
    name: '用户管理系统',
    value: 100,
    category: 'epic',
    color: '#5470c6',
    editable: true
  },

  // Feature层
  {
    id: 'feature-1',
    name: '身份认证',
    value: 35,
    category: 'feature',
    color: '#91cc75',
    editable: true
  },
  {
    id: 'feature-2',
    name: '用户档案',
    value: 25,
    category: 'feature',
    color: '#91cc75',
    editable: true
  },
  {
    id: 'feature-3',
    name: '权限管理',
    value: 30,
    category: 'feature',
    color: '#91cc75',
    editable: true
  },

  // Story层
  {
    id: 'story-1',
    name: '用户登录',
    value: 15,
    category: 'story',
    color: '#fac858',
    editable: true
  },
  {
    id: 'story-2',
    name: '用户注册',
    value: 10,
    category: 'story',
    color: '#fac858',
    editable: true
  },
  {
    id: 'story-3',
    name: '资料编辑',
    value: 15,
    category: 'story',
    color: '#fac858',
    editable: true
  },
  {
    id: 'story-4',
    name: '角色分配',
    value: 15,
    category: 'story',
    color: '#fac858',
    editable: true
  },

  // Task层
  {
    id: 'task-1',
    name: 'JWT认证',
    value: 8,
    category: 'task',
    color: '#ee6666',
    editable: true
  },
  {
    id: 'task-2',
    name: 'OAuth集成',
    value: 7,
    category: 'task',
    color: '#ee6666',
    editable: true
  },
  {
    id: 'task-3',
    name: '表单验证',
    value: 6,
    category: 'task',
    color: '#ee6666',
    editable: true
  },
  {
    id: 'task-4',
    name: 'RBAC数据库',
    value: 8,
    category: 'task',
    color: '#ee6666',
    editable: true
  }
];

export const d3SankeyLinks: SankeyLink[] = [
  // Epic到Feature
  { id: 'e1-1', source: 'epic-1', target: 'feature-1', value: 35, color: '#999' },
  { id: 'e1-2', source: 'epic-1', target: 'feature-2', value: 25, color: '#999' },
  { id: 'e1-3', source: 'epic-1', target: 'feature-3', value: 30, color: '#999' },

  // Feature到Story
  { id: 'e2-1', source: 'feature-1', target: 'story-1', value: 15, color: '#999' },
  { id: 'e2-2', source: 'feature-1', target: 'story-2', value: 10, color: '#999' },
  { id: 'e2-3', source: 'feature-2', target: 'story-3', value: 15, color: '#999' },
  { id: 'e2-4', source: 'feature-3', target: 'story-4', value: 15, color: '#999' },

  // Story到Task
  { id: 'e3-1', source: 'story-1', target: 'task-1', value: 8, color: '#999' },
  { id: 'e3-2', source: 'story-1', target: 'task-2', value: 7, color: '#999' },
  { id: 'e3-3', source: 'story-2', target: 'task-3', value: 6, color: '#999' },
  { id: 'e3-4', source: 'story-4', target: 'task-4', value: 8, color: '#999' }
];

// 简化版数据
export const simpleD3SankeyNodes: SankeyNode[] = [
  {
    id: 'epic-simple',
    name: '电商平台',
    value: 100,
    category: 'epic',
    editable: true
  },
  {
    id: 'feature-simple-1',
    name: '商品管理',
    value: 40,
    category: 'feature',
    editable: true
  },
  {
    id: 'feature-simple-2',
    name: '订单系统',
    value: 35,
    category: 'feature',
    editable: true
  },
  {
    id: 'story-simple-1',
    name: '商品列表',
    value: 20,
    category: 'story',
    editable: true
  },
  {
    id: 'story-simple-2',
    name: '购物车',
    value: 15,
    category: 'story',
    editable: true
  }
];

export const simpleD3SankeyLinks: SankeyLink[] = [
  { id: 'se1-1', source: 'epic-simple', target: 'feature-simple-1', value: 40 },
  { id: 'se1-2', source: 'epic-simple', target: 'feature-simple-2', value: 35 },
  { id: 'se2-1', source: 'feature-simple-1', target: 'story-simple-1', value: 20 },
  { id: 'se2-2', source: 'feature-simple-2', target: 'story-simple-2', value: 15 }
];