"use client";

import { Box, Container, Grid, Stack } from "@mui/material";
import { ProfileHeader } from "./components/ProfileHeader";
import { AboutCard } from "./components/AboutCard";
import { SocialCard } from "./components/SocialCard";
import { CreatePostCard } from "./components/CreatePostCard";
import { PostCard } from "./components/PostCard";
import { posts } from "./data";

export default function UserProfilePage() {
  return (
    <Box sx={{ minHeight: "100%", py: 3 }}>

      {/* Profile Header */}
      <ProfileHeader />

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <AboutCard />
            <SocialCard />
          </Stack>
        </Grid>

        {/* Main Feed */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <CreatePostCard />

            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Stack>
        </Grid>
      </Grid>

    </Box>
  );
}
