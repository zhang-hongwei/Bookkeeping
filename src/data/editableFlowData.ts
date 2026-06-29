import type { Node, Edge } from '@xyflow/react';
import type { RequirementNodeData } from '@/components/EditableFlow/EditableRequirementFlow';

// 可编辑需求流程图数据
export const editableRequirementNodes: Node<RequirementNodeData>[] = [
  // Epic层
  {
    id: 'epic-1',
    type: 'requirement',
    position: { x: 50, y: 100 },
    data: {
      label: '用户管理系统',
      category: 'epic',
      value: 100,
      editable: true
    }
  },

  // Feature层
  {
    id: 'feature-1',
    type: 'requirement',
    position: { x: 300, y: 50 },
    data: {
      label: '身份认证',
      category: 'feature',
      value: 35,
      editable: true
    }
  },
  {
    id: 'feature-2',
    type: 'requirement',
    position: { x: 300, y: 150 },
    data: {
      label: '用户档案',
      category: 'feature',
      value: 25,
      editable: true
    }
  },
  {
    id: 'feature-3',
    type: 'requirement',
    position: { x: 300, y: 250 },
    data: {
      label: '权限管理',
      category: 'feature',
      value: 30,
      editable: true
    }
  },

  // Story层
  {
    id: 'story-1',
    type: 'requirement',
    position: { x: 550, y: 20 },
    data: {
      label: '用户登录',
      category: 'story',
      value: 15,
      editable: true
    }
  },
  {
    id: 'story-2',
    type: 'requirement',
    position: { x: 550, y: 80 },
    data: {
      label: '用户注册',
      category: 'story',
      value: 10,
      editable: true
    }
  },
  {
    id: 'story-3',
    type: 'requirement',
    position: { x: 550, y: 140 },
    data: {
      label: '资料编辑',
      category: 'story',
      value: 15,
      editable: true
    }
  },
  {
    id: 'story-4',
    type: 'requirement',
    position: { x: 550, y: 200 },
    data: {
      label: '头像上传',
      category: 'story',
      value: 10,
      editable: true
    }
  },
  {
    id: 'story-5',
    type: 'requirement',
    position: { x: 550, y: 260 },
    data: {
      label: '角色分配',
      category: 'story',
      value: 15,
      editable: true
    }
  },
  {
    id: 'story-6',
    type: 'requirement',
    position: { x: 550, y: 320 },
    data: {
      label: '权限检查',
      category: 'story',
      value: 15,
      editable: true
    }
  },

  // Task层
  {
    id: 'task-1',
    type: 'requirement',
    position: { x: 800, y: 10 },
    data: {
      label: 'JWT认证',
      category: 'task',
      value: 8,
      editable: true
    }
  },
  {
    id: 'task-2',
    type: 'requirement',
    position: { x: 800, y: 60 },
    data: {
      label: 'OAuth集成',
      category: 'task',
      value: 7,
      editable: true
    }
  },
  {
    id: 'task-3',
    type: 'requirement',
    position: { x: 800, y: 110 },
    data: {
      label: '表单验证',
      category: 'task',
      value: 6,
      editable: true
    }
  },
  {
    id: 'task-4',
    type: 'requirement',
    position: { x: 800, y: 160 },
    data: {
      label: '文件上传API',
      category: 'task',
      value: 6,
      editable: true
    }
  },
  {
    id: 'task-5',
    type: 'requirement',
    position: { x: 800, y: 210 },
    data: {
      label: '图片处理',
      category: 'task',
      value: 4,
      editable: true
    }
  },
  {
    id: 'task-6',
    type: 'requirement',
    position: { x: 800, y: 260 },
    data: {
      label: 'RBAC数据库',
      category: 'task',
      value: 8,
      editable: true
    }
  },
  {
    id: 'task-7',
    type: 'requirement',
    position: { x: 800, y: 310 },
    data: {
      label: '权限缓存',
      category: 'task',
      value: 7,
      editable: true
    }
  }
];

