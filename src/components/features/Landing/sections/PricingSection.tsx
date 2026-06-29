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
  Chip,
  Divider,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle, Close } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const PricingSection = () => {
  const { t } = useTranslation("landing");

  // 解析功能列表，识别支持和不支持的功能
  const parseFeature = (feature: string) => {
    const isSupported = feature.startsWith("✅");
    const text = feature.replace(/^[✅❌]\s*/, "");
    return { text, isSupported };
  };

  const plans = [
    {
      name: t("pricing.plans.free.name"),
      price: t("pricing.plans.free.price"),
      period: t("pricing.plans.free.period"),
      description: t("pricing.plans.free.description"),
      features: [
        t("pricing.plans.free.features.0"),
        t("pricing.plans.free.features.1"),
        t("pricing.plans.free.features.2"),
        t("pricing.plans.free.features.3"),
        t("pricing.plans.free.features.4"),
        t("pricing.plans.free.features.5"),
      ],
      cta: t("pricing.plans.free.cta"),
      highlighted: false,
      accentColor: "#7c3aed", // 紫色
    },
    {
      name: t("pricing.plans.pro.name"),
      price: t("pricing.plans.pro.price"),
      period: t("pricing.plans.pro.period"),
      description: t("pricing.plans.pro.description"),
      features: [
        t("pricing.plans.pro.features.0"),
        t("pricing.plans.pro.features.1"),
        t("pricing.plans.pro.features.2"),
        t("pricing.plans.pro.features.3"),
        t("pricing.plans.pro.features.4"),
        t("pricing.plans.pro.features.5"),
      ],
      cta: t("pricing.plans.pro.cta"),
      highlighted: true,
      accentColor: "#7c3aed", // 紫色
    },
    {
      name: t("pricing.plans.enterprise.name"),
      price: t("pricing.plans.enterprise.price"),
      period: t("pricing.plans.enterprise.period"),
      description: t("pricing.plans.enterprise.description"),
      features: [
        t("pricing.plans.enterprise.features.0"),
        t("pricing.plans.enterprise.features.1"),
        t("pricing.plans.enterprise.features.2"),
        t("pricing.plans.enterprise.features.3"),
        t("pricing.plans.enterprise.features.4"),
        t("pricing.plans.enterprise.features.5"),
      ],
      cta: t("pricing.plans.enterprise.cta"),
      highlighted: false,
      accentColor: "#ef4444", // 红色
    },
  ];

  return (
    <Box id="pricing" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              fontWeight={700}
              fontSize={{ xs: "2rem", md: "2.5rem" }}
            >
              {t("pricing.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600}>
              {t("pricing.subtitle")}
            </Typography>
          </Stack>

          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {plans.map((plan, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ height: "100%", display: "flex" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      minHeight: 600,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      border: (theme) =>
                        plan.highlighted
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                      transform: plan.highlighted ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: plan.highlighted
                          ? "scale(1.07)"
                          : "scale(1.02)",
                      },
                    }}
                  >
                    {plan.highlighted && (
                      <Chip
                        label={t("pricing.popularBadge")}
                        color="primary"
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <CardContent
                      sx={{
                        p: { xs: 3, md: 4 },
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <Stack spacing={4} sx={{ height: "100%" }}>
                        {/* 标题和价格在同一行 */}
                        <Box>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            sx={{ mb: 1 }}
                          >
                            <Box>
                              <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{ mb: 0.5 }}
                              >
                                {plan.name}
                              </Typography>
                              {/* 彩色下划线 */}
                              <Box
                                sx={{
                                  width: 40,
                                  height: 3,
                                  background: plan.accentColor,
                                  borderRadius: 1.5,
                                }}
                              />
                            </Box>
                            <Typography
                              variant="h4"
                              fontWeight={700}
                              color="text.primary"
                            >
                              {plan.price}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 2 }}
                          >
                            {plan.description}
                          </Typography>
                        </Box>

                        {/* 按钮 */}
                        <Button
                          variant={plan.highlighted ? "contained" : "outlined"}
                          size="large"
                          fullWidth
                          sx={{ py: 1.5, fontWeight: 600 }}
                        >
                          {plan.cta}
                        </Button>

                        {/* 功能列表 */}
                        <Stack spacing={2} sx={{ flex: 1 }}>
                          {plan.features.map((feature, idx) => {
                            const { text, isSupported } = parseFeature(feature);
                            return (
                              <Box key={idx}>
                                {/* 在第3个功能后添加分隔线 */}
                                {idx === 3 && (
                                  <Divider sx={{ my: 2, opacity: 0.3 }} />
                                )}
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="center"
                                >
                                  {isSupported ? (
                                    <CheckCircle
                                      sx={{
                                        color: "success.main",
                                        fontSize: 20,
                                        flexShrink: 0,
                                      }}
                                    />
                                  ) : (
                                    <Close
                                      sx={{
                                        color: "text.disabled",
                                        fontSize: 20,
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: isSupported
                                        ? "text.primary"
                                        : "text.disabled",
                                      textDecoration: isSupported
                                        ? "none"
                                        : "line-through",
                                    }}
                                  >
                                    {text}
                                  </Typography>
                                </Stack>
                              </Box>
                            );
                          })}
                        </Stack>
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
