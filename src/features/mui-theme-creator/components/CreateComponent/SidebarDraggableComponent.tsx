import React from "react";
import { Box, ListItemText, Chip, alpha } from "@mui/material";
import { DragIndicator as DragIndicatorIcon } from "@mui/icons-material";
import { useDraggable } from "@dnd-kit/core";
import { type ComponentInfo } from "@/app/components/constants/componentData";

interface SidebarDraggableComponentProps {
  component: ComponentInfo;
}

/**
 * Sidebar draggable component - represents a component that can be dragged from sidebar
 */
export const SidebarDraggableComponent: React.FC<
  SidebarDraggableComponentProps
> = ({ component }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${component.id}`,
    data: { component, source: "sidebar" },
  });

  console.log("log==isDragging>>>", isDragging);

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        pl: 4,
        py: 1,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        borderRadius: 1,
        mb: 0.5,
        "&:active": {
          cursor: "grabbing",
        },
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        },
        display: "flex",
        alignItems: "center",
        border: "1px solid red",
      }}
    >
      <DragIndicatorIcon
        fontSize="small"
        sx={{ mr: 1, color: "text.secondary" }}
      />
      <ListItemText
        primary={component.name}
        secondary={component.description}
        slotProps={{
          primary: { fontSize: "0.875rem" },
          secondary: { fontSize: "0.75rem" },
        }}
      />
      {component.badge && (
        <Chip
          label={component.badge}
          size="small"
          color="primary"
          sx={{ height: 18, fontSize: "0.7rem" }}
        />
      )}
    </Box>
  );
};
