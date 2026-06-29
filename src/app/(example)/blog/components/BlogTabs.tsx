import { Tabs, Tab, Stack, Chip } from "@mui/material";
import { BlogPost } from "../data";

interface BlogTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  posts: BlogPost[];
}

export function BlogTabs({ value, onChange, posts }: BlogTabsProps) {
  const allCount = posts.length;
  const publishedCount = posts.filter((p) => p.status === "Published").length;
  const draftCount = posts.filter((p) => p.status === "Draft").length;

  return (
    <Tabs
      value={value}
      onChange={onChange}
      sx={{
        "& .MuiTab-root": {
          textTransform: "none",
          fontWeight: 500,
          minWidth: "auto",
          px: 2,
        },
      }}
    >
      <Tab
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <span>All</span>
            <Chip
              label={allCount}
              size="small"
              sx={{
                height: 20,
                bgcolor: "#212121",
                color: "white",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </Stack>
        }
      />
      <Tab
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <span>Published</span>
            <Chip
              label={publishedCount}
              size="small"
              sx={{
                height: 20,
                bgcolor: "#00AB55",
                color: "white",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </Stack>
        }
      />
      <Tab
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <span>Draft</span>
            <Chip
              label={draftCount}
              size="small"
              sx={{
                height: 20,
                bgcolor: "#919EAB",
                color: "white",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </Stack>
        }
      />
    </Tabs>
  );
}
