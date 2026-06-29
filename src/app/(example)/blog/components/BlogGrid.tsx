import { Grid } from "@mui/material";
import { BlogPost } from "../data";
import { BlogCard } from "./BlogCard";

interface BlogGridProps {
  posts: BlogPost[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  return (
    <Grid container spacing={3}>
      {posts.map((post) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }} key={post.id}>
          <BlogCard post={post} />
        </Grid>
      ))}
    </Grid>
  );
}
