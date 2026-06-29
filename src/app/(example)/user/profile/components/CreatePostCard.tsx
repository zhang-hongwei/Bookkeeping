import { Card, CardContent, TextField, Stack, Button, IconButton } from "@mui/material";
import { ImageOutlined, VideoLibraryOutlined } from "@mui/icons-material";

export function CreatePostCard() {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Share what you are thinking here..."
          variant="outlined"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              bgcolor: "grey.50",
              "& fieldset": {
                borderColor: "transparent",
              },
              "&:hover fieldset": {
                borderColor: "divider",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              sx={{
                color: "success.main",
                bgcolor: "success.lighter",
                "&:hover": {
                  bgcolor: "success.light",
                },
              }}
            >
              <ImageOutlined fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: "error.main",
                bgcolor: "error.lighter",
                "&:hover": {
                  bgcolor: "error.light",
                },
              }}
            >
              <VideoLibraryOutlined fontSize="small" />
            </IconButton>
            <Button
              size="small"
              sx={{
                textTransform: "none",
                color: "text.secondary",
              }}
            >
              Image/Video
            </Button>
            <Button
              size="small"
              sx={{
                textTransform: "none",
                color: "text.secondary",
              }}
            >
              Streaming
            </Button>
          </Stack>

          <Button
            variant="contained"
            size="small"
            sx={{
              textTransform: "none",
              borderRadius: 1,
              px: 3,
            }}
          >
            Post
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
