"use client";

import { Box, Typography, Stack } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

interface ProductImageUploadProps {
  onChange: (files: FileList | null) => void;
}

export function ProductImageUpload({ onChange }: ProductImageUploadProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onChange(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      sx={{
        border: 2,
        borderStyle: "dashed",
        borderColor: "divider",
        borderRadius: 2,
        p: 6,
        textAlign: "center",
        bgcolor: "grey.50",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: "action.hover",
        },
      }}
    >
      <Stack spacing={2} alignItems="center">
        {/* Icon Illustration */}
        <Box
          sx={{
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 80,
              bgcolor: "primary.main",
              borderRadius: 2,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloudUpload sx={{ fontSize: 40, color: "white" }} />
            {/* Floating papers illustration */}
            <Box
              sx={{
                position: "absolute",
                top: -10,
                right: -20,
                width: 40,
                height: 30,
                bgcolor: "white",
                borderRadius: 1,
                transform: "rotate(15deg)",
                boxShadow: 1,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: -5,
                right: -10,
                width: 40,
                height: 30,
                bgcolor: "white",
                borderRadius: 1,
                transform: "rotate(25deg)",
                boxShadow: 1,
              }}
            />
          </Box>
        </Box>

        {/* Text */}
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Drop or select files
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag files here, or{" "}
            <Typography
              component="span"
              color="primary"
              sx={{
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              browse
            </Typography>{" "}
            your device.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
