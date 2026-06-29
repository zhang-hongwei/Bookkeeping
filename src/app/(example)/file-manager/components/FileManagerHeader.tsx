import { Stack, Typography, Button } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

export function FileManagerHeader() {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        File manager
      </Typography>
      <Button
        variant="contained"
        startIcon={<CloudUploadOutlinedIcon />}
        sx={{
          bgcolor: "#212121",
          color: "#fff",
          textTransform: "none",
          "&:hover": { bgcolor: "#333" },
        }}
      >
        Upload
      </Button>
    </Stack>
  );
}
