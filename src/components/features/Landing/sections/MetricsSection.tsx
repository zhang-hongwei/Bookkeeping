"use client";

import { Box, Container, Typography, Stack, Grid, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const MetricsSection = () => {
  const { t } = useTranslation("landing");

  const metrics = [
    { value: t("metrics.items.0.value"), label: t("metrics.items.0.label") },
    { value: t("metrics.items.1.value"), label: t("metrics.items.1.label") },
    { value: t("metrics.items.2.value"), label: t("metrics.items.2.label") },
    { value: t("metrics.items.3.value"), label: t("metrics.items.3.label") },
    { value: t("metrics.items.4.value"), label: t("metrics.items.4.label") },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          {metrics.map((metric, index) => (
            <Grid key={index} size={{ xs: 6, sm: 4, md: 2.4 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Stack spacing={1} alignItems="center" textAlign="center">
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    color="primary.main"
                    sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
                  >
                    {metric.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    {metric.label}
                  </Typography>
                </Stack>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
