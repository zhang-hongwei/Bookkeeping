import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  LinearProgress,
  Checkbox,
} from "@mui/material";
import { CalendarTodayOutlined } from "@mui/icons-material";
import { reminders } from "../data";

export function RemindersCard() {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Reminders
        </Typography>

        <Stack spacing={2}>
          {reminders.map((reminder) => (
            <Box key={reminder.id}>
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                <Checkbox
                  size="small"
                  checked={reminder.completed}
                  sx={{
                    p: 0,
                    color: "text.disabled",
                    "&.Mui-checked": {
                      color: "success.main",
                    },
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      textDecoration: reminder.completed ? "line-through" : "none",
                      color: reminder.completed ? "text.disabled" : "text.primary",
                    }}
                  >
                    {reminder.title}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarTodayOutlined sx={{ fontSize: 12, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.secondary">
                      {reminder.date}
                    </Typography>
                  </Stack>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: reminder.completed ? "success.main" : "text.secondary",
                  }}
                >
                  {reminder.progress.toFixed(1)} %
                </Typography>
              </Stack>

              {/* Progress bar */}
              <LinearProgress
                variant="determinate"
                value={reminder.progress}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: reminder.completed ? "success.main" : "primary.main",
                    borderRadius: 1,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
