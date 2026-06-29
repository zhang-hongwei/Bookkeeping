import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import {
  LocationOnOutlined,
  EmailOutlined,
  BusinessOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import { userProfile } from "../data";

export function AboutCard() {
  const infoItems = [
    {
      icon: <LocationOnOutlined />,
      label: "Live at",
      value: userProfile.location,
    },
    {
      icon: <EmailOutlined />,
      label: "",
      value: userProfile.email,
    },
    {
      icon: <BusinessOutlined />,
      label: "CTO at",
      value: userProfile.company,
    },
    {
      icon: <SchoolOutlined />,
      label: "Studied at",
      value: userProfile.school,
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          About
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {userProfile.about}
        </Typography>

        <Stack spacing={2}>
          {infoItems.map((item, index) => (
            <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  mt: 0.3,
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                {item.label && (
                  <Typography variant="caption" color="text.secondary">
                    {item.label}{" "}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.value}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
