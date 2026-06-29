/**
 * Switch Preview Component
 * Live preview of customized switch with different states
 */

import {
  Stack,
  Typography,
  Paper,
  FormControlLabel,
} from "@mui/material";
import { Switch } from "@mui/material";

export function SwitchPreview() {
  return (
    <Stack spacing={3}>

      {/* Preview Cards */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} useFlexGap>
        {/* Unchecked */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Unchecked
          </Typography>
          <Switch size={"medium"} />
        </Paper>

        {/* Checked */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Checked
          </Typography>
          <Switch />
        </Paper>

        {/* Disabled Unchecked */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Disabled
          </Typography>
          <Switch disabled />
        </Paper>

        {/* Disabled Checked */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Disabled Checked
          </Typography>
          <Switch disabled defaultChecked />
        </Paper>
      </Stack>

      {/* With Labels */}
      <Paper variant="outlined" sx={{ p: 3, bgcolor: "background.paper", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
          With Labels
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} useFlexGap>
          <FormControlLabel control={<Switch />} label="Notification" />
          <FormControlLabel control={<Switch defaultChecked />} label="Location" />
          <FormControlLabel control={<Switch disabled />} label="Disabled" />
        </Stack>
      </Paper>

      {/* Focus Demo */}
      <Paper variant="outlined" sx={{ p: 3, bgcolor: "background.paper", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
          Focus State (Tab to focus)
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} useFlexGap>
          <FormControlLabel
            control={<Switch />}
            label="Focus me"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Or me"
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
