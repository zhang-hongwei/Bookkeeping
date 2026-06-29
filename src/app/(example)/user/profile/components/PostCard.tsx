import { Card, CardContent, Typography, Stack, Avatar, Box, IconButton } from "@mui/material";
import { MoreVertOutlined } from "@mui/icons-material";
import type { Post } from "../data";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        {/* Post Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 40, height: 40, fontSize: "1.25rem" }}>
              {post.author.avatar}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {post.author.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {post.date}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small">
            <MoreVertOutlined fontSize="small" />
          </IconButton>
        </Stack>

        {/* Post Content */}
        <Typography variant="body2" sx={{ mb: 2 }}>
          {post.content}
        </Typography>

        {/* Post Image */}
        {post.image && (
          <Box
            component="img"
            src={post.image}
            alt="Post"
            sx={{
              width: "100%",
              height: 300,
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
