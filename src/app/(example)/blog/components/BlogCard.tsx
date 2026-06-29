import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Chip,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { BlogPost } from "../data";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          transform: "translateY(-4px)",
        },
        transition: "all 0.3s ease",
      }}
    >
      <Box sx={{ position: "relative", paddingTop: "75%", overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)`,
          }}
        />
        <Avatar
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 40,
            height: 40,
            border: "2px solid white",
          }}
        >
          {post.author.name.charAt(0)}
        </Avatar>
      </Box>

      <CardContent
        sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Chip
              label={post.status}
              size="small"
              sx={{
                bgcolor: post.status === "Published" ? "#E0F2F1" : "#FFF3E0",
                color: post.status === "Published" ? "#00695C" : "#E65100",
                fontWeight: 600,
                fontSize: 11,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {post.date}
            </Typography>
          </Stack>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.6,
            }}
          >
            {post.description}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 2, pt: 2, borderTop: "1px solid #f0f0f0" }}
        >
          <Stack direction="row" spacing={2}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CommentOutlinedIcon sx={{ fontSize: 16, color: "#999" }} />
              <Typography variant="caption" color="text.secondary">
                {post.stats.comments}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <VisibilityOutlinedIcon sx={{ fontSize: 16, color: "#999" }} />
              <Typography variant="caption" color="text.secondary">
                {post.stats.views}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ShareOutlinedIcon sx={{ fontSize: 16, color: "#999" }} />
              <Typography variant="caption" color="text.secondary">
                {post.stats.shares}
              </Typography>
            </Stack>
          </Stack>

          <IconButton size="small" sx={{ color: "#666" }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
