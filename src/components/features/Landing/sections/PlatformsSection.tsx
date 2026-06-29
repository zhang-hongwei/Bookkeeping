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
import { useTranslation } from "react-i18next";

export const PlatformsSection = () => {
  const { t } = useTranslation("landing");

  const platforms = [
    "Amazon",
    "Shopee",
    "AliExpress",
    "Lazada",
    "eBay",
    "Walmart",
    "Temu",
    "TikTok Shop",
    "Etsy",
    "JD",
    "Taobao",
    "1688",
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={6} alignItems="center">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              fontWeight={700}
              fontSize={{ xs: "2rem", md: "2.5rem" }}
            >
              {t("platforms.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600}>
              {t("platforms.subtitle")}
            </Typography>
          </Stack>

          <Grid container spacing={2} justifyContent="center">
            {platforms.map((platform, index) => (
              <Grid key={index} size={{ xs: 6, sm: 4, md: 3 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    sx={{
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: (theme) =>
                          `0 8px 16px ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                      },
                    }}
                  >
                    <CardContent sx={{ py: 3 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {platform}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            maxWidth={600}
          >
            {t("platforms.footerNote")}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
