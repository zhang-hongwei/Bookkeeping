"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  RocketLaunch,
  Book,
  Code,
  Storage,
  ArrowRightAlt,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const DeveloperExperienceSection = () => {
  const { t } = useTranslation("landing");

  const features = [
    {
      icon: <RocketLaunch sx={{ fontSize: 32 }} />,
      title: t("developer.features.0.title"),
      description: t("developer.features.0.description"),
    },
    {
      icon: <Book sx={{ fontSize: 32 }} />,
      title: t("developer.features.1.title"),
      description: t("developer.features.1.description"),
    },
    {
      icon: <Code sx={{ fontSize: 32 }} />,
      title: t("developer.features.2.title"),
      description: t("developer.features.2.description"),
    },
    {
      icon: <Storage sx={{ fontSize: 32 }} />,
      title: t("developer.features.3.title"),
      description: t("developer.features.3.description"),
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
        <Stack spacing={6}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              fontWeight={700}
              fontSize={{ xs: "2rem", md: "2.5rem" }}
            >
              {t("developer.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600}>
              {t("developer.subtitle")}
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6 }}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 4 }}>
                      <Stack
                        direction="row"
                        spacing={3}
                        alignItems="flex-start"
                      >
                        <Box sx={{ color: "primary.main", flexShrink: 0 }}>
                          {feature.icon}
                        </Box>
                        <Stack spacing={1}>
                          <Typography variant="h6" fontWeight={600}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Stack alignItems="center">
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowRightAlt />}
              sx={{ px: 4, py: 1.5, fontWeight: 600 }}
            >
              {t("developer.cta")}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
