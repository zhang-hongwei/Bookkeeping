import { Box, Stack, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ImagePreviewsProps {
  images: string[];
  onRemove: (index: number) => void;
  /** When true, renders smaller 60x60 previews instead of 80x80 */

  size?: number
}

export function ImagePreviews({ images, onRemove, size = 48 }: ImagePreviewsProps) {


  return (
    <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
      {images.map((img, i) => (
        <Box key={i} sx={{ position: "relative" }}>
          <Box
            component="img"
            src={img}
            alt="preview"
            sx={{ width: size, height: size, objectFit: "cover", borderRadius: 1 }}
          />
          <IconButton
            size="small"
            onClick={() => onRemove(i)}
            sx={{
              position: "absolute",
              top: -6,
              right: -6,
              bgcolor: "grey.700",
              width: 16,
              height: 16,
              "&:hover": { bgcolor: "grey.600" },
            }}
          >
            <CloseIcon sx={{ fontSize: 12, color: "white" }} />
          </IconButton>
        </Box>
      ))}
    </Stack>
  );
}
