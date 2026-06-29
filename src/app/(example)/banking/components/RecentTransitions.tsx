import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Button,
} from "@mui/material";
import { MoreVertOutlined } from "@mui/icons-material";
import { recentTransactions } from "../data";

export function RecentTransitions() {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Recent transitions
        </Typography>

        <Stack spacing={0}>
          {/* Table Header */}
          <Stack
            direction="row"
            sx={{
              pb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ flex: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Description
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Date
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Amount
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Status
              </Typography>
            </Box>
          </Stack>

          {/* Table Rows */}
          {recentTransactions.map((transaction, index) => (
            <Stack
              key={transaction.id}
              direction="row"
              alignItems="center"
              sx={{
                py: 2,
                borderBottom: index < recentTransactions.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Box sx={{ flex: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={transaction.avatar}
                    sx={{ width: 40, height: 40 }}
                  >
                    {transaction.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {transaction.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transaction.name}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.primary">
                  {transaction.date}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {transaction.time}
                </Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {transaction.amount}
                </Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={transaction.status}
                    size="small"
                    sx={{
                      bgcolor:
                        transaction.status === "Completed"
                          ? "success.lighter"
                          : transaction.status === "Progress"
                          ? "warning.lighter"
                          : "error.lighter",
                      color:
                        transaction.status === "Completed"
                          ? "success.dark"
                          : transaction.status === "Progress"
                          ? "warning.dark"
                          : "error.dark",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                  <IconButton size="small">
                    <MoreVertOutlined fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="text"
            sx={{
              textTransform: "none",
              color: "text.secondary",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            View all →
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
