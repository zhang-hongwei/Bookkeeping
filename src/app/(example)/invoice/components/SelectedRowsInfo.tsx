import { Box, Typography, Stack } from "@mui/material";

interface SelectedRowsInfoProps {
  count: number;
  onDeselect: () => void;
}

export function SelectedRowsInfo({ count, onDeselect }: SelectedRowsInfoProps) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "#E3F2FD",
        borderBottom: "1px solid #E0E0E0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="body2">{count} items selected</Typography>
      <Typography
        variant="body2"
        sx={{ color: "#2196F3", cursor: "pointer" }}
        onClick={onDeselect}
      >
        Deselect all
      </Typography>
    </Box>
  );
}
