import { Card, CardContent, Box, Typography, Stack, Grid } from "@mui/material";
import {
  SchoolOutlined,
  CheckCircleOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, icon, iconBg }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Courses in progress"
          value={6}
          icon={<SchoolOutlined sx={{ fontSize: 28 }} />}
          iconBg="#F59E0B"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Courses completed"
          value={3}
          icon={<CheckCircleOutlined sx={{ fontSize: 28 }} />}
          iconBg="#10B981"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Certificates"
          value={2}
          icon={<WorkspacePremiumOutlined sx={{ fontSize: 28 }} />}
          iconBg="#8B5CF6"
        />
      </Grid>
    </Grid>
  );
}
