import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export function FeaturedAppCard() {
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #00AB55 0%, #007B55 100%)",
        color: "white",
      }}
    >
      <CardContent sx={{ p: 3, height: "100%" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.9, textTransform: "uppercase" }}
            >
              Featured App
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
              The Rise of Remote Work: Benefits, Challen...
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              The aroma of freshly brewed coffee filled the air, awakening...
            </Typography>
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <IconButton size="small" sx={{ color: "white", opacity: 0.7 }}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" sx={{ color: "white" }}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </CardContent>
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%)",
        }}
      />
    </Card>
  );
}
