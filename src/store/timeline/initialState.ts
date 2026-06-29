import { TimelineState } from "./types";

export const TimelineInitialState: TimelineState = {
  items: [
    {
      id: '1',
      content: '项目启动',
      start: new Date(2024, 0, 1),
      type: 'point',
      group: 'group1'
    },
    {
      id: '2', 
      content: '需求分析',
      start: new Date(2024, 0, 5),
      end: new Date(2024, 0, 15),
      type: 'range',
      group: 'group1'
    },
    {
      id: '3',
      content: '设计阶段',
      start: new Date(2024, 0, 16),
      end: new Date(2024, 0, 30),
      type: 'range',
      group: 'group1'
    },
    {
      id: '4',
      content: '开发阶段',
      start: new Date(2024, 1, 1),
      end: new Date(2024, 2, 15),
      type: 'range',
      group: 'group1'
    },
    {
      id: '5',
      content: '测试阶段',
      start: new Date(2024, 2, 16),
      end: new Date(2024, 2, 30),
      type: 'range',
      group: 'group1'
    },
    {
      id: '6',
      content: '项目上线',
      start: new Date(2024, 3, 1),
      type: 'point',
      group: 'group1'
    }
  ],
  groups: [
    {
      id: 'group1',
      content: '项目管理',
      order: 1
    }
  ],
  selectedItemId: null
};