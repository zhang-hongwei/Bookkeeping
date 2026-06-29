import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Chip,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarIcon from "@mui/icons-material/Star";
import { reviews } from "../data";

export function CustomerReviewsCard() {
  const theme = useTheme();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Customer reviews
            </Typography>
            <Typography variant="caption" color="text.secondary">
              5 Reviews
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton size="small">
              <ChevronLeftIcon />
            </IconButton>
            <IconButton size="small">
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Stack>

        {reviews.map((review, index) => (
          <Box key={index}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#f0f0f0",
                  color: "#666",
                }}
              >
                JS
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {review.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {review.date}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  sx={{
                    fontSize: 18,
                    color: i < review.rating ? theme.palette.warning.main : theme.palette.grey[300],
                  }}
                />
              ))}
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, lineHeight: 1.6 }}
            >
              {review.comment}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {review.tags.map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: "#f5f5f5",
                    fontSize: "11px",
                    height: 24,
                  }}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={2}>
              <Box
                sx={{
                  flex: 1,
                  py: 1.5,
                  textAlign: "center",
                  border: "1px solid #f0f0f0",
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#fafafa" },
                }}
              >
                <Typography variant="body2" color="error">
                  Reject
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  py: 1.5,
                  textAlign: "center",
                  bgcolor: "#212121",
                  color: "white",
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#333" },
                }}
              >
                <Typography variant="body2">Accept</Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
