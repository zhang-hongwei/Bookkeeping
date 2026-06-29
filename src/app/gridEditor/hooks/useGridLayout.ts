/**
 * useGridLayout Hook
 * Grid 布局编辑器的状态管理
 */

'use client';

import { useState, useCallback } from 'react';
import type { GridNode, GridItem, GridContainer, GridContainerConfig } from '../types';

/**
 * 创建默认的 Grid 项目
 */
const createDefaultItem = (id: number): GridItem => ({
  id: String(id),
  type: 'item',
  label: `Item ${id}`,
  size: { xs: 3, sm: 3, md: 3, lg: 3 },
  order: 0,
  bgcolor: '#ffffff',
});

/**
 * 创建默认的 Grid 容器
 */
const createDefaultContainer = (id: number): GridContainer => ({
  id: String(id),
  type: 'container',
  label: `Container ${id}`,
  size: { xs: 12, sm: 12, md: 12, lg: 12 },
  order: 0,
  children: [],
  containerConfig: {
    columns: 12,
    spacing: 2,
    direction: 'row',
    wrap: 'wrap',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
});

/**
 * 生成下一个可用的 ID
 */
function getNextId(nodes: GridNode[]): number {
  let maxId = 0;
  const traverse = (nodeList: GridNode[]) => {
    nodeList.forEach((node) => {
      const numId = Number(node.id);
      if (!isNaN(numId) && numId > maxId) {
        maxId = numId;
      }
      if (node.type === 'container') {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return maxId + 1;
}

/**
 * 在树中查找节点
 */
function findNodeById(nodes: GridNode[], id: string): GridNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === 'container') {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 获取树中所有节点（扁平化）
 */
function getAllNodes(nodes: GridNode[]): GridNode[] {
  const result: GridNode[] = [];
  const traverse = (nodeList: GridNode[]) => {
    nodeList.forEach((node) => {
      result.push(node);
      if (node.type === 'container') {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return result;
}

/**
 * Grid 布局编辑器 Hook
 */
export function useGridLayout() {
  // 根容器配置
  const [containerConfig, setContainerConfig] = useState<GridContainerConfig>({
    columns: 12,
    spacing: 2,
    direction: 'row',
    wrap: 'wrap',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  });

  // Grid 节点树
  const [nodes, setNodes] = useState<GridNode[]>([
    createDefaultItem(1),
    createDefaultItem(2),
    createDefaultItem(3),
    createDefaultItem(4),
  ]);

  // 当前选中的节点 ID
  const [activeNodeId, setActiveNodeId] = useState<string>(nodes[0].id);

  // 是否启用响应式断点配置
  const [enableResponsiveBreakpoints, setEnableResponsiveBreakpoints] = useState(false);

  /**
   * 更新根容器配置
   */
  const updateContainer = useCallback((updates: Partial<GridContainerConfig>) => {
    setContainerConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * 更新指定节点
   */
  const updateNode = useCallback((id: string, updates: Partial<GridNode>) => {
    setNodes((prev) => {
      const updateInTree = (nodeList: GridNode[]): GridNode[] => {
        return nodeList.map((node) => {
          if (node.id === id) {
            return { ...node, ...updates } as GridNode;
          }
          if (node.type === 'container') {
            return {
              ...node,
              children: updateInTree(node.children),
            };
          }
          return node;
        });
      };
      return updateInTree(prev);
    });
  }, []);

  /**
   * 添加新项目
   * @param parentId 父容器 ID，如果为 null 则添加到根级别
   */
  const addItem = useCallback(
    (parentId: string | null = null) => {
      const nextId = getNextId(nodes);
      const newItem = createDefaultItem(nextId);

      setNodes((prev) => {
        if (parentId === null) {
          // 添加到根级别
          return [...prev, newItem];
        }

        // 添加到指定容器
        const addToContainer = (nodeList: GridNode[]): GridNode[] => {
          return nodeList.map((node) => {
            if (node.id === parentId && node.type === 'container') {
              return {
                ...node,
                children: [...node.children, newItem],
              };
            }
            if (node.type === 'container') {
              return {
                ...node,
                children: addToContainer(node.children),
              };
            }
            return node;
          });
        };
        return addToContainer(prev);
      });

      setActiveNodeId(newItem.id);
    },
    [nodes]
  );

  /**
   * 添加新容器
   * @param parentId 父容器 ID，如果为 null 则添加到根级别
   */
  const addContainer = useCallback(
    (parentId: string | null = null) => {
      const nextId = getNextId(nodes);
      const newContainer = createDefaultContainer(nextId);

      setNodes((prev) => {
        if (parentId === null) {
          // 添加到根级别
          return [...prev, newContainer];
        }

        // 添加到指定容器
        const addToParent = (nodeList: GridNode[]): GridNode[] => {
          return nodeList.map((node) => {
            if (node.id === parentId && node.type === 'container') {
              return {
                ...node,
                children: [...node.children, newContainer],
              };
            }
            if (node.type === 'container') {
              return {
                ...node,
                children: addToParent(node.children),
              };
            }
            return node;
          });
        };
        return addToParent(prev);
      });

      setActiveNodeId(newContainer.id);
    },
    [nodes]
  );

  /**
   * 删除指定节点
   */
  const deleteNode = useCallback(
    (id: string) => {
      setNodes((prev) => {
        const deleteFromTree = (nodeList: GridNode[]): GridNode[] => {
          return nodeList
            .filter((node) => node.id !== id)
            .map((node) => {
              if (node.type === 'container') {
                return {
                  ...node,
                  children: deleteFromTree(node.children),
                };
              }
              return node;
            });
        };
        return deleteFromTree(prev);
      });

      // 如果删除的是当前选中节点，则选中第一个
      if (activeNodeId === id) {
        const allNodes = getAllNodes(nodes);
        const remainingNodes = allNodes.filter((node) => node.id !== id);
        if (remainingNodes.length > 0) {
          setActiveNodeId(remainingNodes[0].id);
        }
      }
    },
    [activeNodeId, nodes]
  );

  /**
   * 移动节点位置（上移/下移）
   * @param id 节点 ID
   * @param direction 移动方向
   * @param parentId 父容器 ID，如果为 null 则在根级别移动
   */
  const moveNode = useCallback(
    (id: string, direction: 'up' | 'down', parentId: string | null = null) => {
      setNodes((prev) => {
        if (parentId === null) {
          // 在根级别移动
          const idx = prev.findIndex((node) => node.id === id);
          if (idx < 0) return prev;

          const newIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= prev.length) return prev;

          const arr = [...prev];
          const [node] = arr.splice(idx, 1);
          arr.splice(newIdx, 0, node);
          return arr;
        }

        // 在指定容器中移动
        const moveInContainer = (nodeList: GridNode[]): GridNode[] => {
          return nodeList.map((node) => {
            if (node.id === parentId && node.type === 'container') {
              const idx = node.children.findIndex((child) => child.id === id);
              if (idx < 0) return node;

              const newIdx = direction === 'up' ? idx - 1 : idx + 1;
              if (newIdx < 0 || newIdx >= node.children.length) return node;

              const arr = [...node.children];
              const [child] = arr.splice(idx, 1);
              arr.splice(newIdx, 0, child);
              return { ...node, children: arr };
            }
            if (node.type === 'container') {
              return {
                ...node,
                children: moveInContainer(node.children),
              };
            }
            return node;
          });
        };
        return moveInContainer(prev);
      });
    },
    []
  );

  /**
   * 重置为默认布局
   */
  const reset = useCallback(() => {
    const defaultNodes = [
      createDefaultItem(1),
      createDefaultItem(2),
      createDefaultItem(3),
      createDefaultItem(4),
    ];
    setNodes(defaultNodes);
    setActiveNodeId(defaultNodes[0].id);
    setContainerConfig({
      columns: 12,
      spacing: 2,
      direction: 'row',
      wrap: 'wrap',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
    });
  }, []);

  // 获取当前选中的节点
  const activeNode = findNodeById(nodes, activeNodeId) || nodes[0] || null;

  return {
    // State
    containerConfig,
    nodes,
    activeNodeId,
    activeNode,
    enableResponsiveBreakpoints,

    // Actions
    updateContainer,
    updateNode,
    addItem,
    addContainer,
    deleteNode,
    moveNode,
    setActiveNodeId,
    setEnableResponsiveBreakpoints,
    reset,
  };
}
