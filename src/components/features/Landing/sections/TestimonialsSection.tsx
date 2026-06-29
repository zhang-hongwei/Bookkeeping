"use client";

import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export const TestimonialsSection = () => {
  const { t } = useTranslation("landing");

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              fontWeight={700}
              fontSize={{ xs: "2rem", md: "2.5rem" }}
            >
              {t("testimonials.title")}
            </Typography>
          </Stack>

          <Card
            sx={{
              maxWidth: 800,
              mx: "auto",
              background: (theme) => alpha(theme.palette.background.paper, 0.6),
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h6" fontWeight={500} sx={{ mb: 3 }}>
                "{t("testimonials.items.0.quote")}"
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}
              >
                {t("testimonials.items.0.author")}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};
