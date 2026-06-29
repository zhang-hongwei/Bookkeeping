import { Box, Typography, Button, Stack } from "@mui/material";
import { SendOutlined, CreditCardOutlined, CallReceivedOutlined, HelpOutlineOutlined } from "@mui/icons-material";

interface BalanceHeaderProps {
  totalBalance: string;
}

export function BalanceHeader({ totalBalance }: BalanceHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total balance
            </Typography>
            <HelpOutlineOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            {totalBalance}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<SendOutlined />}
            sx={{
              borderColor: "divider",
              color: "text.primary",
              textTransform: "none",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            Send
          </Button>
          <Button
            variant="outlined"
            startIcon={<CreditCardOutlined />}
            sx={{
              borderColor: "divider",
              color: "text.primary",
              textTransform: "none",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            Add card
          </Button>
          <Button
            variant="outlined"
            startIcon={<CallReceivedOutlined />}
            sx={{
              borderColor: "divider",
              color: "text.primary",
              textTransform: "none",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            Request
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
