import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Stack,
  Avatar,
  Box,
  Chip,
} from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import StarIcon from "@mui/icons-material/Star";

interface RelatedApp {
  name: string;
  price: string;
  downloads: string;
  size: string;
  rating: string;
  icon: string;
}

interface RelatedApplicationsCardProps {
  tabValue: number;
  onTabChange: (value: number) => void;
  relatedApps: RelatedApp[];
}

export function RelatedApplicationsCard({
  tabValue,
  onTabChange,
  relatedApps,
}: RelatedApplicationsCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Related applications
        </Typography>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => onTabChange(newValue)}
          sx={{
            mb: 3,
            minHeight: "auto",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tab label="Top 7 days" sx={{ textTransform: "none" }} />
          <Tab label="Top 30 days" sx={{ textTransform: "none" }} />
          <Tab label="All times" sx={{ textTransform: "none" }} />
        </Tabs>
        <Stack spacing={2}>
          {relatedApps.map((app, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Avatar
                src={app.icon}
                sx={{ width: 48, height: 48 }}
                variant="rounded"
              />
              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {app.name}
                  </Typography>
                  <Chip
                    label={app.price}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "11px",
                      fontWeight: 600,
                      bgcolor: app.price === "Free" ? "#D8F5E6" : "#FFE7D9",
                      color: app.price === "Free" ? "#00AB55" : "#FF5630",
                    }}
                  />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CloudDownloadOutlinedIcon
                      sx={{ fontSize: 14, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {app.downloads}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <FolderOutlinedIcon
                      sx={{ fontSize: 14, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {app.size}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <StarIcon sx={{ fontSize: 14, color: "#FFAB00" }} />
                    <Typography variant="caption" color="text.secondary">
                      {app.rating}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