export const editableRequirementEdges: Edge[] = [
  // Epic到Feature的连接
  { id: 'e1-1', source: 'epic-1', target: 'feature-1', type: 'requirement', data: { weight: 35 }, animated: true },
  { id: 'e1-2', source: 'epic-1', target: 'feature-2', type: 'requirement', data: { weight: 25 }, animated: true },
  { id: 'e1-3', source: 'epic-1', target: 'feature-3', type: 'requirement', data: { weight: 30 }, animated: true },

  // Feature到Story的连接
  { id: 'e2-1', source: 'feature-1', target: 'story-1', type: 'requirement', data: { weight: 15 }, animated: true },
  { id: 'e2-2', source: 'feature-1', target: 'story-2', type: 'requirement', data: { weight: 10 }, animated: true },
  { id: 'e2-3', source: 'feature-2', target: 'story-3', type: 'requirement', data: { weight: 15 }, animated: true },
  { id: 'e2-4', source: 'feature-2', target: 'story-4', type: 'requirement', data: { weight: 10 }, animated: true },
  { id: 'e2-5', source: 'feature-3', target: 'story-5', type: 'requirement', data: { weight: 15 }, animated: true },
  { id: 'e2-6', source: 'feature-3', target: 'story-6', type: 'requirement', data: { weight: 15 }, animated: true },

  // Story到Task的连接
  { id: 'e3-1', source: 'story-1', target: 'task-1', type: 'requirement', data: { weight: 8 }, animated: true },
  { id: 'e3-2', source: 'story-1', target: 'task-2', type: 'requirement', data: { weight: 7 }, animated: true },
  { id: 'e3-3', source: 'story-2', target: 'task-3', type: 'requirement', data: { weight: 6 }, animated: true },
  { id: 'e3-4', source: 'story-3', target: 'task-3', type: 'requirement', data: { weight: 8 }, animated: true },
  { id: 'e3-5', source: 'story-3', target: 'task-4', type: 'requirement', data: { weight: 7 }, animated: true },
  { id: 'e3-6', source: 'story-4', target: 'task-4', type: 'requirement', data: { weight: 6 }, animated: true },
  { id: 'e3-7', source: 'story-4', target: 'task-5', type: 'requirement', data: { weight: 4 }, animated: true },
  { id: 'e3-8', source: 'story-5', target: 'task-6', type: 'requirement', data: { weight: 8 }, animated: true },
  { id: 'e3-9', source: 'story-5', target: 'task-7', type: 'requirement', data: { weight: 7 }, animated: true },
  { id: 'e3-10', source: 'story-6', target: 'task-6', type: 'requirement', data: { weight: 8 }, animated: true },
  { id: 'e3-11', source: 'story-6', target: 'task-7', type: 'requirement', data: { weight: 7 }, animated: true }
];

// 简化的可编辑数据
export const simpleEditableNodes: Node<RequirementNodeData>[] = [
  {
    id: 'epic-simple',
    type: 'requirement',
    position: { x: 50, y: 100 },
    data: {
      label: '电商平台',
      category: 'epic',
      value: 100,
      editable: true
    }
  },
  {
    id: 'feature-simple-1',
    type: 'requirement',
    position: { x: 300, y: 50 },
    data: {
      label: '商品管理',
      category: 'feature',
      value: 40,
      editable: true
    }
  },
  {
    id: 'feature-simple-2',
    type: 'requirement',
    position: { x: 300, y: 150 },
    data: {
      label: '订单系统',
      category: 'feature',
      value: 35,
      editable: true
    }
  },
  {
    id: 'story-simple-1',
    type: 'requirement',
    position: { x: 550, y: 30 },
    data: {
      label: '商品列表',
      category: 'story',
      value: 20,
      editable: true
    }
  },
  {
    id: 'story-simple-2',
    type: 'requirement',
    position: { x: 550, y: 90 },
    data: {
      label: '商品详情',
      category: 'story',
      value: 20,
      editable: true
    }
  },
  {
    id: 'story-simple-3',
    type: 'requirement',
    position: { x: 550, y: 150 },
    data: {
      label: '购物车',
      category: 'story',
      value: 15,
      editable: true
    }
  },
  {
    id: 'story-simple-4',
    type: 'requirement',
    position: { x: 550, y: 210 },
    data: {
      label: '下单流程',
      category: 'story',
      value: 20,
      editable: true
    }
  }
];

export const simpleEditableEdges: Edge[] = [
  { id: 'se1-1', source: 'epic-simple', target: 'feature-simple-1', type: 'requirement', data: { weight: 40 }, animated: true },
  { id: 'se1-2', source: 'epic-simple', target: 'feature-simple-2', type: 'requirement', data: { weight: 35 }, animated: true },
  { id: 'se2-1', source: 'feature-simple-1', target: 'story-simple-1', type: 'requirement', data: { weight: 20 }, animated: true },
  { id: 'se2-2', source: 'feature-simple-1', target: 'story-simple-2', type: 'requirement', data: { weight: 20 }, animated: true },
  { id: 'se2-3', source: 'feature-simple-2', target: 'story-simple-3', type: 'requirement', data: { weight: 15 }, animated: true },
  { id: 'se2-4', source: 'feature-simple-2', target: 'story-simple-4', type: 'requirement', data: { weight: 20 }, animated: true }
];