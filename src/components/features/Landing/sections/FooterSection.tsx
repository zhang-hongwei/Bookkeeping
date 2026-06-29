"use client";

import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  alpha,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { GitHub, Twitter } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const FooterSection = () => {
  const theme = useTheme();
  const { t } = useTranslation("landing");

  const footerSections = [
    {
      title: t("footer.sections.0.title"),
      links: [
        { text: t("footer.links.docs"), href: "#" },
        { text: t("footer.links.pricing"), href: "#" },
        { text: t("footer.links.status"), href: "#" },
        { text: t("footer.links.blog"), href: "#" },
      ],
    },
    {
      title: t("footer.sections.1.title"),
      links: [
        { text: t("footer.links.about"), href: "#" },
        { text: t("footer.links.careers"), href: "#" },
        { text: t("footer.links.contact"), href: "#" },
      ],
    },
    {
      title: t("footer.sections.2.title"),
      links: [
        { text: t("footer.links.terms"), href: "#" },
        { text: t("footer.links.privacy"), href: "#" },
      ],
    },
  ];

  return (
    <Box
      sx={{
        py: 6,
        borderTop: `1px solid ${theme.palette.divider}`,
        background: alpha(theme.palette.background.default, 0.5),
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                {t("footer.brandName")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("footer.tagline")}
              </Typography>
              <Stack direction="row" spacing={2}>
                <GitHub sx={{ cursor: "pointer" }} />
                <Twitter sx={{ cursor: "pointer" }} />
              </Stack>
            </Stack>
          </Grid>
          {footerSections.map((section, index) => (
            <Grid key={index} size={{ xs: 12, sm: 4, md: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {section.title}
                </Typography>
                {section.links.map((link, idx) => (
                  <Link key={idx} href={link.href} style={{ textDecoration: "none" }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        transition: "color 0.2s",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {link.text}
                    </Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Box
          sx={{ mt: 6, pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t("footer.copyright")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
