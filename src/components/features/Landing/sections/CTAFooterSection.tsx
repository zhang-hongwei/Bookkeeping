"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
} from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const CTAFooterSection = () => {
  const { t } = useTranslation("landing");

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography
            variant="h2"
            fontWeight={700}
            fontSize={{ xs: "2rem", md: "2.5rem" }}
            sx={{ color: "white" }}
          >
            {t("ctaFooter.title")}
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)" }}>
            {t("ctaFooter.subtitle")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<RocketLaunch />}
            sx={{
              px: 5,
              py: 2,
              fontSize: "1.1rem",
              fontWeight: 600,
              backgroundColor: "white",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.9)",
              },
            }}
          >
            {t("ctaFooter.cta")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};
