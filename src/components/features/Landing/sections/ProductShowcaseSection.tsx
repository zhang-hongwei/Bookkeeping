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
  useTheme,
} from "@mui/material";
import { Code, Article } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const ProductShowcaseSection = () => {
  const theme = useTheme();
  const { t } = useTranslation("landing");

  const codeExample = `curl https://api.yourdomain.com/v1/products?asin=B09XYZ123 \\
  -H "Authorization: Bearer sk_123..."`;

  const responseExample = `{
  "title": "Apple AirPods Pro 2",
  "price": "$249.00",
  "rating": 4.8,
  "platform": "Amazon",
  "updated_at": "2025-10-17T10:00:00Z"
}`;

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
              {t("showcase.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600}>
              {t("showcase.subtitle")}
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Code />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {t("showcase.request")}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box
                    component="pre"
                    sx={{
                      p: 3,
                      m: 0,
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      overflow: "auto",
                      background: alpha(theme.palette.background.default, 0.3),
                    }}
                  >
                    {codeExample}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Article />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {t("showcase.response")}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box
                    component="pre"
                    sx={{
                      p: 3,
                      m: 0,
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      overflow: "auto",
                      background: alpha(theme.palette.background.default, 0.3),
                      color: theme.palette.success.main,
                    }}
                  >
                    {responseExample}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};
