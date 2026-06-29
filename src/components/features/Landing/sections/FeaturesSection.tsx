"use client";

import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  ElectricBolt,
  Public,
  Security,
  AutoAwesome,
  LocalShipping,
  Lightbulb,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const FeaturesSection = () => {
  const { t } = useTranslation("landing");

  const features = [
    {
      icon: <ElectricBolt sx={{ fontSize: 32 }} />,
      title: t("features.items.0.title"),
      description: t("features.items.0.description"),
    },
    {
      icon: <Public sx={{ fontSize: 32 }} />,
      title: t("features.items.1.title"),
      description: t("features.items.1.description"),
    },
    {
      icon: <Security sx={{ fontSize: 32 }} />,
      title: t("features.items.2.title"),
      description: t("features.items.2.description"),
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 32 }} />,
      title: t("features.items.3.title"),
      description: t("features.items.3.description"),
    },
    {
      icon: <LocalShipping sx={{ fontSize: 32 }} />,
      title: t("features.items.4.title"),
      description: t("features.items.4.description"),
    },
    {
      icon: <Lightbulb sx={{ fontSize: 32 }} />,
      title: t("features.items.5.title"),
      description: t("features.items.5.description"),
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: (theme) => alpha(theme.palette.background.default, 0.5),
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={6} alignItems="center">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              fontWeight={700}
              fontSize={{ xs: "2rem", md: "2.5rem" }}
            >
              {t("features.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600}>
              {t("features.subtitle")}
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: (theme) =>
                          `0 12px 24px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Stack spacing={2}>
                        <Box sx={{ color: "primary.main" }}>{feature.icon}</Box>
                        <Typography variant="h6" fontWeight={600}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};
