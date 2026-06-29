import { Box, Avatar, Typography, Stack, Button } from "@mui/material";
import { userProfile } from "../data";

export function ProfileHeader() {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        mb: 3,
      }}
    >
      {/* Cover Image */}
      <Box
        sx={{
          height: 200,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
        }}
      />

      {/* User Info */}
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 10,
          px: 3,
          pb: 3,
          position: "relative",
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 120,
            height: 120,
            fontSize: "4rem",
            position: "absolute",
            top: -60,
            left: 24,
            border: "4px solid",
            borderColor: "background.paper",
            bgcolor: "grey.100",
          }}
        >
          {userProfile.avatar}
        </Avatar>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 1,
              textTransform: "none",
            }}
          >
            Profile
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              borderRadius: 1,
              textTransform: "none",
              bgcolor: "primary.main",
            }}
          >
            Followers
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 1,
              textTransform: "none",
            }}
          >
            Friends
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 1,
              textTransform: "none",
            }}
          >
            Gallery
          </Button>
        </Stack>

        {/* Name and Role */}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {userProfile.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {userProfile.role}
        </Typography>

        {/* Stats */}
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {userProfile.followers.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Follower
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {userProfile.following.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Following
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
