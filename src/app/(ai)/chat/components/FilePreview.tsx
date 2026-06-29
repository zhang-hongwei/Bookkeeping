/**
 * FilePreview Component
 * File attachment chip showing file name, size, and remove button
 */

"use client";

import { Chip, type ChipProps } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatFileSize } from "../hooks/useFileUpload";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  size?: ChipProps["size"];
}

export function FilePreview({ file, onRemove, size = "small" }: FilePreviewProps) {
  return (
    <Chip
      label={`${file.name} (${formatFileSize(file.size)})`}
      onDelete={onRemove}
      deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
      size={size}
      variant="outlined"
      sx={{
        maxWidth: 200,
        "& .MuiChip-label": {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "0.75rem",
        },
      }}
    />
  );
}
