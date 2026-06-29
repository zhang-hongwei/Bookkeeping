import React from "react";
import { Box, Typography } from "@mui/material";
import { DragIndicator as DragIndicatorIcon } from "@mui/icons-material";
import { useDroppable } from "@dnd-kit/core";

interface DroppableZoneProps {
  id: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}

/**
 * Droppable zone component - represents an area where components can be dropped
 */
export const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  children,
  isEmpty = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: "400px",
        padding: "24px",
        border: `2px dashed ${isOver ? "#1976d2" : "#e0e0e0"}`,
        borderRadius: "4px",
        backgroundColor: isOver ? "rgba(25, 118, 210, 0.04)" : "#fff",
        transition: "all 0.2s",
        display: isEmpty ? "flex" : "block",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isEmpty ? (
        <Box sx={{ textAlign: "center" }}>
          <DragIndicatorIcon
            sx={{
              fontSize: 64,
              color: "text.disabled",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary">
            Drop components here
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Drag MUI components from the sidebar
          </Typography>
        </Box>
      ) : (
        children
      )}
    </div>
  );
};
