"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  alpha,
  useTheme,
  Paper,
  Avatar,
  AvatarGroup,
  Badge,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import { ArrowRightAlt, CheckCircle, Star } from "@mui/icons-material";
import {
  FiTrendingUp,
  FiZap,
  FiShield,
  FiGlobe,
  FiClock,
  FiUsers,
  FiCode,
  FiLayers,
} from "react-icons/fi";
import { SiAmazon, SiShopify } from "react-icons/si";
import { AnimatedBackground } from "./AnimatedBackground";
import { useTranslation } from "react-i18next";

export const HeroSection = () => {
  const theme = useTheme();
  const { t } = useTranslation("landing");

  const statsData = [
    {
      icon: FiTrendingUp,
      label: t("hero.stats.requests"),
      value: "100+",
      trend: "+12 new",
      color: "#10B981",
      subtitle: t("hero.stats.requestsSubtitle"),
    },
    {
      icon: FiZap,
      label: t("hero.stats.uptime"),
      value: "99%",
      color: "#F59E0B",
      subtitle: t("hero.stats.uptimeSubtitle"),
    },
    {
      icon: FiShield,
      label: t("hero.stats.reliability"),
      value: "100%",
      color: "#6366F1",
      subtitle: t("hero.stats.reliabilitySubtitle"),
    },
  ];

  const platforms = [
    { name: "Next.js 16", icon: FiGlobe, color: "#000000" },
    { name: "React 19", icon: FiZap, color: "#61DAFB" },
    { name: "MUI v7", icon: FiGlobe, color: "#007FFF" },
    { name: "TypeScript", icon: FiShield, color: "#3178C6" },
    { name: "PostgreSQL", icon: FiGlobe, color: "#336791" },
    { name: "Drizzle ORM", icon: FiGlobe, color: "#10B981" },
  ];

  const benefits = [
    t("hero.benefits.realtime"),
    t("hero.benefits.multiPlatform"),
    t("hero.benefits.secure"),
  ];

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha("#F3F4F6", 1)} 0%, ${alpha("#E0E7FF", 0.5)} 50%, ${alpha("#DDD6FE", 0.3)} 100%)`,
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: 10 }}>
        <Grid container spacing={8} alignItems="center">
          {/* Left Column - Content */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={4}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                    fontWeight: 800,
                    mb: 2,
                    lineHeight: 1.1,
                    color: theme.palette.text.primary,
                  }}
                >
                  Maximize Your{" "}
                  <Box
                    component="span"
                    sx={{
                      background: `linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Productivity
                  </Box>
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    fontWeight: 400,
                    lineHeight: 1.6,
                    maxWidth: 500,
                  }}
                >
                  {t("hero.description")}
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRightAlt />}
                    sx={{
                      px: 5,
                      py: 2,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: 50,
                      background: `linear-gradient(135deg, #EC4899 0%, #F472B6 100%)`,
                      boxShadow: `0 12px 32px ${alpha("#EC4899", 0.3)}`,
                      textTransform: "none",
                      "&:hover": {
                        background: `linear-gradient(135deg, #DB2777 0%, #EC4899 100%)`,
                        boxShadow: `0 16px 40px ${alpha("#EC4899", 0.4)}`,
                      },
                    }}
                  >
                    {t("hero.cta.getApiKey")}
                  </Button>
                  <Chip
                    icon={<Star sx={{ color: "#F59E0B !important" }} />}
                    label={
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2" fontWeight={700}>
                          Trustpilot
                        </Typography>
                        <Typography variant="body2">4.8</Typography>
                      </Stack>
                    }
                    sx={{
                      px: 2,
                      py: 3,
                      fontSize: "1rem",
                      bgcolor: "white",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.2),
                      boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
                    }}
                  />
                </Stack>
              </motion.div>

              {/* Bottom Purple Card with Features */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Box
                  sx={{
                    mt: 6,
                    p: 4,
                    borderRadius: 6,
                    background: `linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)`,
                    boxShadow: `0 20px 60px ${alpha("#7C3AED", 0.3)}`,
                  }}
                >
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha("#FFFFFF", 0.2),
                          }}
                        >
                          <FiCode size={24} color="white" />
                        </Box>
                        <Typography variant="h6" fontWeight={700} color="white">
                          Custom Workflow
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: alpha("#FFFFFF", 0.9) }}
                        >
                          Build your own workflow with our powerful API
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha("#FFFFFF", 0.2),
                          }}
                        >
                          <FiLayers size={24} color="white" />
                        </Box>
                        <Typography variant="h6" fontWeight={700} color="white">
                          Multi-team projects
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: alpha("#FFFFFF", 0.9) }}
                        >
                          Collaborate with your team seamlessly
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>
            </Stack>
          </Grid>

          {/* Right Column - Product Mockup */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ position: "relative", height: "700px" }}>
              {/* Main Phone Mockup */}
              <motion.div
                initial={{ opacity: 0, x: 50, rotate: -5 }}
                animate={{ opacity: 1, x: 0, rotate: 8 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 2,
                }}
              >
                <Card
                  sx={{
                    width: 320,
                    height: 640,
                    borderRadius: 8,
                    background:
                      "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
                    border: "12px solid #1F2937",
                    boxShadow: `0 40px 100px ${alpha("#000000", 0.2)}`,
                    overflow: "hidden",
                  }}
                >
                  <CardContent sx={{ p: 3, height: "100%" }}>
                    <Stack spacing={2}>
                      {/* Phone Header */}
                      <Box sx={{ textAlign: "center", mb: 2 }}>
                        <Typography variant="h6" fontWeight={700}>
                          Dev Tools
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Dashboard
                        </Typography>
                      </Box>

                      {/* Stats Cards */}
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          background: `linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: alpha("#FFFFFF", 0.9), mb: 1 }}
                        >
                          Active Projects
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="white">
                          24
                        </Typography>
                      </Box>

                      <Grid container spacing={1.5}>
                        <Grid size={6}>
                          <Paper sx={{ p: 2, borderRadius: 3 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Tasks
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              156
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid size={6}>
                          <Paper sx={{ p: 2, borderRadius: 3 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Completed
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              89%
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Team Members */}
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1.5 }}
                        >
                          Team Members
                        </Typography>
                        <AvatarGroup max={5}>
                          <Avatar sx={{ bgcolor: "#EC4899" }}>A</Avatar>
                          <Avatar sx={{ bgcolor: "#8B5CF6" }}>B</Avatar>
                          <Avatar sx={{ bgcolor: "#3B82F6" }}>C</Avatar>
                          <Avatar sx={{ bgcolor: "#10B981" }}>D</Avatar>
                          <Avatar sx={{ bgcolor: "#F59E0B" }}>E</Avatar>
                        </AvatarGroup>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Floating Stats Card - Top Right */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{
                  position: "absolute",
                  top: 40,
                  right: -20,
                  zIndex: 3,
                }}
              >
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: alpha("#FFFFFF", 0.95),
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${alpha("#E5E7EB", 0.5)}`,
                    boxShadow: `0 12px 32px ${alpha("#000000", 0.1)}`,
                    minWidth: 200,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha("#8B5CF6", 0.1),
                      }}
                    >
                      <FiTrendingUp size={24} color="#8B5CF6" />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("hero.stats.requests")}
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        100+
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>

              {/* Floating User Card - Bottom Left */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{
                  position: "absolute",
                  bottom: 80,
                  left: -40,
                  zIndex: 3,
                }}
              >
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: alpha("#FFFFFF", 0.95),
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${alpha("#E5E7EB", 0.5)}`,
                    boxShadow: `0 12px 32px ${alpha("#000000", 0.1)}`,
                    minWidth: 220,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <AvatarGroup
                      max={3}
                      sx={{
                        "& .MuiAvatar-root": {
                          width: 28,
                          height: 28,
                          fontSize: "0.75rem",
                        },
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#EC4899" }}>J</Avatar>
                      <Avatar sx={{ bgcolor: "#8B5CF6" }}>M</Avatar>
                      <Avatar sx={{ bgcolor: "#3B82F6" }}>S</Avatar>
                    </AvatarGroup>
                    <Typography variant="body2" fontWeight={600}>
                      {t("hero.activeUsers")}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {t("hero.activeUsersDesc")}
                  </Typography>
                </Paper>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
