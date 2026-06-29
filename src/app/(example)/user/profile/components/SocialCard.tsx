import { Card, CardContent, Typography, Stack, IconButton } from "@mui/material";
import {
  Facebook,
  Instagram,
  LinkedIn,
  Twitter,
} from "@mui/icons-material";
import { userProfile } from "../data";

export function SocialCard() {
  const socialLinks = [
    {
      icon: <Facebook />,
      url: userProfile.social.facebook,
      color: "#1877F2",
      label: userProfile.social.facebook,
    },
    {
      icon: <Instagram />,
      url: userProfile.social.instagram,
      color: "#E4405F",
      label: userProfile.social.instagram,
    },
    {
      icon: <LinkedIn />,
      url: userProfile.social.linkedin,
      color: "#0A66C2",
      label: userProfile.social.linkedin,
    },
    {
      icon: <Twitter />,
      url: userProfile.social.twitter,
      color: "#1DA1F2",
      label: userProfile.social.twitter,
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Social
        </Typography>

        <Stack spacing={1.5}>
          {socialLinks.map((link, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                "&:hover": {
                  "& .social-icon": {
                    color: link.color,
                  },
                },
              }}
            >
              <IconButton
                className="social-icon"
                size="small"
                sx={{
                  color: "text.secondary",
                  transition: "color 0.2s",
                }}
              >
                {link.icon}
              </IconButton>
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
