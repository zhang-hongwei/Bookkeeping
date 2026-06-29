import React from "react";
import { Box } from "@mui/material";
import { DroppableComponent } from "./DroppableComponent";
import ComponentRenderer from "../ComponentRenderer";
import { type ComponentNode } from "./types";

interface ComponentTreeRendererProps {
  nodes: ComponentNode[];
  onDelete: (id: string) => void;
}

/**
 * Recursive component tree renderer - renders nested component structure
 */
export const ComponentTreeRenderer: React.FC<ComponentTreeRendererProps> = ({
  nodes,
  onDelete,
}) => {
  return (
    <>
      {nodes.map((node) => (
        <DroppableComponent key={node.id} node={node} onDelete={onDelete}>
          <ComponentRenderer
            componentId={node.componentId}
            instanceId={node.id}
          />
          {node.children.length > 0 && (
            <Box sx={{ pl: 2, mt: 1 }}>
              <ComponentTreeRenderer
                nodes={node.children}
                onDelete={onDelete}
              />
            </Box>
          )}
        </DroppableComponent>
      ))}
    </>
  );
};
