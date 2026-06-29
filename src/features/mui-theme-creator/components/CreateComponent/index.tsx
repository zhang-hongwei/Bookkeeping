"use client";

import React, { useState } from "react";
import {
  Typography,
  TextField,
  InputAdornment,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Paper,
  Box,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  allComponents,
  componentTypeLabels,
  type ComponentInfo,
  type ComponentType,
} from "@/app/components/constants/componentData";
import { PageContainer, Sidebar, EditorArea } from "./styles";
import { typeIcons } from "./constants";
import { SidebarDraggableComponent } from "./SidebarDraggableComponent";
import { ComponentTreeRenderer } from "./ComponentTreeRenderer";
import { DroppableZone } from "./DroppableZone";
import { type ComponentNode } from "./types";

/**
 * CreateComponent - 创建组件页面
 * Drag-and-drop visual component builder
 */
const CreateComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPanels, setExpandedPanels] = useState<string[]>(["layout"]);
  const [componentTree, setComponentTree] = useState<ComponentNode[]>([]);
  const [activeComponent, setActiveComponent] = useState<ComponentInfo | null>(
    null
  );

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter components based on search
  const filteredComponents = allComponents.filter((component) =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group components by type
  const componentsByType = filteredComponents.reduce(
    (acc, component) => {
      if (!acc[component.type]) {
        acc[component.type] = [];
      }
      acc[component.type].push(component);
      return acc;
    },
    {} as Record<ComponentType, ComponentInfo[]>
  );

  // Handle panel expand/collapse
  const handlePanelChange = (panel: string) => () => {
    setExpandedPanels((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.source === "sidebar") {
      setActiveComponent(active.data.current.component);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("log=event===>>>>", event);
    setActiveComponent(null);

    if (!over) return;

    const activeData = active.data.current;
    if (!activeData?.component) return;

    const component: ComponentInfo = activeData.component;
    const newNode: ComponentNode = {
      id: `${component.id}-${Date.now()}`,
      componentId: component.id,
      componentInfo: component,
      children: [],
    };

    // Dropping to root
    if (over.id === "root-drop-zone") {
      setComponentTree((prev) => [...prev, newNode]);
      return;
    }

    // Dropping to a component
    const overData = over.data.current;
    if (overData?.node && overData.accepts) {
      const targetNode = overData.node as ComponentNode;
      setComponentTree((prev) => addChildToNode(prev, targetNode.id, newNode));
    }
  };

  // Add child to a specific node
  const addChildToNode = (
    nodes: ComponentNode[],
    targetId: string,
    newChild: ComponentNode
  ): ComponentNode[] => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        return {
          ...node,
          children: [...node.children, newChild],
        };
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: addChildToNode(node.children, targetId, newChild),
        };
      }
      return node;
    });
  };

  // Delete component
  const handleDelete = (id: string) => {
    setComponentTree((prev) => removeNode(prev, id));
  };

  // Remove node from tree
  const removeNode = (
    nodes: ComponentNode[],
    targetId: string
  ): ComponentNode[] => {
    return nodes.filter((node) => {
      if (node.id === targetId) return false;
      if (node.children.length > 0) {
        node.children = removeNode(node.children, targetId);
      }
      return true;
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <PageContainer>
        {/* Left Sidebar */}
        <Sidebar>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Components
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          <List component="nav" disablePadding>
            {(Object.keys(componentsByType) as ComponentType[]).map((type) => {
              const components = componentsByType[type];
              if (!components || components.length === 0) return null;

              const isNestable = type === "layout";

              return (
                <React.Fragment key={type}>
                  <ListItemButton
                    onClick={handlePanelChange(type)}
                    sx={{
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{ mr: 1.5, color: "text.secondary", display: "flex" }}
                    >
                      {typeIcons[type]}
                    </Box>
                    <ListItemText
                      primary={componentTypeLabels[type]}
                      slotProps={{
                        primary: { fontWeight: 500, fontSize: "0.875rem" },
                      }}
                    />
                    {isNestable && (
                      <Chip
                        label="可嵌套"
                        size="small"
                        color="success"
                        sx={{
                          height: 18,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          mr: 1,
                        }}
                      />
                    )}
                    <Chip
                      label={components.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        mr: 1,
                      }}
                    />
                    {expandedPanels.includes(type) ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItemButton>
                  <Collapse
                    in={expandedPanels.includes(type)}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {components.map((component) => (
                        <SidebarDraggableComponent
                          key={component.id}
                          component={component}
                        />
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            })}
          </List>
        </Sidebar>

        {/* Editor Area */}
        <EditorArea>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Component Editor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Drag components from the sidebar. Layout components can nest other
            components.
          </Typography>

          <DroppableZone
            id="root-drop-zone"
            isEmpty={componentTree.length === 0}
          >
            <ComponentTreeRenderer
              nodes={componentTree}
              onDelete={handleDelete}
            />
          </DroppableZone>
        </EditorArea>
      </PageContainer>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeComponent && (
          <Paper
            sx={{
              p: 1,
              opacity: 0.9,
              pointerEvents: "none",
            }}
          >
            <Typography variant="body2">{activeComponent.name}</Typography>
          </Paper>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default CreateComponent;
