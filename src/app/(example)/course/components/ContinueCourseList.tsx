import { Card, CardContent, Box, Typography, Stack, LinearProgress } from "@mui/material";
import { continueCourses } from "../data";

export function ContinueCourseList() {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Continue course
        </Typography>

        <Stack spacing={2}>
          {continueCourses.map((course) => (
            <Box
              key={course.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.50",
                transition: "all 0.2s",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              {/* Thumbnail */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: "primary.lighter",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  flexShrink: 0,
                }}
              >
                {course.thumbnail}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {course.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  Lessons: {course.lessons}
                </Typography>

                {/* Progress bar */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 1,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#F59E0B",
                        borderRadius: 1,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      minWidth: 40,
                      textAlign: "right",
                    }}
                  >
                    {course.progress.toFixed(1)} %
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
