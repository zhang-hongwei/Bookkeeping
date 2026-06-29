import React from "react";
import { Box, IconButton } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useDroppable } from "@dnd-kit/core";
import { ComponentWrapper } from "./styles";
import { type ComponentNode } from "./types";

interface DroppableComponentProps {
  node: ComponentNode;
  onDelete: (id: string) => void;
  children?: React.ReactNode;
}

/**
 * Droppable component wrapper - supports nested drag and drop for layout components
 */
export const DroppableComponent: React.FC<DroppableComponentProps> = ({
  node,
  onDelete,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: node.id,
    data: { node, accepts: node.componentInfo.nestable },
    disabled: !node.componentInfo.nestable,
  });

  const canNest = node.componentInfo.nestable;

  return (
    <ComponentWrapper>
      {/* Delete button */}
      <IconButton
        className="delete-button"
        size="small"
        onClick={() => onDelete(node.id)}
        sx={{
          position: "absolute",
          top: -8,
          right: -8,
          zIndex: 10,
          bgcolor: "error.main",
          color: "white",
          opacity: 0,
          transition: "opacity 0.2s",
          "&:hover": {
            bgcolor: "error.dark",
          },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>

      {canNest ? (
        <div
          ref={setNodeRef}
          style={{
            minHeight: "60px",
            height: "auto",
            width: "100%",
            padding: "8px",
            border: "1px dashed",
            borderColor: isOver ? "#1976d2" : "#e0e0e0",
            borderRadius: "4px",
            backgroundColor: isOver
              ? "rgba(25, 118, 210, 0.04)"
              : "transparent",
            transition: "all 0.2s",
          }}
        >
          {children}
        </div>
      ) : (
        <Box>{children}</Box>
      )}
    </ComponentWrapper>
  );
};
